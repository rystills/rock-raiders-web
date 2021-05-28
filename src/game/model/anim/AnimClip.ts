import { Group, PositionalAudio } from 'three'
import { PausableTimeout, setPausableTimeout } from '../../../core/PausableTimeout'
import { SceneMesh } from '../../../scene/SceneMesh'
import { SequenceTextureMaterial } from '../../../scene/SequenceTextureMaterial'
import { AnimSubObj } from './AnimSubObj'

export class AnimClip {

    looping: boolean = false
    transcoef: number = 1
    firstFrame: number = null
    lastFrame: number = null
    framesPerSecond: number = null
    bodies: AnimSubObj[] = []
    polyList: SceneMesh[] = []
    carryJoint: SceneMesh = null
    depositJoint: SceneMesh = null
    getToolJoint: SceneMesh = null
    wheelJoints: SceneMesh[] = []
    drillJoint: SceneMesh = null
    driverJoint: SceneMesh = null
    nullJoints: Map<string, SceneMesh[]> = new Map()
    polyModel: Group = new Group()
    animationTimeout: PausableTimeout = null
    sfxAudioByFrame: Map<number, PositionalAudio[]> = new Map()

    animate(frameIndex: number, onAnimationDone: () => any, durationTimeMs: number) {
        if (this.polyList.length !== this.bodies.length) throw 'Cannot animate poly. Length differs from bodies length'
        this.bodies.forEach((body: AnimSubObj, index) => {
            const p = this.polyList[index]
            p.position.copy(body.relPos[frameIndex]).sub(body.pivot)
            p.rotation.copy(body.relRot[frameIndex])
            p.scale.copy(body.relScale[frameIndex])
            if (p.hasOwnProperty('material')) {
                const material = p['material']
                const opacity = body.opacity[frameIndex]
                if (material && opacity !== undefined) {
                    const matArr = Array.isArray(material) ? material : [material]
                    matArr.forEach((mat: SequenceTextureMaterial) => mat.setOpacity(opacity))
                }
            }
        })
        this.playAudio(frameIndex)
        this.animationTimeout?.pause()
        let nextFrame = frameIndex + 1
        if (nextFrame <= this.lastFrame || !onAnimationDone || (durationTimeMs !== null && durationTimeMs > 0)) {
            if (nextFrame > this.lastFrame) {
                nextFrame = this.firstFrame
            }
            const standardDurationTimeMs = 1000 / this.framesPerSecond * this.transcoef
            if (durationTimeMs !== null) durationTimeMs -= standardDurationTimeMs
            const that = this
            const timeoutTimeMs = durationTimeMs !== null ? Math.max(0, Math.min(durationTimeMs, standardDurationTimeMs)) : standardDurationTimeMs
            this.animationTimeout = setPausableTimeout(() => that.animate(nextFrame, onAnimationDone, durationTimeMs), timeoutTimeMs)
        } else if (onAnimationDone) {
            this.stopAudio()
            onAnimationDone()
        }
    }

    private playAudio(frameIndex: number) {
        this.sfxAudioByFrame.getOrUpdate(frameIndex, () => []).forEach((a) => {
            if (a.isPlaying) a.stop()
            a.play()
        })
    }

    private stopAudio() {
        this.sfxAudioByFrame.forEach((f) => f.forEach((a) => a.isPlaying && a.stop()))
    }

    stop() {
        this.animationTimeout?.pause()
        this.stopAudio()
    }

    pause() {
        this.animationTimeout?.pause()
        this.polyList?.forEach((p) => p.getMaterials().forEach((m) => m.sequenceInterval?.pause()))
    }

    unPause() {
        this.animationTimeout?.unPause()
        this.polyList?.forEach((p) => p.getMaterials().forEach((m) => m.sequenceInterval?.unPause()))
    }

}
