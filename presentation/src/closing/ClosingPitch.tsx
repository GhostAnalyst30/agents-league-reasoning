import PitchShell from '../shared/layout/PitchShell'
import SceneOrchestrator from '../shared/layout/SceneOrchestrator'
import { useSceneNav } from '../shared/hooks/useSceneNav'
import { PRODUCT_NAME } from '../shared/branding'
import {
  CertToExamReady,
  FrameworkOrchestration,
  GroundedValidatedGated,
  LivePipeline,
  NoGuessing,
  NotAChatbot,
  ReasoningVerbs,
  SharedGroundedBrain,
  SixAgentsTeam,
  ThankYou,
} from './scenes'

const SCENES = [
  { id: 'lead', Component: CertToExamReady },
  { id: 'promise', Component: GroundedValidatedGated },
  { id: 'not-chatbot', Component: NotAChatbot },
  { id: 'six-agents', Component: SixAgentsTeam },
  { id: 'shared-brain', Component: SharedGroundedBrain },
  { id: 'framework', Component: FrameworkOrchestration },
  { id: 'no-guessing', Component: NoGuessing },
  { id: 'verbs', Component: ReasoningVerbs },
  { id: 'live-pipeline', Component: LivePipeline },
  { id: 'thanks', Component: ThankYou },
]

export default function ClosingPitch() {
  const { index, next, prev, interacted } = useSceneNav(SCENES.length)
  const { Component } = SCENES[index]

  return (
    <PitchShell
      index={index}
      total={SCENES.length}
      interacted={interacted}
      onNext={next}
      onPrev={prev}
      title={`${PRODUCT_NAME} · Closing`}
    >
      <SceneOrchestrator sceneKey={SCENES[index].id}>
        <Component />
      </SceneOrchestrator>
    </PitchShell>
  )
}
