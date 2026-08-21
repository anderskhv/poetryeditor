export function shouldShowCollectionEmptyState(opts: {
  poemCount: number;
  sectionCount: number;
  isAddingSection: boolean;
}): boolean {
  return opts.poemCount === 0 && opts.sectionCount === 0 && !opts.isAddingSection;
}

export function formatCollectionUpdatedAt(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Updated recently';

  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;

  const updated = new Date(iso);
  const today = new Date(now);
  if (updated.toDateString() === today.toDateString()) {
    return `Updated today at ${updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Updated yesterday';
  if (days < 7) return `Updated ${days} days ago`;

  return `Updated ${updated.toLocaleDateString()}`;
}

export function formatPoemCount(count: number | undefined): string | null {
  if (typeof count !== 'number' || count < 0) return null;
  return `${count} poem${count === 1 ? '' : 's'}`;
}

export function legacyCollectionPath(id?: string | null): string {
  if (!id) return '/my-collections';
  return `/my-collections/${id}`;
}

export function canWritePoemVersion(opts: {
  poemId: string | null | undefined;
  isCloud: boolean;
  loadedCloudPoemId: string | null | undefined;
  isLoadingCloudPoem: boolean;
  isPreviewing: boolean;
}): boolean {
  if (!opts.poemId || opts.isPreviewing) return false;
  if (opts.isCloud) {
    if (opts.isLoadingCloudPoem) return false;
    if (opts.loadedCloudPoemId !== opts.poemId) return false;
  }
  return true;
}
