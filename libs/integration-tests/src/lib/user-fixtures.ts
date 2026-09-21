/**
 * Non-administrator user fixtures for RBAC testing.
 *
 * Stage 7 of the integration-test plan: RBAC and Guards.
 * The missing ingredient — fixtures.ts hardcodes isAdministrator=true and groups=[].
 *
 * Creates/deletes non-admin Nuxeo users for permission testing.
 * Each user is scoped to a test run to prevent conflicts.
 *
 * Usage:
 *   const user = await createNonAdminUser(harness, { username: 'testuser' });
 *   // ... run tests with user.credentials ...
 *   await deleteUser(harness, user.username);
 */

export interface TestUser {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Basic auth header: `Basic ${base64(username:password)}` */
  auth: string;
  /** Full user object from Nuxeo */
  nuxeoUser: any;
}

export interface CreateUserOptions {
  /** Username (will be prefixed with runId for uniqueness). Default: 'testuser' */
  username?: string;
  /** Password. Default: 'TestPass123!' */
  password?: string;
  /** Email. Default: {username}@test.local */
  email?: string;
  /** First name. Default: 'Test' */
  firstName?: string;
  /** Last name. Default: 'User' */
  lastName?: string;
  /** Groups to add user to. Default: [] (no groups for maximum isolation) */
  groups?: string[];
}

/**
 * Create a non-administrator test user in Nuxeo.
 *
 * The user is scoped to the test run (username prefixed with runId) to prevent conflicts.
 * By default, user has NO groups for maximum isolation and to ensure permission tests work correctly.
 *
 * **Important:** Call `deleteUser()` in test cleanup to remove the user.
 *
 * @param harness Integration test harness (provides nuxeoUrl, auth, runId)
 * @param options User creation options
 * @returns TestUser with credentials and auth header
 */
export async function createNonAdminUser(
  harness: { nuxeoUrl: string; auth: string; runId: string },
  options: CreateUserOptions = {},
): Promise<TestUser> {
  const {
    username = 'testuser',
    password = 'TestPass123!',
    email,
    firstName = 'Test',
    lastName = 'User',
    groups = [], // NO groups by default for isolation
  } = options;

  // Scope username to test run to prevent conflicts
  const scopedUsername = `${username}-${harness.runId}`;
  const userEmail = email ?? `${scopedUsername}@test.local`;

  // Create user via Nuxeo User Manager API
  const createRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/user`, {
    method: 'POST',
    headers: {
      'Authorization': harness.auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'entity-type': 'user',
      id: scopedUsername,
      properties: {
        username: scopedUsername,
        password,
        email: userEmail,
        firstName,
        lastName,
        groups,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(
      `Failed to create test user '${scopedUsername}': ${createRes.status} ${errorText}`,
    );
  }

  const nuxeoUser = await createRes.json();

  // Generate Basic auth header for this user
  const auth = `Basic ${Buffer.from(`${scopedUsername}:${password}`).toString('base64')}`;

  console.log(`[user-fixtures] Created non-admin user: ${scopedUsername}`);

  return {
    username: scopedUsername,
    password,
    email: userEmail,
    firstName,
    lastName,
    auth,
    nuxeoUser,
  };
}

/**
 * Delete a test user from Nuxeo.
 *
 * Should be called in test cleanup to remove users created with `createNonAdminUser()`.
 *
 * @param harness Integration test harness (provides nuxeoUrl, auth)
 * @param username Username to delete (the scoped username, not the base name)
 */
export async function deleteUser(
  harness: { nuxeoUrl: string; auth: string },
  username: string,
): Promise<void> {
  const deleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/user/${username}`, {
    method: 'DELETE',
    headers: {
      'Authorization': harness.auth,
    },
  });

  if (!deleteRes.ok && deleteRes.status !== 404) {
    // 404 is ok - user already deleted or never existed
    const errorText = await deleteRes.text();
    console.warn(
      `[user-fixtures] Failed to delete user '${username}': ${deleteRes.status} ${errorText}`,
    );
  } else {
    console.log(`[user-fixtures] Deleted test user: ${username}`);
  }
}

/**
 * Grant ACL entry on a document to a user.
 *
 * @param harness Integration test harness
 * @param docId Document UID to grant permission on
 * @param username Username to grant permission to
 * @param permission Permission to grant (e.g., 'Read', 'ReadWrite', 'Everything')
 */
export async function grantPermission(
  harness: { nuxeoUrl: string; auth: string },
  docId: string,
  username: string,
  permission: string,
): Promise<void> {
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docId}/@op/Document.AddPermission`, {
    method: 'POST',
    headers: {
      'Authorization': harness.auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      params: {
        username,
        permission,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to grant ${permission} to ${username} on ${docId}: ${res.status} ${errorText}`,
    );
  }

  console.log(`[user-fixtures] Granted ${permission} to ${username} on doc ${docId}`);
}

/**
 * Remove ACL entry from a document for a user.
 *
 * @param harness Integration test harness
 * @param docId Document UID to remove permission from
 * @param username Username to remove permission from
 */
export async function revokePermission(
  harness: { nuxeoUrl: string; auth: string },
  docId: string,
  username: string,
): Promise<void> {
  // Get current ACLs
  const getRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docId}/@acl`, {
    headers: {
      'Authorization': harness.auth,
    },
  });

  if (!getRes.ok) {
    throw new Error(`Failed to get ACL for ${docId}: ${getRes.status}`);
  }

  const acl: any = await getRes.json();

  // Find ACE for this user
  const ace = acl.entries?.find((e: any) => e.username === username);
  if (!ace) {
    console.log(`[user-fixtures] No ACE found for ${username} on ${docId}, nothing to revoke`);
    return;
  }

  // Remove via Document.RemovePermission
  const removeRes = await fetch(
    `${harness.nuxeoUrl}/nuxeo/api/v1/id/${docId}/@op/Document.RemovePermission`,
    {
      method: 'POST',
      headers: {
        'Authorization': harness.auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: {
          id: ace.id,
        },
      }),
    },
  );

  if (!removeRes.ok) {
    const errorText = await removeRes.text();
    throw new Error(
      `Failed to revoke permission from ${username} on ${docId}: ${removeRes.status} ${errorText}`,
    );
  }

  console.log(`[user-fixtures] Revoked permission from ${username} on doc ${docId}`);
}

/**
 * Check if a user can read a document.
 *
 * Performs a GET request as the user and returns true if successful, false if 403/404.
 *
 * @param harness Integration test harness (only needs nuxeoUrl)
 * @param userAuth User's auth header (from TestUser.auth)
 * @param docId Document UID to check
 * @returns true if user can read, false otherwise
 */
export async function canRead(
  harness: { nuxeoUrl: string },
  userAuth: string,
  docId: string,
): Promise<boolean> {
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docId}`, {
    headers: {
      'Authorization': userAuth,
    },
  });

  return res.ok;
}

/**
 * Check if a user can write to a document.
 *
 * Performs a property update as the user and returns true if successful, false if 403/404.
 *
 * @param harness Integration test harness (only needs nuxeoUrl)
 * @param userAuth User's auth header (from TestUser.auth)
 * @param docId Document UID to check
 * @returns true if user can write, false otherwise
 */
export async function canWrite(
  harness: { nuxeoUrl: string },
  userAuth: string,
  docId: string,
): Promise<boolean> {
  // Try to update a property (dc:description)
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docId}`, {
    method: 'PUT',
    headers: {
      'Authorization': userAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'entity-type': 'document',
      properties: {
        'dc:description': `Test write check ${Date.now()}`,
      },
    }),
  });

  return res.ok;
}
