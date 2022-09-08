import { CountdownState } from './countdown-state'

export type CountdownEvent = {
  state: CountdownState
  countdown: number
  delay: number
  passedTime: number
  remainingTime: number
}