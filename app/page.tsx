'use client';

import { useEffect, useState } from 'react';
import Controls from '@/components/Controls';
import Mosaic from '@/components/Mosaic';
import { ensureAnonAuth } from '@/lib/firebase';
import type { CellId } from '@/lib/types';

export default function Page() {
  const [cell, setCell] = useState<CellId>('0-0');

  useEffect(() => {
    ensureAnonAuth();
  }, []);

  return (
    <main className="px-4 py-8">
      {/* Controls’a seçili hücreyi ve setter’ı veriyoruz */}
      <Controls cell={cell} setCell={setCell} />

      {/* Mosaic’te tıklanan hücre Page’deki state’i güncelliyor */}
      <Mosaic selected={cell} onSelect={setCell} />
    </main>
  );
}
