'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NoteDoc } from '@/lib/types';

export default function UsernameNoteList() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, snap => {
      const arr: NoteDoc[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setNotes(arr);
    });
    return () => unsub();
  }, []);

  return (
    <section className="mx-auto max-w-6xl mt-10 space-y-4">
      {notes.map(n => (
        <div key={n.id} className="leading-tight">
          <div className="font-extrabold text-xl">@{n.username?.replace(/^@/, '')}</div>
          <div className="text-lg opacity-95">{n.text}</div>
        </div>
      ))}
    </section>
  );
}
