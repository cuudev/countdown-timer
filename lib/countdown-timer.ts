import { CountdownEvent } from './countdown-event'
import { CountdownState } from './countdown-state'

export class CountdownTimer {
  private remaining: number
  private state: CountdownState

  private countdown: number
  private readonly delay: any
  private readonly func: any
  private readonly done: any
  private pausedTime: number
  private fires: number

  private lastTimeFired: Date | undefined
  private lastPauseTime: Date | undefined
  private timerId: ReturnType<typeof setInterval> | undefined
  private resumeId: ReturnType<typeof setTimeout> | undefined

  private event: CountdownEvent = {
    countdown: 0,
    delay: 0,
    passedTime: 0,
    remainingTime: 0,
    state : CountdownState.IDLE,
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
    this.pausedTime = 0; //how long we've been paused for
    this.fires = 0;

    this.event.countdown = this.countdown
    this.event.delay = this.delay
  }

  /***
   *
   */
  proxyCallback() {
    if (this.countdown * 1000 < this.fires * this.delay) {
      this.stop()
      return
    }
    //const event: CountdownEvent = {
    //  passedTime: this.fires * this.delay,
    //  remainingTime: this.countdown * 1000 - this.fires * this.delay,
    //  state : this.state
    //}
    this.event.state = this.state
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
    // console.info('Starting Timer ' + this.name);
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
    if (this.state !== CountdownState.RUNNING && this.state !== CountdownState.RESUMED) return;

    // console.info('Pausing Timer ' + this.name);

    // @ts-ignore
    this.remaining = this.delay - (new Date() - this.lastTimeFired) + this.pausedTime;
    this.lastPauseTime = new Date();
    clearInterval(this.timerId);
    clearTimeout(this.resumeId);
    this.state = CountdownState.PAUSED;
    this.event.state = this.state
    this.func(this.event)
  }

  /***
   * resume timer
   */
  resume(){
    if (this.state !== CountdownState.PAUSED) return;

    // @ts-ignore
    this.pausedTime += new Date() - this.lastPauseTime;
    // console.info(`Resuming Timer ${this.name} with ${this.remaining} remaining`);
    this.state = CountdownState.RESUMED;
    this.resumeId = setTimeout(() => this.timeoutCallback(), this.remaining);
    this.event.state = this.state
    this.func(this.event)
  }

  timeoutCallback() {
    if (this.state !== CountdownState.RESUMED) return;

    // this.pausedTime = 0;
    this.proxyCallback();
    this.start();
  }

  /***
   * stop timer
   */
  stop() {
    if(this.state === CountdownState.IDLE) return;

    // console.info('Stopping Timer %s. Fired %s/%s times', this.name, this.fires, this.maxFires);
    clearInterval(this.timerId);
    clearTimeout(this.resumeId);
    this.state = CountdownState.IDLE;
    this.event.state = this.state
    this.func(this.event)
  }

  /***
   * reset countdown
   * @param countdown
   */
  resetCountdown(countdown: number) {
    this.stop()
    this.countdown = countdown
  }

  getState(): CountdownState {
    return this.state
  }
}