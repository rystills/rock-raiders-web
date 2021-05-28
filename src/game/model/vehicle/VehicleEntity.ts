import { PositionalAudio, Vector2 } from 'three'
import { VehicleEntityStats } from '../../../cfg/VehicleEntityStats'
import { EventBus } from '../../../event/EventBus'
import { SelectionChanged, VehiclesChangedEvent } from '../../../event/LocalEvents'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { AnimEntityActivity } from '../activities/AnimEntityActivity'
import { RaiderActivity } from '../activities/RaiderActivity'
import { EntityParameter } from '../EntityParameter'
import { FulfillerEntity } from '../FulfillerEntity'
import { Job } from '../job/Job'
import { VehicleCallManJob } from '../job/VehicleCallManJob'
import { TerrainPath } from '../map/TerrainPath'
import { Crystal } from '../material/Crystal'
import { PathTarget } from '../PathTarget'
import { Raider } from '../raider/Raider'
import { RaiderTraining } from '../raider/RaiderTraining'
import { VehicleActivity } from './VehicleActivity'

export class VehicleParameter extends EntityParameter<VehicleEntityStats> {

    driverActivity: RaiderActivity = null
    driverTraining: RaiderTraining = RaiderTraining.DRIVER

}

export class VehicleEntity extends FulfillerEntity {

    params: VehicleParameter
    driver: Raider = null
    callManJob: VehicleCallManJob = null
    engineSound: PositionalAudio

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager, params: VehicleParameter) {
        super(sceneMgr, entityMgr, params.entityType, params.aeFilename)
        this.params = params
        this.sceneEntity.flipXAxis()
    }

    get stats(): VehicleEntityStats {
        return this.params.stats
    }

    findPathToTarget(target: PathTarget): TerrainPath {
        return this.sceneMgr.terrain.findVehiclePath(this.getPosition2D(), target, this.stats.CrossLand, this.stats.CrossWater, this.stats.CrossLava)
    }

    beamUp() {
        this.dropDriver()
        super.beamUp()
        const surface = this.surfaces[0]
        for (let c = 0; c < this.stats.CostCrystal; c++) {
            this.entityMgr.placeMaterial(new Crystal(this.sceneMgr, this.entityMgr), surface.getRandomPosition())
        }
        EventBus.publishEvent(new VehiclesChangedEvent())
    }

    setJob(job: Job, followUpJob: Job = null) {
        if (!this.driver) return
        super.setJob(job, followUpJob)
    }

    addDriver(driver: Raider) {
        this.driver = driver
        this.driver.vehicle = this
        this.driver.sceneEntity.position.set(0, 0, 0)
        this.driver.sceneEntity.setHeading(0)
        this.driver.changeActivity(this.getDriverActivity());
        (this.animation.driverJoint || this.sceneEntity.group).add(this.driver.sceneEntity.group)
        if (this.stats.EngineSound && !this.engineSound) this.engineSound = this.playPositionalAudio(this.stats.EngineSound, true)
        if (this.selected) EventBus.publishEvent(new SelectionChanged(this.entityMgr))
    }

    dropDriver() {
        this.stopJob()
        if (!this.driver) return
        (this.animation.driverJoint || this.sceneEntity.group).remove(this.driver.sceneEntity.group)
        this.driver.vehicle = null
        this.driver.sceneEntity.position.copy(this.sceneEntity.position)
        this.driver.sceneEntity.setHeading(this.sceneEntity.getHeading())
        this.driver.sceneMgr.scene.add(this.driver.sceneEntity.group)
        this.driver.changeActivity()
        this.driver = null
        this.engineSound?.stop()
        this.engineSound = null
        if (this.selected) EventBus.publishEvent(new SelectionChanged(this.entityMgr))
    }

    getRequiredTraining(): RaiderTraining {
        return this.params.driverTraining
    }

    getDriverActivity(): RaiderActivity {
        return this.params.driverActivity
    }

    addToScene(worldPosition: Vector2, radHeading: number) {
        super.addToScene(worldPosition, radHeading)
    }

    getRouteActivity(): VehicleActivity {
        return AnimEntityActivity.Stand
    }

    isPrepared(job: Job): boolean {
        return false // FIXME get vehicles to work
    }

}
