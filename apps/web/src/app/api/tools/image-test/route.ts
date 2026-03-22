import { NextRequest, NextResponse } from 'next/server'
import { processListingImages } from '@/lib/storage/image-processing'

export const runtime = 'nodejs'
export const maxDuration = 120

export interface ImageTestResult {
  name: string
  originalSize: number
  /** Total wall time from buffer read to results (includes transfer overhead) */
  totalMs: number
  timing: {
    /** HEIC → JPEG conversion (0 if not HEIC) */
    heicConvertMs: number
    /** Sharp thumb pipeline (parallel with full) */
    thumbMs: number
    /** Sharp full pipeline (parallel with thumb) */
    fullMs: number
    /** Combined Sharp wall time (thumb+full ran in parallel) */
    sharpParallelMs: number
  }
  thumb: {
    dataUrl: string
    width: number
    height: number
    size: number
  }
  full: {
    dataUrl: string
    width: number
    height: number
    size: number
  }
  error?: string
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const files = formData.getAll('images') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 })
  }

  // Process all files in this batch concurrently
  const results: ImageTestResult[] = await Promise.allSettled(
    files.map(async (file): Promise<ImageTestResult> => {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const t0 = Date.now()

      try {
        const { thumb, full, timing } = await processListingImages(buffer, { withTiming: true })
        const totalMs = Date.now() - t0
        const t = timing!

        return {
          name: file.name,
          originalSize: buffer.length,
          totalMs,
          timing: {
            heicConvertMs: t.heicConvertMs,
            thumbMs: t.thumbMs,
            fullMs: t.fullMs,
            sharpParallelMs: t.totalMs - t.heicConvertMs,
          },
          thumb: {
            dataUrl: `data:image/webp;base64,${thumb.buffer.toString('base64')}`,
            width: thumb.width,
            height: thumb.height,
            size: thumb.buffer.length,
          },
          full: {
            dataUrl: `data:image/webp;base64,${full.buffer.toString('base64')}`,
            width: full.width,
            height: full.height,
            size: full.buffer.length,
          },
        }
      } catch (err) {
        return {
          name: file.name,
          originalSize: buffer.length,
          totalMs: Date.now() - t0,
          timing: { heicConvertMs: 0, thumbMs: 0, fullMs: 0, sharpParallelMs: 0 },
          thumb: { dataUrl: '', width: 0, height: 0, size: 0 },
          full: { dataUrl: '', width: 0, height: 0, size: 0 },
          error: err instanceof Error ? err.message : 'Processing failed',
        }
      }
    })
  ).then(settled =>
    settled.map(r => (r.status === 'fulfilled' ? r.value : {
      name: 'unknown',
      originalSize: 0,
      totalMs: 0,
      timing: { heicConvertMs: 0, thumbMs: 0, fullMs: 0, sharpParallelMs: 0 },
      thumb: { dataUrl: '', width: 0, height: 0, size: 0 },
      full: { dataUrl: '', width: 0, height: 0, size: 0 },
      error: r.reason?.message ?? 'Unknown error',
    }))
  )

  return NextResponse.json(results)
}
