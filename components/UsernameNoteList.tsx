'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NoteDoc } from '@/lib/types';

/**
 * Sonsuz dikey kaydırmalı not listesi
 * - Notları çeker, iki kez peş peşe render eder (loop etkisi)
 * - Hover’da durur, motion-reduce’ta animasyon kapanır (globals.css)
 */
export default function UsernameNoteList() {
  const [notes, setNotes] = useState<(NoteDoc & { id: string })[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc'),
      limit(200) // güvenli üst sınır, performans için
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: (NoteDoc & { id: string })[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as NoteDoc) }));
      setNotes(arr);
    });

    return () => unsub();
  }, []);

  // İçeriği iki kez tekrarlıyoruz (keyframes %0→%100 = 0→-50%)
  const looped = useMemo(() => (notes.length ? [...notes, ...notes] : []), [notes]);

  // Animasyon süresi: not sayısına göre, ama 24–90s aralığında
  const durationSec = Math.max(24, Math.min(90, notes.length * 3));

  return (
    <section aria-label="Community notes" className="mx-auto max-w-6xl mt-4">
      <div
        className={[
          'h-[320px] md:h-[420px] overflow-hidden relative',
          // Üst-alt yumuşak maske (fade)
          '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]',
          // Hover’da durdurmayı sağlayan wrapper (globals.css’te .pause-on-hover:hover .animate-vert-scroll …)
          'pause-on-hover',
        ].join(' ')}
      >
        {looped.length === 0 ? (
          <div className="opacity-70 text-sm py-4">No notes yet…</div>
        ) : (
          <ul
            className="animate-vert-scroll will-change-transform"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {looped.map((n, i) => (
              <li key={`${n.id}-${i}`} className="py-3">
                <div className="space-y-1">
                  <div className="font-extrabold break-words">
                    @{(n.username ?? '').toString().replace(/^@/, '')}
                  </div>
                  <div className="opacity-90 break-words">{n.text}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-2 text-xs opacity-70">Hover to pause • Updates live</p>
    </section>
  );
}
