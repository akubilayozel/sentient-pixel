'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CellDoc } from '@/lib/types';

const CELL = 26;       // px
const GRID_COLS = 64;  // mask genişliğini buna göre hesaplıyoruz
const GRID_ROWS = 16;

export default function Mosaic() {
  const [cells, setCells] = useState<Record<string, string>>({}); // id -> url

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cells'), snap => {
      const map: Record<string, string> = {};
      snap.forEach(d => { const v = d.data() as CellDoc; map[v.id] = v.url; });
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
            width, height
          }}
        >
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
            const r = Math.floor(i / GRID_COLS);
            const c = i % GRID_COLS;
            const id = `${r}-${c}`;
            const url = cells[id];
            return (
              <div
                key={i}
                className="border border-white/10"
                style={{
                  width: CELL, height: CELL,
                  backgroundImage: url ? `url(${url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
