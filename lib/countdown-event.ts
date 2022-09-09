import { CountdownState } from './countdown-state'
import { CountdownFireType } from './countdown-fire-type'

export type CountdownEvent = {
  state: CountdownState
  fireBy: CountdownFireType
  countdown: number
  delay: number
  passedTime: number
  remainingTime: number
}