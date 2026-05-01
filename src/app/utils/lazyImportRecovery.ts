const CHUNK_RELOAD_PREFIX = 'lazy-import-reload:';

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');

  return /Failed to fetch dynamically imported module|Importing a module script failed|module script/i.test(message);
}

export async function loadLazyNamedModule<T>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string,
  retryKey: string
): Promise<{ default: T }> {
  try {
    const module = await factory();

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`${CHUNK_RELOAD_PREFIX}${retryKey}`);
    }

    return { default: module[exportName] as T };
  } catch (error) {
    if (typeof window !== 'undefined' && isChunkLoadError(error)) {
      const storageKey = `${CHUNK_RELOAD_PREFIX}${retryKey}`;
      const alreadyRetried = sessionStorage.getItem(storageKey) === '1';

      if (!alreadyRetried) {
        sessionStorage.setItem(storageKey, '1');
        window.location.reload();
        return new Promise<never>(() => {});
      }

      sessionStorage.removeItem(storageKey);
    }

    throw error;
  }
}