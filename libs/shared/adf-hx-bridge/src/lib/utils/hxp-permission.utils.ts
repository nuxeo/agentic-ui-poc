import {
  resolveAcePrincipal,
  type NuxeoAce,
  type NuxeoAcl,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

export interface HxpPermissionRow {
  id: string;
  username: string;
  permission: string;
  permissionLabel: string;
  timeFrame: string;
  grantedBy: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  Everything: 'Manage everything',
  ReadWrite: 'Edit',
  Read: 'Read',
  Write: 'Write',
  ReadRemove: 'Read & Remove',
  AddChildren: 'Add Children',
  Remove: 'Remove',
  ManageWorkflows: 'Manage Workflows',
  ReadCanCollect: 'Can collect',
};

export function hxpPermissionLabel(permission: string): string {
  return PERMISSION_LABELS[permission] ?? permission;
}

export function hxpAceTimeFrame(ace: NuxeoAce): string {
  if (!ace.begin && !ace.end) {
    return 'Permanent';
  }
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  if (!ace.begin && ace.end) {
    return `Until ${fmt(ace.end)}`;
  }
  const parts: string[] = [];
  if (ace.begin) {
    parts.push(`from ${fmt(ace.begin)}`);
  }
  if (ace.end) {
    parts.push(`to ${fmt(ace.end)}`);
  }
  return parts.join(' ');
}

export function hxpDisplayAceUsername(ace: NuxeoAce): string {
  return resolveAcePrincipal(ace.username).replace(/^transient\//, '');
}

export function hxpAceGrantedBy(ace: NuxeoAce): string {
  const creator = ace.creator ? resolveAcePrincipal(ace.creator) : '';
  return creator || '—';
}

export function hxpMapAceToRow(ace: NuxeoAce): HxpPermissionRow {
  return {
    id: ace.id,
    username: hxpDisplayAceUsername(ace),
    permission: ace.permission,
    permissionLabel: hxpPermissionLabel(ace.permission),
    timeFrame: hxpAceTimeFrame(ace),
    grantedBy: hxpAceGrantedBy(ace),
  };
}

function readAcls(doc: NuxeoDocument | null | undefined): NuxeoAcl[] {
  const acls = doc?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
  return acls ?? [];
}

export function hxpLocalAces(doc: NuxeoDocument | null | undefined): HxpPermissionRow[] {
  const local = readAcls(doc).find((acl) => acl.name === 'local');
  return (local?.aces ?? []).filter((ace) => ace.granted && !ace.externalUser).map(hxpMapAceToRow);
}

export function hxpInheritedAces(doc: NuxeoDocument | null | undefined): HxpPermissionRow[] {
  const inherited = readAcls(doc).find((acl) => acl.name === 'inherited');
  return (inherited?.aces ?? []).filter((ace) => ace.granted).map(hxpMapAceToRow);
}

export function hxpExternalAces(doc: NuxeoDocument | null | undefined): HxpPermissionRow[] {
  return readAcls(doc)
    .flatMap((acl) => acl.aces ?? [])
    .filter((ace) => ace.externalUser && ace.granted)
    .map(hxpMapAceToRow);
}

export function hxpIsInheritanceBlocked(doc: NuxeoDocument | null | undefined): boolean {
  const acls = readAcls(doc);
  return acls.length > 0 && !acls.some((acl) => acl.name === 'inherited');
}

export function hxpDocumentTags(doc: NuxeoDocument | null | undefined): string[] {
  const raw = doc?.properties?.['nxtag:tags'] as Array<{ label: string } | string> | undefined;
  if (!raw) {
    return [];
  }
  return raw.map((tag) => (typeof tag === 'string' ? tag : tag.label));
}

export function hxpIsSubscribed(doc: NuxeoDocument | null | undefined): boolean {
  const notifs = doc?.contextParameters?.['subscribedNotifications'] as string[] | undefined;
  return !!notifs?.length;
}
