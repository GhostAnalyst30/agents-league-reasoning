import { useCallback, useEffect, useState } from 'react'

export function useSceneNav(total: number) {
  const [index, setIndex] = useState(0)
  const [interacted, setInteracted] = useState(false)

  const next = useCallback(() => {
    setInteracted(true)
    setIndex((i) => Math.min(i + 1, total - 1))
  }, [total])

  const prev = useCallback(() => {
    setInteracted(true)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const goTo = useCallback(
    (i: number) => {
      setInteracted(true)
      setIndex(Math.max(0, Math.min(i, total - 1)))
    },
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        } else {
          document.exitFullscreen().catch(() => {})
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  return { index, next, prev, goTo, interacted, isFirst: index === 0, isLast: index === total - 1 }
}
