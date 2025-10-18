'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CellDoc } from '@/lib/types';

const BASE_CELL = 26;       // masaüstü için hedef hücre boyutu (px)
const GRID_COLS  = 64;
const GRID_ROWS  = 16;

type Props = {
  selected?: string;
  onSelect?: (id: string) => void;
};

export default function Mosaic({ selected, onSelect }: Props) {
  const [cellsMap, setCellsMap] = useState<Record<string, string>>({});
  const [cell, setCell] = useState<number>(BASE_CELL);  // dinamik hücre boyutu
  const wrapRef = useRef<HTMLDivElement>(null);

  // Firestore dinleme
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cells'), (snap) => {
      const map: Record<string, string> = {};
      snap.forEach((d) => {
        const v = d.data() as CellDoc;
        const key = v?.id && typeof v.id === 'string' ? v.id : d.id;
        if (key && v?.url) map[key] = v.url;
      });
      setCellsMap(map);
    });
    return () => unsub();
  }, []);

  // Container genişliğine göre hücre boyutunu ayarla
  useEffect(() => {
    const update = () => {
      const w =
        wrapRef.current?.clientWidth ??
        (typeof window !== 'undefined' ? window.innerWidth : GRID_COLS * BASE_CELL);

      // Her zaman tek satırda sığacak şekilde, maksimum BASE_CELL'i aşmadan hesapla
      const candidate = Math.floor(w / GRID_COLS);
      const next = Math.max(10, Math.min(BASE_CELL, candidate)); // çok küçük olmasın
      setCell(next);
    };

    update();

    // ResizeObserver + window resize (bazı tarayıcılarda güvenli)
    const ro = wrapRef.current ? new ResizeObserver(update) : null;
    if (wrapRef.current && ro) ro.observe(wrapRef.current);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, []);

  const width  = useMemo(() => GRID_COLS * cell, [cell]);
  const height = useMemo(() => GRID_ROWS * cell, [cell]);

  return (
    // Yatay merkezle; mobilde tam genişlik ver
    <section className="mt-8 w-full flex justify-center px-3">
      <div ref={wrapRef} className="w-full max-w-full">
        <div className="masked mx-auto" style={{ width, height }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${cell}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${cell}px)`,
              width,
              height,
            }}
          >
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
              const r = Math.floor(i / GRID_COLS);
              const c = i % GRID_COLS;
              const id = `${r}-${c}`;
              const url = cellsMap[id];

              return (
                <button
                  key={id}
                  title={id}
                  aria-label={`cell ${id}`}
                  onClick={() => onSelect?.(id)}
                  className={[
                    'relative overflow-hidden',
                    // daha belirgin grid çizgileri
                    'border border-white/40 md:border-white/50',
                    'hover:bg-white/[0.03]',
                    'focus:outline-none focus:ring-1 focus:ring-white/60',
                    selected === id ? 'ring-1 ring-white/60' : '',
                  ].join(' ')}
                  style={{ width: cell, height: cell }}
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
      </div>
    </section>
  );
}
