import { VehicleEntityStats } from '../../../cfg/VehicleEntityStats'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { RaiderActivity } from '../activities/RaiderActivity'
import { EntityType } from '../EntityType'
import { RaiderTraining } from '../raider/RaiderTraining'
import { VehicleEntity, VehicleParameter } from './VehicleEntity'

export class VehicleEntityBuilder {

    sceneMgr: SceneManager
    entityMgr: EntityManager
    params: VehicleParameter

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager) {
        this.sceneMgr = sceneMgr
        this.entityMgr = entityMgr
    }

    init(entityType: EntityType, aeFilename: string, stats: VehicleEntityStats): this {
        this.params = new VehicleParameter(entityType, aeFilename, stats)
        return this
    }

    build(): VehicleEntity {
        if (!this.params) throw 'Parameters not yet initialized'
        return new VehicleEntity(this.sceneMgr, this.entityMgr, this.params)
    }

    driverActivity(activity: RaiderActivity): this {
        this.params.driverActivity = activity
        return this
    }

    driverTraining(training: RaiderTraining): this {
        this.params.driverTraining = training
        return this
    }

}
