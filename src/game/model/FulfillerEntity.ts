import { PositionalAudio, Vector2 } from 'three'
import { Sample } from '../../audio/Sample'
import { PausableInterval, setPausableInterval } from '../../core/PausableInterval'
import { NATIVE_FRAMERATE } from '../../params'
import { BeamUpAnimator } from '../BeamUpAnimator'
import { EntityManager } from '../EntityManager'
import { SceneManager } from '../SceneManager'
import { RaiderActivity } from './activities/RaiderActivity'
import { EntityType } from './EntityType'
import { Job } from './job/Job'
import { JobState } from './job/JobState'
import { Surface } from './map/Surface'
import { MaterialEntity } from './material/MaterialEntity'
import { MovableEntity } from './MovableEntity'
import { MoveState } from './MoveState'
import { PathTarget } from './PathTarget'
import { Selectable } from './Selectable'

export abstract class FulfillerEntity extends MovableEntity implements Selectable {

    level: number = 0
    selected: boolean
    workInterval: PausableInterval = null
    job: Job = null
    followUpJob: Job = null
    carries: MaterialEntity = null
    inBeam: boolean = false
    beamUpAnimator: BeamUpAnimator = null
    workAudio: PositionalAudio

    protected constructor(sceneMgr: SceneManager, entityMgr: EntityManager, entityType: EntityType, aeFilename: string) {
        super(sceneMgr, entityMgr, entityType, aeFilename)
        this.workInterval = setPausableInterval(this.work.bind(this), 1000 / NATIVE_FRAMERATE)
    }

    abstract get stats()

    abstract isPrepared(job: Job): boolean

    dropItem() {
        if (!this.carries) return
        const position = this.getPosition()
        if (this.animation?.carryJoint) {
            this.animation.carryJoint.remove(this.carries.sceneEntity.group)
            this.animation.carryJoint.getWorldPosition(position)
        }
        this.carries.addToScene(new Vector2(position.x, position.z), null)
        this.carries = null
    }

    pickupItem(item: MaterialEntity) {
        this.carries = item
        if (this.animation?.carryJoint) this.animation.carryJoint.add(this.carries.sceneEntity.group)
        this.carries.sceneEntity.position.set(0, 0, 0)
    }

    setJob(job: Job, followUpJob: Job = null) {
        if (this.job !== job) this.stopJob()
        this.job = job
        if (this.job) this.job.assign(this)
        this.followUpJob = followUpJob
        if (this.followUpJob) this.followUpJob.assign(this)
    }

    stopJob() {
        this.workAudio?.stop()
        this.workAudio = null
        this.dropItem()
        if (!this.job) return
        this.job.unAssign(this)
        if (this.followUpJob) this.followUpJob.unAssign(this)
        this.job = null
        this.followUpJob = null
        this.changeActivity()
    }

    deselect() {
        this.sceneEntity.selectionFrame.visible = false
        this.selected = false
    }

    isSelectable(): boolean {
        return !this.selected && !this.inBeam
    }

    isInSelection(): boolean {
        return this.isSelectable() || this.selected
    }

    select(): boolean {
        if (!this.isSelectable()) return false
        this.sceneEntity.selectionFrame.visible = true
        this.selected = true
        this.changeActivity()
        return true
    }

    removeFromScene() {
        super.removeFromScene()
        this.workInterval?.pause()
    }

    beamUp() {
        this.stopJob()
        this.inBeam = true
        this.beamUpAnimator = new BeamUpAnimator(this)
    }

    moveToClosestTarget(target: PathTarget[]): MoveState {
        const result = super.moveToClosestTarget(target)
        this.job.setActualWorkplace(this.currentPath?.target)
        if (result === MoveState.TARGET_UNREACHABLE) {
            console.log('Entity could not move to job target, stopping job')
            this.stopJob()
        }
        return result
    }

    work() {
        if (!this.job || this.selected || this.inBeam) return
        if (this.job.jobState !== JobState.INCOMPLETE) {
            this.stopJob()
        } else {
            const carryItem = this.job.getCarryItem()
            if (carryItem && this.carries !== carryItem) {
                this.dropItem()
                if (this.moveToClosestTarget(carryItem.getPositionPathTarget())) {
                    this.changeActivity(RaiderActivity.Collect, () => {
                        this.pickupItem(carryItem)
                    })
                }
            } else if (this.moveToClosestTarget(this.job.getWorkplaces()) === MoveState.TARGET_REACHED) {
                if (this.job.isReadyToComplete()) {
                    const workActivity = this.job.getWorkActivity() || this.getDefaultActivity()
                    if (!this.workAudio && workActivity === RaiderActivity.Drill) { // TODO implement work audio
                        this.workAudio = this.playPositionalAudio(Sample[Sample.SFX_Drill], true)
                    }
                    this.changeActivity(workActivity, () => {
                        this.completeJob()
                    }, this.job.getWorkDuration(this))
                } else {
                    this.changeActivity()
                }
            }
        }
    }

    private completeJob() {
        this.workAudio?.stop()
        this.workAudio = null
        this.changeActivity()
        this.job?.onJobComplete()
        if (this.job?.jobState === JobState.INCOMPLETE) return
        if (this.job) this.job.unAssign(this)
        this.job = this.followUpJob
        this.followUpJob = null
    }

    canDrill(surface: Surface): boolean {
        return (this.stats[surface.surfaceType.statsDrillName]?.[this.level] || 0) > 0
    }

    update(elapsedMs: number) {
        super.update(elapsedMs)
        this.beamUpAnimator?.update(elapsedMs)
    }

    onPause() {
        super.onPause()
        this.workInterval?.pause()
    }

    onUnPause() {
        super.onUnPause()
        this.workInterval?.unPause()
    }

}
