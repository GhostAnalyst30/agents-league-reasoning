import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { TAGLINE } from '../branding'
import { scaleIn } from '../motion/presets'

interface GlowLogoProps {
  size?: 'md' | 'lg' | 'xl'
  showIcon?: boolean
  showSub?: boolean
  subtext?: string
}

const sizes = {
  md: { text: 'text-5xl', icon: 36, sub: 'text-lg' },
  lg: { text: 'text-7xl', icon: 48, sub: 'text-xl' },
  xl: { text: 'text-8xl md:text-9xl', icon: 56, sub: 'text-2xl' },
}

export default function GlowLogo({
  size = 'lg',
  showIcon = true,
  showSub = false,
  subtext = TAGLINE,
}: GlowLogoProps) {
  const s = sizes[size]
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-6"
    >
      {showIcon && (
        <motion.div
          animate={{
            boxShadow: [
              '0 0 40px rgba(14,165,233,0.3)',
              '0 0 80px rgba(99,102,241,0.5)',
              '0 0 40px rgba(14,165,233,0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-azure-500"
        >
          <GraduationCap size={s.icon} className="text-white" strokeWidth={2} />
        </motion.div>
      )}
      <motion.h1
        animate={{ textShadow: ['0 0 20px rgba(56,189,248,0.4)', '0 0 60px rgba(56,189,248,0.8)', '0 0 20px rgba(56,189,248,0.4)'] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className={`${s.text} font-black tracking-tighter text-white`}
      >
        SKILL<span className="text-gradient">PILOT-AI</span>
      </motion.h1>
      {showSub && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${s.sub} font-medium text-slate-400`}
        >
          {subtext}
        </motion.p>
      )}
    </motion.div>
  )
}
