'use client';

import { useState, useRef } from 'react';
import { db, storage, ensureAnonAuth, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { CellId } from '@/lib/types';

export default function Controls() {
  const [cell, setCell] = useState<CellId>('0-0');
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

      // 1) Fotoğrafı Storage'a yükle
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
        createdAt: serverTimestamp(),
      });

      setMsg('✅ Yüklendi!');
      setFile(null);
      setNote('');
    } catch (err: any) {
      console.error(err);
      setMsg('❌ Hata: ' + (err?.message || 'bilinmiyor'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Hücre seç */}
      <div className="rounded-2xl border border-white/50 px-5 py-4">
        <label className="block text-lg font-semibold">Hücre seç</label>
        <input
          value={cell}
          onChange={(e)=>setCell(e.target.value)}
          placeholder="ör. 5-12"
          className="mt-2 w-full rounded-lg px-3 py-2 text-black"
        />
      </div>

      {/* Fotoğraf yükle */}
      <div className="rounded-2xl border border-white/50 px-5 py-4">
        <label className="block text-lg font-semibold">Fotoğraf yükle</label>
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} className="mt-2 w-full text-sm" />
      </div>

      {/* Not bırak */}
      <div className="rounded-2xl border border-white/50 px-5 py-4">
        <label className="block text-lg font-semibold">Not bırak</label>
        <input
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          placeholder="@kullanici"
          className="mt-2 w-full rounded-lg px-3 py-2 text-black"
        />
        <input
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          placeholder="Mesajın…"
          className="mt-2 w-full rounded-lg px-3 py-2 text-black"
        />
        <button disabled={busy} className="mt-3 w-full rounded-xl bg-white/15 hover:bg-white/25 transition px-4 py-2 font-semibold">
          {busy ? 'Yükleniyor…' : 'Kaydet'}
        </button>
        {msg && <p className="mt-2 text-sm opacity-90">{msg}</p>}
      </div>
    </form>
  );
}
