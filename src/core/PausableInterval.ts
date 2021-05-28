import { clearIntervalSafe } from './Util'

export class PausableInterval {

    callback = null
    intervalTime: number = 0
    startTime: number = 0
    interval = null

    constructor(callback, ms: number) {
        if (isNaN(ms)) throw 'Interval must be given as number'
        this.callback = callback
        this.intervalTime = ms
    }

    pause(): this {
        if (!this.interval) return
        this.interval = clearIntervalSafe(this.interval)
        return this
    }

    unPause(): this {
        if (this.interval) return
        this.interval = setInterval(this.callback, this.intervalTime)
        this.startTime = window.performance.now()
        return this
    }

}

export function setPausableInterval(callback, ms) {
    return new PausableInterval(callback, ms).unPause()
}
