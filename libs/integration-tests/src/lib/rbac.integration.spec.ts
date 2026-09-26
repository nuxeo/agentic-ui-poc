/**
 * RBAC and permissions integration tests.
 *
 * Stage 7 of the integration-test plan: RBAC and Guards.
 * Tests permission service and ACL operations against live Nuxeo with real permissions.
 *
 * Tests:
 * - Non-admin user creation/deletion
 * - Permission grants and revocations
 * - ACL read/write with inherited vs local ACLs
 * - Permission checks (canRead, canWrite)
 * - Admin vs non-admin access patterns
 *
 * Acceptance criteria (from audit §11 Stage 7), and where each stands:
 * - At least one test runs as a non-admin and is denied — met, several times over.
 * - ACL operations test real inherited-vs-local behavior — met.
 * - User cleanup happens even on failure — **not tested here, and no longer claimed to be.**
 *   `deleteUser` throws when the server refuses, and the `afterEach` below awaits it, so a
 *   cleanup failure fails the run. What that does not establish is the stated criterion: that
 *   cleanup still runs when the *test body* throws. The test that used to sit here created a
 *   user, asserted it existed, deliberately did not throw, and ended before `afterEach` ran —
 *   it could not observe cleanup at all and passed with the cleanup loop neutered (verified).
 *   Demonstrating the criterion needs a deliberately-failing test in an isolated child run,
 *   which this suite has no way to host; it was deleted rather than left reading as coverage.
 *
 * ## One repository fact every permission assertion here depends on
 *
 * The root document grants `members:Read`, and an authenticated Nuxeo user is a member — so a
 * freshly created no-group user **can read** anything under `/default-domain` by inheritance.
 * A test that wants to observe a denial must therefore block inheritance first and assert that
 * the block succeeded. Measured 2026-09-23: `GET /api/v1/path/@acl` → `members:Read:true`.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { setupIntegrationHarness, createTestDocument } from './integration-harness';
import {
  blockPermissionInheritance,
  createNonAdminUser,
  deleteUser,
  grantPermission,
  readAces,
  revokePermission,
  canRead,
  canWrite,
  type TestUser,
} from './user-fixtures';

describe('RBAC and Permissions Integration Tests', () => {
  const harness = setupIntegrationHarness();

  // Track created users for cleanup
  const createdUsers: string[] = [];

  afterEach(async () => {
    // Clean up any users created during tests
    for (const username of createdUsers) {
      await deleteUser(harness, username);
    }
    createdUsers.length = 0;
  }, 30000);

  describe('Non-Admin User Creation', () => {
    it('can create a non-admin user', async () => {
      const user = await createNonAdminUser(harness, {
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Test',
      });

      createdUsers.push(user.username);

      expect(user.username).toContain('alice');
      expect(user.username).toContain(harness.runId); // Scoped to run
      expect(user.auth).toMatch(/^Basic /);
      expect(user.nuxeoUser).toBeDefined();
      expect(user.nuxeoUser.properties.username).toBe(user.username);

      console.log(`[rbac] Created non-admin user: ${user.username}`);
    });

    it('created user can authenticate', async () => {
      const user = await createNonAdminUser(harness, {
        username: 'bob',
      });

      createdUsers.push(user.username);

      // Try to authenticate as this user
      const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/user/${user.username}`, {
        headers: {
          Authorization: user.auth,
        },
      });

      expect(res.status).toBe(200);

      const userData: any = await res.json();
      expect(userData.id).toBe(user.username);
      expect(userData.properties.username).toBe(user.username);

      console.log(`[rbac] User ${user.username} authenticated successfully`);
    });

    it('can delete a user', async () => {
      const user = await createNonAdminUser(harness, {
        username: 'charlie',
      });

      // Delete immediately (not via cleanup)
      await deleteUser(harness, user.username);

      // Verify user is gone - should get 404
      const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/user/${user.username}`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(res.status).toBe(404);

      console.log(`[rbac] User ${user.username} deleted successfully`);
    });
  });

  describe('Permission Grants and Revocations', () => {
    let testUser: TestUser;

    beforeEach(async () => {
      testUser = await createNonAdminUser(harness, {
        username: 'permuser',
      });
      createdUsers.push(testUser.username);
    });

    it('blocking ACL inheritance removes a non-admin user’s inherited read access', async () => {
      // Create document as admin in data root
      const doc = await createTestDocument(harness, {
        type: 'File',
        name: 'restricted-doc',
        title: 'Restricted Document',
      });

      // The inherited access, asserted before it is taken away. Without this the test cannot
      // tell "the block worked" from "the user never had access" — which is precisely what the
      // previous version could not tell, and it discarded the response of an operation that was
      // answering HTTP 500. See `blockPermissionInheritance`.
      expect(
        await canRead(harness, testUser.auth, doc.uid),
        'a no-group user should inherit members:Read from the repository root',
      ).toBe(true);

      await blockPermissionInheritance(harness, doc.uid);

      expect(await canRead(harness, testUser.auth, doc.uid)).toBe(false);

      console.log(`[rbac] Non-admin user denied read access with blocked inheritance`);
    });

    it('can grant Read permission to non-admin user', async () => {
      // Create document as admin
      const doc = await createTestDocument(harness, {
        type: 'File',
        name: 'shared-doc',
        title: 'Shared Document',
      });

      // Inheritance blocked first, so the grant below is the only thing that can produce read
      // access — otherwise the "initially cannot read" line is false on this repository and the
      // grant proves nothing about the grant.
      await blockPermissionInheritance(harness, doc.uid);
      expect(await canRead(harness, testUser.auth, doc.uid)).toBe(false);

      // Grant Read permission
      await grantPermission(harness, doc.uid, testUser.username, 'Read');

      // Now user can read
      const canAccess = await canRead(harness, testUser.auth, doc.uid);
      expect(canAccess).toBe(true);

      // But user still cannot write
      const canModify = await canWrite(harness, testUser.auth, doc.uid);
      expect(canModify).toBe(false);

      console.log(`[rbac] Non-admin user granted Read permission successfully`);
    });

    it('can grant ReadWrite permission to non-admin user', async () => {
      // Create document as admin
      const doc = await createTestDocument(harness, {
        type: 'File',
        name: 'editable-doc',
        title: 'Editable Document',
      });

      // Grant ReadWrite permission
      await grantPermission(harness, doc.uid, testUser.username, 'ReadWrite');

      // User can read
      expect(await canRead(harness, testUser.auth, doc.uid)).toBe(true);

      // User can write
      expect(await canWrite(harness, testUser.auth, doc.uid)).toBe(true);

      console.log(`[rbac] Non-admin user granted ReadWrite permission successfully`);
    });

    it('can revoke permission from non-admin user', async () => {
      // Create document and grant permission
      const doc = await createTestDocument(harness, {
        type: 'File',
        name: 'revoke-test-doc',
        title: 'Revoke Test Document',
      });

      // Same reason as the grant test: with inheritance in place, revoking the local Read leaves
      // the inherited one and the closing assertion cannot come true.
      await blockPermissionInheritance(harness, doc.uid);

      await grantPermission(harness, doc.uid, testUser.username, 'Read');

      // Verify user can read
      expect(await canRead(harness, testUser.auth, doc.uid)).toBe(true);

      // Revoke permission
      await revokePermission(harness, doc.uid, testUser.username);

      // Now user cannot read
      const canAccess = await canRead(harness, testUser.auth, doc.uid);
      expect(canAccess).toBe(false);

      console.log(`[rbac] Permission revoked from non-admin user successfully`);
    });
  });

  describe('ACL Operations', () => {
    let testUser: TestUser;

    beforeEach(async () => {
      testUser = await createNonAdminUser(harness, {
        username: 'acluser',
      });
      createdUsers.push(testUser.username);
    });

    it('can read ACL entries on a document', async () => {
      const doc = await createTestDocument(harness, {
        type: 'File',
        name: 'acl-test-doc',
        title: 'ACL Test Document',
      });

      // Grant permission
      await grantPermission(harness, doc.uid, testUser.username, 'Read');

      // `readAces` reads `acl[].ace`. This test used to read `acl[].aces`, which the server
      // never sends, so it counted zero ACEs on a document it had just granted a permission on
      // and failed — honestly, but for a reason that had nothing to do with ACLs.
      const allEntries = await readAces(harness, doc.uid);

      expect(allEntries.length).toBeGreaterThan(0);

      // Find our user's ACE
      const userAce = allEntries.find((e) => e.username === testUser.username);
      expect(userAce).toBeDefined();
      expect(userAce?.permission).toBe('Read');
      expect(userAce?.granted).toBe(true);

      console.log(`[rbac] Read ACL entries: found ${allEntries.length} total ACEs`);
    });

    it('distinguishes local vs inherited ACL entries', async () => {
      // Create parent folder
      const parentFolder = await createTestDocument(harness, {
        type: 'Folder',
        name: 'parent-folder',
        title: 'Parent Folder',
      });

      // Grant permission on parent
      await grantPermission(harness, parentFolder.uid, testUser.username, 'Read');

      // Create child document in parent
      const child: any = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${parentFolder.path}`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          type: 'File',
          name: 'child-doc',
          properties: {
            'dc:title': 'Child Document',
          },
        }),
      }).then((r) => r.json());

      const childAces = await readAces(harness, child.uid);

      // This is the distinction the test is named for, and it was not asserted: the child can be
      // read, and the ACE that permits it is on the *inherited* ACL, not a local one. Granting
      // the permission on the child instead would leave the read assertion green — so without
      // this pair the test does not tell local from inherited at all.
      expect(await canRead(harness, testUser.auth, child.uid)).toBe(true);

      const userAces = childAces.filter((ace) => ace.username === testUser.username);
      expect(userAces.length).toBeGreaterThan(0);
      expect(userAces.map((ace) => ace.aclName)).not.toContain('local');
      expect(userAces.every((ace) => ace.aclName === 'inherited')).toBe(true);

      console.log(
        `[rbac] Child inherits ${userAces.length} ACE(s) for ${testUser.username} from parent, ` +
          `none local (${childAces.length} total ACEs)`,
      );
    });

    it('can add local ACL entry on child that overrides inherited', async () => {
      // Create parent with Read permission
      const parentFolder: any = await createTestDocument(harness, {
        type: 'Folder',
        name: 'override-parent',
        title: 'Override Parent',
      });

      await grantPermission(harness, parentFolder.uid, testUser.username, 'Read');

      // Create child
      const child: any = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${parentFolder.path}`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          type: 'File',
          name: 'override-child',
          properties: {
            'dc:title': 'Override Child',
          },
        }),
      }).then((r) => r.json());

      // Initially child inherits Read from parent
      expect(await canRead(harness, testUser.auth, child.uid)).toBe(true);
      expect(await canWrite(harness, testUser.auth, child.uid)).toBe(false);

      // Add local ReadWrite permission on child
      await grantPermission(harness, child.uid, testUser.username, 'ReadWrite');

      // Now child has ReadWrite (local entry)
      expect(await canRead(harness, testUser.auth, child.uid)).toBe(true);
      expect(await canWrite(harness, testUser.auth, child.uid)).toBe(true);

      console.log(`[rbac] Local ACL entry on child overrides inherited permission`);
    });
  });

  describe('Admin vs Non-Admin Access Patterns', () => {
    let nonAdminUser: TestUser;

    beforeEach(async () => {
      nonAdminUser = await createNonAdminUser(harness, {
        username: 'regularuser',
      });
      createdUsers.push(nonAdminUser.username);
    });

    it('admin can access all documents in data root', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'admin-doc',
        title: 'Admin Document',
      });

      // Admin can read and write
      const readRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(readRes.status).toBe(200);

      const writeRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          properties: {
            'dc:description': 'Updated by admin',
          },
        }),
      });

      expect(writeRes.status).toBe(200);

      console.log(`[rbac] Admin has full access to all documents`);
    });

    it('non-admin cannot write to documents without explicit permission (DENIED)', async () => {
      // This is the acceptance criterion: at least one test runs as non-admin and is denied
      // Note: Nuxeo workspaces may grant default READ access, but WRITE should be denied
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'no-write-doc',
        title: 'No Write Document',
      });

      // Non-admin user should NOT be able to write (even if they can read)
      const canAccessWrite = await canWrite(harness, nonAdminUser.auth, doc.uid);
      expect(canAccessWrite).toBe(false);

      console.log(`[rbac] ✅ NON-ADMIN USER DENIED WRITE ACCESS (acceptance criterion met)`);
    });

    it('explicit permissions change access level for non-admin user', async () => {
      const doc1: any = await createTestDocument(harness, {
        type: 'File',
        name: 'write-granted-doc',
        title: 'Write Granted Document',
      });

      const doc2: any = await createTestDocument(harness, {
        type: 'File',
        name: 'write-denied-doc',
        title: 'Write Denied Document',
      });

      // Initially both docs should deny write access
      expect(await canWrite(harness, nonAdminUser.auth, doc1.uid)).toBe(false);
      expect(await canWrite(harness, nonAdminUser.auth, doc2.uid)).toBe(false);

      // Grant ReadWrite permission on doc1 only
      await grantPermission(harness, doc1.uid, nonAdminUser.username, 'ReadWrite');

      // User can NOW write to doc1
      expect(await canWrite(harness, nonAdminUser.auth, doc1.uid)).toBe(true);

      // User still CANNOT write to doc2
      expect(await canWrite(harness, nonAdminUser.auth, doc2.uid)).toBe(false);

      console.log(`[rbac] Explicit permission grant changed write access for non-admin`);
    });

    it('non-admin cannot delete documents without permissions', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'delete-test-doc',
        title: 'Delete Test Document',
      });

      // Try to delete as non-admin (should fail)
      const deleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'DELETE',
        headers: {
          Authorization: nonAdminUser.auth,
        },
      });

      // Should be denied (403 or 404 if user can't even see it)
      expect([403, 404]).toContain(deleteRes.status);

      // Verify document still exists (query as admin)
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(verifyRes.status).toBe(200);

      console.log(`[rbac] Non-admin denied delete operation (expected 403 or 404)`);
    });

    // Deleting in Nuxeo takes `Remove` on the document **and** `RemoveChildren` on its parent.
    // The previous version granted only the first two and then accepted `[204, 403]`, so the
    // outcome it recorded as success — 403 — was the same outcome as before any grant at all:
    // deleting both `grantPermission` calls left the test green (verified). It is a folder here
    // rather than the data root so the parent grant cannot affect the other tests in this file.
    it('non-admin with Remove on the document and RemoveChildren on its parent can delete it', async () => {
      const folder = await createTestDocument(harness, {
        type: 'Folder',
        name: 'deletable-parent',
        title: 'Deletable Parent',
      });

      const doc: { uid: string } = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/path${folder.path}`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'entity-type': 'document',
            type: 'File',
            name: 'deletable-doc',
            properties: { 'dc:title': 'Deletable Document' },
          }),
        },
      ).then((r) => r.json());

      await grantPermission(harness, doc.uid, nonAdminUser.username, 'ReadWrite');
      await grantPermission(harness, doc.uid, nonAdminUser.username, 'Remove');
      await grantPermission(harness, folder.uid, nonAdminUser.username, 'RemoveChildren');

      const deleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'DELETE',
        headers: {
          Authorization: nonAdminUser.auth,
        },
      });

      // 204, required. A denial is not an acceptable outcome for a test named for a permitted
      // delete; if a deployment genuinely refuses this, that is a precondition to state, not a
      // branch to pass on.
      expect(deleteRes.status).toBe(204);

      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(verifyRes.status).toBe(404);
      console.log(`[rbac] Non-admin with Remove + RemoveChildren deleted the document (404 after)`);
    });
  });
});
