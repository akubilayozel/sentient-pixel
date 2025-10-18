'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CellDoc } from '@/lib/types';

const CELL = 26;          // px
const GRID_COLS = 64;
const GRID_ROWS = 16;

type Props = {
  selected?: string;                   // opsiyonel: seçili hücreyi vurgulamak istersen
  onSelect?: (id: string) => void;     // hücreye tıklanınca çağrılır
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
      <div
        className="mx-auto masked"
        style={{ width, height }}
      >
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
                onClick={() => onSelect?.(id)}
                className={`border border-white/10 relative overflow-hidden ${selected === id ? 'ring-1 ring-white/40' : ''}`}
                style={{ width: CELL, height: CELL }}
              >
                {url && (
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
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
