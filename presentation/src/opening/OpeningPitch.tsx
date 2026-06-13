import PitchShell from '../shared/layout/PitchShell'
import SceneOrchestrator from '../shared/layout/SceneOrchestrator'
import { useSceneNav } from '../shared/hooks/useSceneNav'
import {
  BudgetCounter,
  CompletionGauge,
  CrisisMerge,
  DarkIntro,
  FailureCalendars,
  FailureFeedback,
  FailureVisibility,
  HopeEmergence,
  LogoReveal,
  OpeningClose,
  PauseTwentyThree,
  SoundFamiliar,
} from './scenes'

const SCENES = [
  { id: 'dark', Component: DarkIntro },
  { id: 'budget', Component: BudgetCounter },
  { id: 'gauge', Component: CompletionGauge },
  { id: 'pause23', Component: PauseTwentyThree },
  { id: 'familiar', Component: SoundFamiliar },
  { id: 'failure1', Component: FailureCalendars },
  { id: 'failure2', Component: FailureFeedback },
  { id: 'failure3', Component: FailureVisibility },
  { id: 'crisis', Component: CrisisMerge },
  { id: 'hope', Component: HopeEmergence },
  { id: 'logo', Component: LogoReveal },
  { id: 'close', Component: OpeningClose },
]

export default function OpeningPitch() {
  const { index, next, prev, interacted } = useSceneNav(SCENES.length)
  const { Component } = SCENES[index]

  return (
    <PitchShell
      index={index}
      total={SCENES.length}
      interacted={interacted}
      onNext={next}
      onPrev={prev}
      title="CertPilot · Opening"
      burst={false}
    >
      <SceneOrchestrator sceneKey={SCENES[index].id}>
        <Component />
      </SceneOrchestrator>
    </PitchShell>
  )
}
