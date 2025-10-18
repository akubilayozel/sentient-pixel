'use client';

import React, { useEffect, useRef, useState } from 'react';
import { db, storage, ensureAnonAuth, auth } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import type { CellId } from '@/lib/types';

type Props = {
  cell: CellId;
  setCell: (id: CellId) => void;
};

export default function Controls({ cell, setCell }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // clear success message after a while
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!file) {
      setMsg('Choose a photo first.');
      return;
    }
    if (!username || !note) {
      setMsg('Username and message are required.');
      return;
    }

    setBusy(true);
    try {
      await ensureAnonAuth();
      const user = auth.currentUser!;
      const uid = user.uid;

      // 1) upload to Storage
      const path = `avatars/${uid}/${Date.now()}.jpg`;
      const rf = ref(storage, path);
      await uploadBytes(rf, file);
      const url = await getDownloadURL(rf);

      // 2) fill cell (firestore)
      await setDoc(doc(db, 'cells', cell), {
        id: cell,
        url,
        occupiedBy: uid,
        createdAt: serverTimestamp(),
      });

      // 3) save note (firestore)
      await addDoc(collection(db, 'notes'), {
        username,
        text: note,
        uid,
        createdAt: serverTimestamp(),
      });

      setMsg('Uploaded!');
      setNote('');
      if (fileRef.current) fileRef.current.value = '';
      setFile(null);
    } catch (err) {
      console.error(err);
      setMsg('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 md:grid-cols-3"
    >
      {/* Pick cell */}
      <div className="rounded-2xl bg-white/10 p-6 shadow-sm backdrop-blur-sm">
        <h3 className="mb-3 text-lg font-semibold text-white">Pick a cell</h3>
        <input
          type="text"
          value={cell}
          onChange={(e) => setCell(e.target.value as CellId)}
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-white/40"
          placeholder="row-col (e.g. 5-12)"
        />
      </div>

      {/* Upload image */}
      <div className="rounded-2xl bg-white/10 p-6 shadow-sm backdrop-blur-sm">
        <h3 className="mb-3 text-lg font-semibold text-white">Upload image</h3>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-white file:mr-4 file:rounded-md file:border-0 file:bg-white/20 file:px-4 file:py-2 file:text-white file:backdrop-blur placeholder-white/60"
        />
      </div>

      {/* Leave a note */}
      <div className="rounded-2xl bg-white/10 p-6 shadow-sm backdrop-blur-sm">
        <h3 className="mb-3 text-lg font-semibold text-white">Leave a note</h3>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3 w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-white/40"
          placeholder="@username"
        />

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-4 w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-white/40"
          placeholder="Message…"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-white/20 px-4 py-2 font-semibold text-white hover:bg-white/30 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>

        {msg && (
          <p className="mt-3 text-sm text-white/90">
            {msg === 'Uploaded!' ? '✓ ' : ''}{msg}
          </p>
        )}
      </div>
    </form>
  );
}
