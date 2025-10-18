'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CellDoc } from '@/lib/types';

const CELL = 26;          // px
const GRID_COLS = 64;
const GRID_ROWS = 16;

type Props = {
  /** Opsiyonel: seçili hücreyi vurgulamak için */
  selected?: string;
  /** Hücreye tıklanınca çağrılır */
  onSelect?: (id: string) => void;
};

export default function Mosaic({ selected, onSelect }: Props) {
  const [cells, setCells] = useState<Record<string, string>>({}); // id -> url

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cells'), (snap) => {
      const map: Record<string, string> = {};
      snap.forEach((d) => {
        const v = d.data() as CellDoc;
        const key = v?.id && typeof v.id === 'string' ? v.id : d.id;
        if (key && v?.url) map[key] = v.url;
      });
      setCells(map);
    });
    return () => unsub();
  }, []);

  const width = GRID_COLS * CELL;
  const height = GRID_ROWS * CELL;

  return (
    <section className="mx-auto mt-8 max-w-6xl">
      <div className="mx-auto masked" style={{ width, height }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL}px)`,
            width,
            height,
          }}
        >
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
            const r = Math.floor(i / GRID_COLS);
            const c = i % GRID_COLS;
            const id = `${r}-${c}`;
            const url = cells[id];

            return (
              <button
                key={id}
                title={id}
                aria-label={`Hücre ${id}`}
                onClick={() => onSelect?.(id)}
                // Çizgileri belirginleştirdik: /10 -> /40 (md: /50)
                className={[
                  'relative overflow-hidden',
                  'border border-white/40 md:border-white/50',
                  'focus:outline-none focus:ring-1 focus:ring-white/60',
                  'hover:bg-white/[0.03]',
                  selected === id ? 'ring-1 ring-white/60' : '',
                ].join(' ')}
                style={{ width: CELL, height: CELL }}
              >
                {url && (
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
