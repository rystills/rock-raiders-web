import { EventBus } from '../event/EventBus'
import { EventKey } from '../event/EventKeyEnum'
import { UpdatePriorities } from '../event/LocalEvents'
import { JobCreateEvent, JobDeleteEvent } from '../event/WorldEvents'
import { CHECK_CLEAR_RUBBLE_INTERVAL, JOB_SCHEDULE_INTERVAL } from '../params'
import { EntityManager } from './EntityManager'
import { BuildingEntity } from './model/building/BuildingEntity'
import { EntityType } from './model/EntityType'
import { JobState } from './model/job/JobState'
import { PriorityEntry } from './model/job/PriorityEntry'
import { PriorityIdentifier } from './model/job/PriorityIdentifier'
import { GetToolJob } from './model/job/raider/GetToolJob'
import { GetToolPathTarget } from './model/job/raider/GetToolPathTarget'
import { MoveJob } from './model/job/raider/MoveJob'
import { TrainRaiderJob } from './model/job/raider/TrainRaiderJob'
import { ShareableJob } from './model/job/ShareableJob'
import { Raider } from './model/raider/Raider'
import { SceneManager } from './SceneManager'

export class Supervisor {

    sceneMgr: SceneManager
    entityMgr: EntityManager
    jobs: ShareableJob[] = []
    priorityIndexList: PriorityIdentifier[] = []
    priorityList: PriorityEntry[] = []
    assignJobsTimer: number = 0
    checkClearRubbleTimer: number = 0

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager) {
        this.sceneMgr = sceneMgr
        this.entityMgr = entityMgr
        EventBus.registerEventListener(EventKey.JOB_CREATE, (event: JobCreateEvent) => {
            this.jobs.push(event.job)
        })
        EventBus.registerEventListener(EventKey.JOB_DELETE, (event: JobDeleteEvent) => {
            event.job.cancel()
        })
        EventBus.registerEventListener(EventKey.UPDATE_PRIORITIES, (event: UpdatePriorities) => {
            this.priorityList = [...event.priorityList]
            this.priorityIndexList = this.priorityList.map((p) => p.key)
        })
    }

    update(elapsedMs: number) {
        this.assignJobs(elapsedMs)
        this.checkUnclearedRubble(elapsedMs)
    }

    assignJobs(elapsedMs: number) {
        this.assignJobsTimer += elapsedMs
        if (this.assignJobsTimer < JOB_SCHEDULE_INTERVAL) return
        this.assignJobsTimer %= JOB_SCHEDULE_INTERVAL
        const availableJobs: ShareableJob[] = []
        this.jobs = this.jobs.filter((j) => {
            const result = j.jobState === JobState.INCOMPLETE
            if (result && j.fulfiller.length < 1 && this.isEnabled(j.getPriorityIdentifier())) { // TODO don't assign jobs on hidden surfaces
                availableJobs.push(j)
            }
            return result
        })
        availableJobs.sort((left, right) => {
            return Math.sign(this.getPriority(left) - this.getPriority(right))
        })
        const unemployedRaider = this.entityMgr.raiders.filter((r) => !r.job && !r.inBeam)
        availableJobs.forEach((job) => { // XXX better use estimated time to complete job as metric
            let closestRaider: Raider = null
            let closestRaiderIndex: number = null
            let minDistance: number = null
            let closestToolRaider: Raider = null
            let closestToolRaiderIndex: number = null
            let minToolDistance: number = null
            let closestToolstation: BuildingEntity = null
            const requiredTool = job.getRequiredTool()
            let closestTrainingRaider: Raider = null
            let closestTrainingRaiderIndex: number = null
            let minTrainingDistance: number = null
            let closestTrainingArea: BuildingEntity = null
            const requiredTraining = job.getRequiredTraining()
            unemployedRaider.forEach((raider, index) => {
                const hasRequiredTool = raider.hasTool(requiredTool)
                const hasTraining = raider.hasTraining(requiredTraining)
                if (hasRequiredTool && hasTraining) {
                    const pathToJob = job.getWorkplaces().map((b) => raider.findPathToTarget(b))
                        .filter((t) => !!t)
                        .sort((l, r) => l.lengthSq - r.lengthSq)[0]
                    if (pathToJob) {
                        const dist = pathToJob.lengthSq // TODO use precalculated path to job
                        if (minDistance === null || dist < minDistance) {
                            closestRaider = raider
                            closestRaiderIndex = index
                            minDistance = dist
                        }
                    }
                } else if (!hasRequiredTool) {
                    const pathToToolstation = this.entityMgr.getBuildingsByType(EntityType.TOOLSTATION)
                        .map((b) => raider.findPathToTarget(b.getPathTarget()))
                        .filter((p) => !!p)
                        .sort((l, r) => l.lengthSq - r.lengthSq)[0]
                    if (pathToToolstation) {
                        const dist = pathToToolstation.lengthSq
                        if (minToolDistance === null || dist < minToolDistance) {
                            closestToolRaider = raider
                            closestToolRaiderIndex = index
                            minToolDistance = dist
                            closestToolstation = (pathToToolstation.target as GetToolPathTarget).building
                        }
                    }
                } else {
                    const pathToTrainingSite = this.entityMgr.getTrainingSites(requiredTraining)
                        .map((b) => raider.findPathToTarget(b.getPathTarget()))
                        .filter((p) => !!p)
                        .sort((l, r) => l.lengthSq - r.lengthSq)[0]
                    if (pathToTrainingSite) {
                        const dist = pathToTrainingSite.lengthSq
                        if (minTrainingDistance === null || dist < minTrainingDistance) {
                            closestTrainingRaider = raider
                            closestTrainingRaiderIndex = index
                            minTrainingDistance = dist
                            closestTrainingArea = (pathToTrainingSite.target as GetToolPathTarget).building
                        }
                    }
                }
            })
            if (closestRaider) {
                closestRaider.setJob(job)
                unemployedRaider.splice(closestRaiderIndex, 1)
            } else if (closestToolRaider) {
                closestToolRaider.setJob(new GetToolJob(this.entityMgr, requiredTool, closestToolstation), job)
                unemployedRaider.splice(closestToolRaiderIndex, 1)
            } else if (closestTrainingRaider) {
                closestTrainingRaider.setJob(new TrainRaiderJob(this.entityMgr, requiredTraining, closestTrainingArea), job)
                unemployedRaider.splice(closestTrainingRaiderIndex, 1)
            }
        })
        unemployedRaider.forEach((raider) => {
            const sites = raider.sceneEntity.surfaces.map((s) => s.site).filter(s => !!s)
            if (sites.length > 0) raider.setJob(new MoveJob(sites[0].getWalkOutSurface().getRandomPosition()))
        })
    }

    checkUnclearedRubble(elapsedMs: number) {
        this.checkClearRubbleTimer += elapsedMs
        if (this.checkClearRubbleTimer < CHECK_CLEAR_RUBBLE_INTERVAL) return
        this.checkClearRubbleTimer %= CHECK_CLEAR_RUBBLE_INTERVAL
        if (!this.isEnabled(PriorityIdentifier.aiPriorityClearing)) return
        this.entityMgr.raiders.forEach((raider) => {
            if (raider.job) return
            const startSurface = raider.sceneEntity.surfaces[0]
            for (let rad = 0; rad < 10; rad++) {
                for (let x = startSurface.x - rad; x <= startSurface.x + rad; x++) {
                    for (let y = startSurface.y - rad; y <= startSurface.y + rad; y++) {
                        const surface = this.sceneMgr.terrain.getSurfaceOrNull(x, y)
                        if (!(surface?.hasRubble()) || !surface?.discovered) continue
                        const clearRubbleJob = surface.createClearRubbleJob()
                        if (!clearRubbleJob || clearRubbleJob.fulfiller.length > 0) continue
                        const requiredTool = clearRubbleJob.getRequiredTool()
                        if (raider.hasTool(requiredTool)) {
                            raider.setJob(clearRubbleJob)
                            return
                        } else {
                            const pathToToolstation = this.entityMgr.getBuildingsByType(EntityType.TOOLSTATION)
                                .map((b) => raider.findPathToTarget(b.getPathTarget()))
                                .filter((p) => !!p)
                                .sort((l, r) => l.lengthSq - r.lengthSq)[0]
                            if (pathToToolstation) {
                                raider.setJob(new GetToolJob(this.entityMgr, requiredTool, (pathToToolstation.target as GetToolPathTarget).building), clearRubbleJob)
                                return
                            }
                        }
                    }
                }
            }
        })
    }

    getPriority(job: ShareableJob) {
        return this.priorityIndexList.indexOf(job.getPriorityIdentifier())
    }

    isEnabled(priorityIdentifier: PriorityIdentifier): boolean {
        return !!this.priorityList.find((p) => p.key === priorityIdentifier)?.enabled
    }

}
