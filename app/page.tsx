'use client';

import { useEffect } from 'react';
import Controls from '@/components/Controls';
import Mosaic from '@/components/Mosaic';
import UsernameNoteList from '@/components/UsernameNoteList';
import { ensureAnonAuth } from '@/lib/firebase';

export default function Page() {
  useEffect(() => { ensureAnonAuth(); }, []);

  return (
    <main className="px-4 py-8">
      <Controls />
      <Mosaic />
      <UsernameNoteList />
    </main>
  );
}
