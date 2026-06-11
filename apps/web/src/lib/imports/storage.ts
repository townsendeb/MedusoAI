const ACTIVE_IMPORT_KEY = "meduso:active-import";
const ACTIVE_IMPORT_EVENT = "meduso:active-import-change";

export function getActiveImportId(organizationId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(`${ACTIVE_IMPORT_KEY}:${organizationId}`);
}

export function setActiveImportId(organizationId: string, importId: string): void {
  sessionStorage.setItem(`${ACTIVE_IMPORT_KEY}:${organizationId}`, importId);
  window.dispatchEvent(new Event(ACTIVE_IMPORT_EVENT));
}

export function clearActiveImportId(organizationId: string): void {
  sessionStorage.removeItem(`${ACTIVE_IMPORT_KEY}:${organizationId}`);
  window.dispatchEvent(new Event(ACTIVE_IMPORT_EVENT));
}

export function subscribeToActiveImportChanges(onStoreChange: () => void): () => void {
  window.addEventListener(ACTIVE_IMPORT_EVENT, onStoreChange);
  return () => window.removeEventListener(ACTIVE_IMPORT_EVENT, onStoreChange);
}
