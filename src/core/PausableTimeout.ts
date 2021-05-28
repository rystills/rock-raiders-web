import { clearTimeoutSafe } from './Util'

export class PausableTimeout {

    callback = null
    remainingTime: number = 0
    startTime: number = 0
    timeout = null

    constructor(callback, ms) {
        if (isNaN(ms)) throw 'Timeout must be given as number'
        this.callback = callback
        this.remainingTime = ms
    }

    pause(): this {
        const pauseTime = window.performance.now()
        if (!this.timeout) return
        this.timeout = clearTimeoutSafe(this.timeout)
        this.remainingTime = this.remainingTime - Math.round(pauseTime - this.startTime)
        return this
    }

    unPause(): this {
        if (this.remainingTime <= 0 || this.timeout) return
        this.timeout = setTimeout(this.callback, this.remainingTime)
        this.startTime = window.performance.now()
        return this
    }

}

export function setPausableTimeout(callback, ms): PausableTimeout {
    return new PausableTimeout(callback, ms).unPause()
}
