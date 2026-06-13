import { motion } from 'framer-motion'
import { textReveal } from '../motion/presets'

interface CinematicTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'p' | 'span'
}

export default function CinematicText({
  children,
  className = '',
  delay = 0,
  as = 'h1',
}: CinematicTextProps) {
  const Tag = motion[as] as typeof motion.h1
  return (
    <Tag
      custom={delay}
      variants={textReveal}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </Tag>
  )
}
