import { useCallback, useRef, useState } from 'react'

interface SSELayer {
  layer: 'phenomenon' | 'formula' | 'application' | 'experiment'
  text: string
}

interface UseSSEStreamOptions {
  onLayer?: (layer: SSELayer) => void
  onDone?: (messageId: string) => void
  onError?: (code: string, message: string) => void
}

export function useSSEStream(options: UseSSEStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const start = useCallback((url: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setIsStreaming(true)
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('layer', (e) => {
      const data = JSON.parse(e.data) as SSELayer
      options.onLayer?.(data)
    })

    es.addEventListener('done', (e) => {
      const data = JSON.parse(e.data) as { message_id: string }
      options.onDone?.(data.message_id)
      setIsStreaming(false)
      es.close()
    })

    es.addEventListener('error', (e) => {
      if (e instanceof MessageEvent) {
        const data = JSON.parse(e.data) as { code: string; message: string }
        options.onError?.(data.code, data.message)
      }
      setIsStreaming(false)
      es.close()
    })
  }, [options])

  const stop = useCallback(() => {
    eventSourceRef.current?.close()
    setIsStreaming(false)
  }, [])

  return { isStreaming, start, stop }
}
