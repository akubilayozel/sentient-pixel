'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NoteDoc } from '@/lib/types';

/**
 * Sonsuz dikey kaydırmalı not listesi
 * - Notları çeker, iki kez peş peşe render eder (loop etkisi)
 * - Hover’da durur (globals.css’te .pause-on-hover kuralı var)
 * - Inline style ile animasyonu zorunlu uygular (reduce-motion açık olsa bile)
 */
export default function UsernameNoteList() {
  const [notes, setNotes] = useState<(NoteDoc & { id: string })[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc'),
      limit(200) // güvenli üst sınır
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: (NoteDoc & { id: string })[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as NoteDoc) }));
      setNotes(arr);
    });

    return () => unsub();
  }, []);

  // İçeriği iki kez tekrarlıyoruz (%100'de -50% kaydırıyoruz -> kesintisiz döngü)
  const looped = useMemo(
    () => (notes.length ? [...notes, ...notes] : []),
    [notes]
  );

  // Animasyon süresi: not sayısına göre, ama 24–90s aralığına sabitle
  const durationSec = Math.max(24, Math.min(90, notes.length * 3));

  return (
    <section aria-label="Community notes" className="mx-auto max-w-6xl mt-4">
      <div
        className={[
          'h-[320px] md:h-[420px] overflow-hidden relative',
          // Üst-alt yumuşak maske (fade)
          '[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]',
          // Hover’da durdurma
          'pause-on-hover',
        ].join(' ')}
      >
        {looped.length === 0 ? (
          <div className="opacity-70 text-sm py-4">No notes yet…</div>
        ) : (
          <ul
            className="will-change-transform"
            // Inline animasyon: her şeyi ezer, mutlaka çalışır
            style={{
              animationName: 'vert-scroll',
              animationDuration: `${durationSec}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
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
