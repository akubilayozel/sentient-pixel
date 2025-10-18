'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NoteDoc } from '@/lib/types';

/**
 * Sonsuz dikey kaydırmalı not listesi
 * - Notları çeker, iki kez peş peşe render eder
 * - Böylece içerik bittiği anda kesintisiz döngü oluşur
 * - Üzerine gelince durur (hover pause)
 * - motion-reduce için animasyonu kapatır
 */
export default function UsernameNoteList() {
  const [notes, setNotes] = useState<(NoteDoc & { id: string })[]>([]);

  useEffect(() => {
    // En yeni notlar üstte — istersen asc yapabilirsin
    const q = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc'),
      limit(200) // çok büyürse performansı korur
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: (NoteDoc & { id: string })[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as NoteDoc) }));
      setNotes(arr);
    });

    return () => unsub();
  }, []);

  // İçeriği iki kez tekrarlıyoruz ki animasyon sonsuza aksın (100% -> -50%)
  const looped = useMemo(() => (notes.length ? [...notes, ...notes] : []), [notes]);

  // Not sayısına göre animasyon süresi (daha fazla not = daha uzun/yavaş)
  const durationSec = Math.max(20, notes.length * 3);

  return (
    <section
      aria-label="Community notes"
      className="mx-auto max-w-6xl mt-4"
    >
      <div
        className={[
          'h-[320px] md:h-[420px] overflow-hidden relative',
          // üst-alt yumuşak maske (fade in/out)
          '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]',
          'pause-on-hover',
        ].join(' ')}
      >
        <ul
          className="will-change-transform motion-safe:animate-vert-scroll motion-reduce:animate-none"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {looped.map((n, i) => (
            <li key={`${n.id}-${i}`} className="py-3">
              <div className="space-y-1">
                <div className="font-extrabold">@{n.username}</div>
                <div className="opacity-90">{n.text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Küçük ipucu */}
      <p className="mt-2 text-xs opacity-70">
        Hover to pause • Updates live
      </p>
    </section>
  );
}
