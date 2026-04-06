'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ImageTestResult } from '@/app/api/tools/image-test/route'

interface LightboxState {
  dataUrl: string
  label: string   // e.g. "photo_01.jpg — Full — 1920×1080px · 87.4 KB"
}

function Lightbox({ item, onClose, onPrev, onNext, hasPrev, hasNext }: {
  item: LightboxState
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Prev */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          onClick={e => { e.stopPropagation(); onPrev() }}
          aria-label="Previous"
        >
          ←
        </button>
      )}

      {/* Image */}
      <div className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img
          src={item.dataUrl}
          alt={item.label}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        <p className="text-white/70 text-caption1 text-center">{item.label}</p>
      </div>

      {/* Next */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          onClick={e => { e.stopPropagation(); onNext() }}
          aria-label="Next"
        >
          →
        </button>
      )}

      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}

/** Byte-aware batching — each POST stays under this limit */
const MAX_BATCH_BYTES = 8 * 1024 * 1024 // 8MB

/**
 * Convert HEIC/HEIF to JPEG via native OS decoder (Safari, iOS Chrome).
 * On browsers without native HEIC support, returns the file unchanged.
 */
async function normalizeToJpeg(file: File): Promise<File> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.hei[cf]$/i.test(file.name)
  if (!isHeic) return file

  const url = URL.createObjectURL(file)
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const el = new Image()
      el.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = el.naturalWidth
        canvas.height = el.naturalHeight
        canvas.getContext('2d')!.drawImage(el, 0, 0)
        canvas.toBlob(
          b => b ? resolve(b) : reject(new Error('toBlob failed')),
          'image/jpeg', 0.92
        )
      }
      el.onerror = () => reject(new Error('native decode unsupported'))
      el.src = url
    })
    return new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' })
  } catch {
    // Browser doesn't support native HEIC decode — return original file
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}

