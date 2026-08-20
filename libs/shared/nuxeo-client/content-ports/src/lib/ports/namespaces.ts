import type { NamespaceRef } from '../domain/refs';

/**
 * Brands a raw namespace name. Internal to this package — the single place raw
 * strings become branded refs. Adapters import the constants below and must not
 * brand their own.
 */
function brand(name: string): NamespaceRef {
  return name as NamespaceRef;
}

/**
 * The single source of truth for namespace constants. Adapters declare which of
 * these they populate via their capability descriptor.
 */
export const SYS: NamespaceRef = brand('sys');
export const SYSVER: NamespaceRef = brand('sysver');
export const SYSFILE: NamespaceRef = brand('sysfile');
export const SYSGOV: NamespaceRef = brand('sysgov');
export const SYSRENDITION: NamespaceRef = brand('sysrendition');
export const DC: NamespaceRef = brand('dc');
export const FILE: NamespaceRef = brand('file');
