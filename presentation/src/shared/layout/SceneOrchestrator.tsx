import { AnimatePresence, motion } from 'framer-motion'
import { sceneVariants } from '../motion/presets'

interface SceneOrchestratorProps {
  sceneKey: string | number
  children: React.ReactNode
}

export default function SceneOrchestrator({ sceneKey, children }: SceneOrchestratorProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        variants={sceneVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="absolute inset-0 flex items-center justify-center px-8"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