function makeBatches(files: File[]): File[][] {
  const batches: File[][] = []
  let batch: File[] = []
  let batchSize = 0
  for (const f of files) {
    // If single file exceeds limit, send it alone
    if (f.size > MAX_BATCH_BYTES) {
      if (batch.length) { batches.push(batch); batch = []; batchSize = 0 }
      batches.push([f])
      continue
    }
    if (batchSize + f.size > MAX_BATCH_BYTES && batch.length) {
      batches.push(batch)
      batch = []
      batchSize = 0
    }
    batch.push(f)
    batchSize += f.size
  }
  if (batch.length) batches.push(batch)
  return batches
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function fmtMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function savings(original: number, compressed: number) {
  if (!original) return '—'
  const pct = ((original - compressed) / original) * 100
  return `${pct >= 0 ? '-' : '+'}${Math.abs(pct).toFixed(0)}%`
}

interface Stats {
  totalMs: number
  avgMsPerImage: number
  imagesPerSec: number
}

export default function ImageTestPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<ImageTestResult[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number; phase: 'heic' | 'sharp' } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lbIndex, setLbIndex] = useState<number | null>(null)

  // Flat list of all lightbox-able images in order: [img0-thumb, img0-full, img1-thumb, ...]
  const lightboxItems: LightboxState[] = results.flatMap(r =>
    r.error ? [] : [
      { dataUrl: r.thumb.dataUrl, label: `${r.name} — Thumb — ${r.thumb.width}×${r.thumb.height}px · ${fmt(r.thumb.size)}` },
      { dataUrl: r.full.dataUrl,  label: `${r.name} — Full — ${r.full.width}×${r.full.height}px · ${fmt(r.full.size)}` },
    ]
  )

  const openLightbox = useCallback((idx: number) => setLbIndex(idx), [])
  const closeLightbox = useCallback(() => setLbIndex(null), [])
  const prevLightbox = useCallback(() => setLbIndex(i => (i != null && i > 0 ? i - 1 : i)), [])
  const nextLightbox = useCallback(() => setLbIndex(i => (i != null && i < lightboxItems.length - 1 ? i + 1 : i)), [lightboxItems.length])

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    setError(null)
    setResults([])
    setStats(null)

    const rawFiles = Array.from(files).slice(0, 50)
    const heicCount = rawFiles.filter(f =>
      f.type === 'image/heic' || f.type === 'image/heif' || /\.hei[cf]$/i.test(f.name)
    ).length

    // Phase 1: client-side HEIC→JPEG (parallel, browser decodes natively)
    if (heicCount > 0) setProgress({ done: 0, total: heicCount, phase: 'heic' })
    let heicDone = 0
    const allFiles = await Promise.all(
      rawFiles.map(async f => {
        const out = await normalizeToJpeg(f)
        if (out !== f) { heicDone++; setProgress({ done: heicDone, total: heicCount, phase: 'heic' }) }
        return out
      })
    )

    // Phase 2: Sharp processing
    setProgress({ done: 0, total: allFiles.length, phase: 'sharp' })

    const wallStart = Date.now()
    const accumulated: ImageTestResult[] = []

    try {
      // Chunk into byte-aware batches — each POST stays under 8MB
      for (const batch of makeBatches(allFiles)) {
        const form = new FormData()
        batch.forEach(f => form.append('images', f))

        const res = await fetch('/api/tools/image-test', { method: 'POST', body: form })
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        const batchResults: ImageTestResult[] = await res.json()

        accumulated.push(...batchResults)
        setResults([...accumulated])
        setProgress({ done: accumulated.length, total: allFiles.length, phase: 'sharp' })
      }

      const totalMs = Date.now() - wallStart
      const processed = accumulated.filter(r => !r.error)
      const avgMsPerImage = processed.length
        ? Math.round(processed.reduce((s, r) => s + r.totalMs, 0) / processed.length)
        : 0

      setStats({
        totalMs,
        avgMsPerImage,
        imagesPerSec: processed.length ? +(processed.length / (totalMs / 1000)).toFixed(1) : 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setProgress(null)
    }
  }

  const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0)
  const totalThumb = results.reduce((s, r) => s + r.thumb.size, 0)
  const totalFull = results.reduce((s, r) => s + r.full.size, 0)
  const isProcessing = progress !== null

  // Map each result to its lightbox indices: thumbIdx, fullIdx
  let lbCounter = 0
  const lbMap = results.map(r => {
    if (r.error) return { thumbIdx: -1, fullIdx: -1 }
    const thumbIdx = lbCounter++
    const fullIdx = lbCounter++
    return { thumbIdx, fullIdx }
  })

  return (
    <>
      {/* Lightbox */}
      {lbIndex !== null && lightboxItems[lbIndex] && (
        <Lightbox
          item={lightboxItems[lbIndex]}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
          hasPrev={lbIndex > 0}
          hasNext={lbIndex < lightboxItems.length - 1}
        />
      )}

    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-title2 font-bold mb-1">Sharp Image Test</h1>
      <p className="text-subhead text-muted-foreground mb-8">
        Server-side Sharp pipeline · 480px thumb + 1400px full · WebP · byte-aware batching · no R2 upload
      </p>

      {/* Drop zone */}
      <label
        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-foreground/40 transition-colors mb-8"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <span className="text-display">📷</span>
        <span className="font-medium">Drop images here or click to select</span>
        <span className="text-caption1 text-muted-foreground">JPEG, PNG, WebP, HEIC · up to 50 files</span>
      </label>

      {/* Progress bar */}
      {isProcessing && progress && (
        <div className="mb-6">
          <div className="flex justify-between text-caption1 text-muted-foreground mb-1.5">
            <span>
              {progress.phase === 'heic'
                ? 'Converting HEIC → JPEG… (Chrome: ~2s/file, Safari: ~50ms/file)'
                : 'Processing with Sharp…'}
            </span>
            <span>{progress.done} / {progress.total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-subhead mb-6">
          {error}
        </div>
      )}

      {/* Stats + totals bar */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 compact:grid-cols-5 gap-3 mb-8 p-4 rounded-xl bg-muted/40 text-subhead">
          <div>
            <div className="text-caption2 text-muted-foreground uppercase tracking-wider mb-1">Original</div>
            <div className="font-semibold">{fmt(totalOriginal)}</div>
            <div className="text-caption1 text-muted-foreground">{results.length} img</div>
          </div>
          <div>
            <div className="text-caption2 text-muted-foreground uppercase tracking-wider mb-1">Thumbs</div>
            <div className="font-semibold">{fmt(totalThumb)}</div>
            <div className="text-caption1 text-success font-medium">{savings(totalOriginal, totalThumb)}</div>
          </div>
          <div>
            <div className="text-caption2 text-muted-foreground uppercase tracking-wider mb-1">Fulls</div>
            <div className="font-semibold">{fmt(totalFull)}</div>
            <div className="text-caption1 text-success font-medium">{savings(totalOriginal, totalFull)}</div>
          </div>
          {stats && (
            <>
              <div>
                <div className="text-caption2 text-muted-foreground uppercase tracking-wider mb-1">Wall time</div>
                <div className="font-semibold">{fmtMs(stats.totalMs)}</div>
                <div className="text-caption1 text-muted-foreground">end-to-end</div>
              </div>
              <div>
                <div className="text-caption2 text-muted-foreground uppercase tracking-wider mb-1">Throughput</div>
                <div className="font-semibold">{stats.imagesPerSec}/s</div>
                <div className="text-caption1 text-muted-foreground">~{fmtMs(stats.avgMsPerImage)}/img</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((r, i) => {
            const { thumbIdx, fullIdx } = lbMap[i]
            return (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/30 flex items-center justify-between gap-4">
                <span className="text-subhead truncate">{r.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  {r.totalMs > 0 && (
                    <span className="text-caption1 text-muted-foreground">{fmtMs(r.totalMs)} total</span>
                  )}
                  <span className="text-caption1 text-muted-foreground">{fmt(r.originalSize)}</span>
                </div>
              </div>

              {r.error ? (
                <div className="px-4 py-3 text-subhead text-destructive">{r.error}</div>
              ) : (
                <>
                  {/* Timing breakdown row */}
                  <div className="px-4 py-2 bg-muted/10 border-b border-border flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-caption2 text-muted-foreground">
                      Sharp parallel <span className="font-medium text-foreground">{fmtMs(r.timing.sharpParallelMs)}</span>
                    </span>
                    <span className="text-caption2 text-muted-foreground">
                      thumb <span className="font-medium text-foreground">{fmtMs(r.timing.thumbMs)}</span>
                    </span>
                    <span className="text-caption2 text-muted-foreground">
                      full <span className="font-medium text-foreground">{fmtMs(r.timing.fullMs)}</span>
                    </span>
                    {r.timing.heicConvertMs > 0 && (
                      <span className="text-caption2 text-muted-foreground">
                        HEIC→JPEG <span className="font-medium text-foreground">{fmtMs(r.timing.heicConvertMs)}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 compact:grid-cols-2 divide-y compact:divide-y-0 compact:divide-x divide-border">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-caption1 text-muted-foreground mb-2">
                        <span className="font-semibold text-foreground">Thumb</span>
                        <span>{r.thumb.width} × {r.thumb.height}px</span>
                      </div>
                      <button className="w-full group relative" onClick={() => openLightbox(thumbIdx)}>
                        <img src={r.thumb.dataUrl} alt="" className="w-full h-auto rounded-lg" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-caption1 bg-black/60 px-2 py-1 rounded">
                            View full size
                          </span>
                        </span>
                      </button>
                      <div className="flex items-center justify-between text-caption1 pt-1">
                        <span className="font-medium">{fmt(r.thumb.size)}</span>
                        <span className="text-success font-medium">{savings(r.originalSize, r.thumb.size)}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-caption1 text-muted-foreground mb-2">
                        <span className="font-semibold text-foreground">Full</span>
                        <span>{r.full.width} × {r.full.height}px</span>
                      </div>
                      <button className="w-full group relative" onClick={() => openLightbox(fullIdx)}>
                        <img src={r.full.dataUrl} alt="" className="w-full h-auto rounded-lg" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-caption1 bg-black/60 px-2 py-1 rounded">
                            View full size
                          </span>
                        </span>
                      </button>
                      <div className="flex items-center justify-between text-caption1 pt-1">
                        <span className="font-medium">{fmt(r.full.size)}</span>
                        <span className="text-success font-medium">{savings(r.originalSize, r.full.size)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}
