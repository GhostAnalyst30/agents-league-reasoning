import PitchShell from '../shared/layout/PitchShell'
import SceneOrchestrator from '../shared/layout/SceneOrchestrator'
import { useSceneNav } from '../shared/hooks/useSceneNav'
import { PRODUCT_NAME } from '../shared/branding'
import {
  AgentOrbitScene,
  Approved,
  BusinessRules,
  CertificationJourney,
  CriticGate,
  Grounded,
  HeroTagline,
  LogoReveal,
  MeasurableEvals,
  MotivationLine,
  SharedIntelligence,
  SystemBroken,
  ThankYou,
  Validated,
  WordGeneric,
  WordShatter,
  WordUnaccountable,
  WordUngrounded,
} from './scenes'

const SCENES = [
  { id: 'motivation', Component: MotivationLine },
  { id: 'broken', Component: SystemBroken },
  { id: 'generic', Component: WordGeneric },
  { id: 'ungrounded', Component: WordUngrounded },
  { id: 'unaccountable', Component: WordUnaccountable },
  { id: 'shatter', Component: WordShatter },
  { id: 'logo', Component: LogoReveal },
  { id: 'orbit', Component: AgentOrbitScene },
  { id: 'shared', Component: SharedIntelligence },
  { id: 'rules', Component: BusinessRules },
  { id: 'critic', Component: CriticGate },
  { id: 'evals', Component: MeasurableEvals },
  { id: 'journey', Component: CertificationJourney },
  { id: 'hero', Component: HeroTagline },
  { id: 'grounded', Component: Grounded },
  { id: 'validated', Component: Validated },
  { id: 'approved', Component: Approved },
  { id: 'thanks', Component: ThankYou },
]

export default function ClosingPitch() {
  const { index, next, prev, interacted } = useSceneNav(SCENES.length)
  const { Component } = SCENES[index]
  const isShatter = SCENES[index].id === 'shatter'

  return (
    <PitchShell
      index={index}
      total={SCENES.length}
      interacted={interacted}
      onNext={next}
      onPrev={prev}
      title={`${PRODUCT_NAME} · Closing`}
      burst={isShatter}
    >
      <SceneOrchestrator sceneKey={SCENES[index].id}>
        <Component />
      </SceneOrchestrator>
    </PitchShell>
  )
}
