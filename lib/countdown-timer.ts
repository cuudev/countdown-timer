import { CountdownEvent } from './countdown-event'
import { CountdownState } from './countdown-state'
import { CountdownFireType } from './countdown-fire-type'

export class CountdownTimer {
  private remaining: number
  private state: CountdownState

  private countdown: number
  private delay: any
  private fires: number
  private readonly func: any

  private lastTimeFired!: Date
  private lastPauseTime!: Date
  private timerId: ReturnType<typeof setInterval> | undefined
  private resumeId: ReturnType<typeof setTimeout> | undefined

  private event: CountdownEvent = {
    countdown: 0,
    delay: 0,
    passedTime: 0,
    remainingTime: 0,
    state : CountdownState.IDLE,
    fireBy : CountdownFireType.TIMER,
  }

  /***
   *
   * @param countdown seconds
   * @param delay milliseconds
   * @param func
   */
  constructor(countdown: number,
              delay: number,
              func: (event: CountdownEvent) => void) {

    this.remaining = 0;
    this.state = CountdownState.IDLE; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.countdown = countdown;
    this.delay = delay; //in ms
    this.func = func;
    this.fires = 0;

    this.event.countdown = this.countdown
    this.event.delay = this.delay
  }

  /***
   *
   */
  proxyCallback() {
    if (this.countdown * 1000 < this.fires * this.delay) {
      this.stop(CountdownFireType.TIMER)
      return
    }
    this.event.state = this.state
    this.event.fireBy = CountdownFireType.TIMER
    this.event.passedTime = this.fires * this.delay
    this.event.remainingTime = this.countdown * 1000 - this.event.passedTime
    this.lastTimeFired = new Date();
    this.fires++;
    this.func(this.event);
  }

  /***
   * start timer
   */
  start() {
    console.info('Starting Timer ');
    this.timerId = setInterval(() => this.proxyCallback(), this.delay);
    this.lastTimeFired = new Date();
    if (this.state === CountdownState.IDLE) {
      this.fires = 0;
    }
    this.state = CountdownState.RUNNING
  }

  /***
   * pause timer
   */
  pause() {
    if (this.state !== CountdownState.RUNNING && this.state !== CountdownState.RESUMED)
      return;

    console.info('Pausing Timer ');
    this.lastPauseTime = new Date();
    this.remaining = this.lastPauseTime.valueOf() - this.lastTimeFired.valueOf()
    clearInterval(this.timerId);
    clearTimeout(this.resumeId);
    this.state = CountdownState.PAUSED;
    this.event.state = this.state
    this.event.fireBy = CountdownFireType.USER
    this.func(this.event)
  }

  /***
   * resume timer
   */
  resume(){
    if (this.state !== CountdownState.PAUSED)
      return;

    this.state = CountdownState.RESUMED;
    this.resumeId = setTimeout(() => this.timeoutCallback(), this.remaining);
    this.event.state = this.state
    this.event.fireBy = CountdownFireType.USER
    this.func(this.event)
  }

  timeoutCallback() {
    if (this.state !== CountdownState.RESUMED) return;

    this.proxyCallback();
    this.start();
  }

  /***
   * stop timer
   */
  stop(fireBy: CountdownFireType = CountdownFireType.USER) {
    if(this.state === CountdownState.IDLE)
      return;

    // console.info('Stopping Timer %s. Fired %s/%s times', this.name, this.fires, this.maxFires);
    clearInterval(this.timerId);
    clearTimeout(this.resumeId);
    this.state = CountdownState.IDLE;
    this.event.state = this.state
    this.event.fireBy = fireBy
    this.func(this.event)
  }

  /***
   * set countdown
   * @param countdown
   */
  setCountdown(countdown: number) {
    this.stop()
    this.countdown = countdown
  }

  /***
   *
   * @param delay
   */
  setDelay(delay: number) {
    this.stop()
    this.delay = delay
  }

  /***
   *
   */
  getState(): CountdownState {
    return this.state
  }
}