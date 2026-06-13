import type { Transition, Variants } from 'framer-motion'

export const sceneTransition: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
}

export const sceneVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 0.96,
    y: 24,
    filter: 'blur(8px)',
  },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: sceneTransition,
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    y: -16,
    filter: 'blur(6px)',
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  },
}

export const textReveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

export const cameraZoom: Variants = {
  hidden: { scale: 1.15, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
}
