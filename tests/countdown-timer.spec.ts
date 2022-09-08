import { expect } from 'chai'
import { CountdownTimer } from '../lib'
import { CountdownState } from '../lib/countdown-state'

describe('Test Countdown Timer', () => {
  let timer: CountdownTimer
  before(() => {
    timer = new CountdownTimer(50, 10, (event) => {
      //console.log(event);
    })
  })
  it('started', () => {
    timer.start()
    expect(timer.getState()).to.equals(CountdownState.RUNNING)
  })
  it('paused', async () => {
    await new Promise(f => setTimeout(f, 1000));
    timer.pause()
    expect(timer.getState()).to.equals(CountdownState.PAUSED)
  })
  it('resumed', async () => {
    await new Promise(f => setTimeout(f, 1000));
    timer.resume()
    expect(timer.getState()).to.equals(CountdownState.RESUMED)
  })
  it('stopped', async () => {
    await new Promise(f => setTimeout(f, 1000));
    timer.stop()
    expect(timer.getState()).to.equals(CountdownState.IDLE)
  })
  it('total time', async () => {
    const tt = new CountdownTimer(10, 10, (event) => {
      console.log(event)
    })
    tt.start()
  })
})