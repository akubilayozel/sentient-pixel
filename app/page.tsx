'use client'
import { useEffect, useState } from 'react'
import { healthcheck } from '../lib/firebase'

export default function Page() {
  const [status, setStatus] = useState<'idle'|'ok'|'err'>('idle')
  const [uid, setUid] = useState('')

  useEffect(() => {
    healthcheck()
      .then(u => { setUid(u); setStatus('ok') })
      .catch(() => setStatus('err'))
  }, [])

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold">Sentient Pixel</h1>
      <p className="opacity-90 mt-2">
        Firebase bağlantı testi: {status === 'ok' ? '✅ Başarılı' : status === 'err' ? '❌ Hata' : '…'}
      </p>
      {uid && <p className="mt-2 text-sm opacity-80">Anon UID: {uid}</p>}
    </main>
  )
}
