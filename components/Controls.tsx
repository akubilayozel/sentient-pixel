'use client';

import { useState, useRef, useEffect } from 'react';
import { db, storage, ensureAnonAuth, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!file) { setMsg('Önce fotoğraf seç.'); return; }
    if (!username || !note) { setMsg('Kullanıcı adı ve not gerekli.'); return; }

    setBusy(true);
    try {
      await ensureAnonAuth();
      const uid = auth.currentUser!.uid;

      // 1) Storage’a yükle
      const path = `avatars/${uid}/${Date.now()}.jpg`;
      const rf = ref(storage, path);
      await uploadBytes(rf, file);
      const url = await getDownloadURL(rf);

      // 2) Hücreyi doldur
      await setDoc(doc(db, 'cells', cell), {
        id: cell,
        url,
        occupiedBy: uid,
        createdAt: serverTimestamp(),
      });

      // 3) Notu kaydet
      await addDoc(collection(db, 'notes'), {
        username,
        text: note,
        uid,
        cell,
        createdAt: serverTimestamp(),
      });

      setMsg('✔ Yüklendi!');
      setNote('');
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setMsg('Yükleme sırasında sorun oluştu.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Hücre seç */}
      <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
        <label className="block text-sm font-semibold opacity-90">Hücre seç</label>
        <input
          value={cell}
          onChange={(e) => setCell(e.target.value as CellId)}
          className="mt-2 w-full rounded-md bg-white/10 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/20"
          placeholder="5-12"
        />
      </div>

      {/* Foto yükle */}
      <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
        <label className="block text-sm font-semibold opacity-90">Fotoğraf yükle</label>
        <input
          type="file"
          className="mt-2"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Not bırak */}
      <form onSubmit={handleSubmit} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
        <label className="block text-sm font-semibold opacity-90">Not bırak</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-2 w-full rounded-md bg-white/10 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/20"
          placeholder="@kullanici"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 w-full rounded-md bg-white/10 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/20"
          placeholder="Mesajın..."
        />
        <button
          disabled={busy}
          className="mt-3 w-full rounded-md bg-white/20 py-2 font-semibold hover:bg-white/25 disabled:opacity-50"
        >
          Kaydet
        </button>
        {msg && <div className="mt-2 text-sm opacity-90">{msg}</div>}
      </form>
    </section>
  );
}
