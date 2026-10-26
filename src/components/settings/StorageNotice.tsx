'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { checkStorageAvailability, storageStatus } from '@/lib/safeStorage';
import { t } from '@/lib/i18n';

export function StorageNotice() {
  const unavailable = useSyncExternalStore(storageStatus.subscribe, storageStatus.getSnapshot, storageStatus.getServerSnapshot);
  useEffect(() => { checkStorageAvailability(); }, []);
  if (!unavailable) return null;
  return <aside role="status" className="mx-auto my-3 max-w-4xl rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950">
    <p className="font-bold">{t('Je browser kan je voortgang niet bewaren.')}</p>
    <p>{t('Je kunt blijven oefenen, maar nieuwe sterren en kristallen verdwijnen bij het herladen of sluiten. Vraag een volwassene om websitegegevens voor Lettoria toe te staan. Gebruik steeds dezelfde browser en hetzelfde webadres.')}</p>
  </aside>;
}
