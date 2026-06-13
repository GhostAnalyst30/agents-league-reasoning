export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-layer pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="cp-float absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl" />
      <div
        className="cp-float absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-3xl"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="cp-float absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl"
        style={{ animationDelay: '-9s' }}
      />
    </div>
  )
}
