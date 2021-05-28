import { Vector2 } from 'three'
import { BuildingEntityStats } from '../../../cfg/BuildingEntityStats'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { BuildingActivity } from '../activities/BuildingActivity'
import { RaiderActivity } from '../activities/RaiderActivity'
import { EntityType } from '../EntityType'
import { BuildingEntity, BuildingParameter } from './BuildingEntity'

export class BuildingEntityBuilder {

    sceneMgr: SceneManager
    entityMgr: EntityManager
    params: BuildingParameter

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager) {
        this.sceneMgr = sceneMgr
        this.entityMgr = entityMgr
    }

    init(entityType: EntityType, aeFilename: string, stats: BuildingEntityStats): this {
        this.params = new BuildingParameter(entityType, aeFilename, stats)
        return this
    }

    build(): BuildingEntity {
        if (!this.params) throw 'Parameters not yet initialized'
        return new BuildingEntity(this.sceneMgr, this.entityMgr, this.params)
    }

    secondaryBuildingPart(x: number, y: number): this {
        this.params.secondaryBuildingPart = new Vector2(x, y)
        return this
    }

    primaryPowerPath(x: number, y: number): this {
        this.params.primaryPowerPath = new Vector2(x, y)
        return this
    }

    secondaryPowerPath(x: number, y: number): this {
        this.params.secondaryPowerPath = new Vector2(x, y)
        return this
    }

    waterPathSurface(x: number, y: number): this {
        this.params.waterPathSurface = new Vector2(x, y)
        return this
    }

    dropAction(dropAction: RaiderActivity): this {
        this.params.dropAction = dropAction
        return this
    }

    removePrimaryPowerPath(): this {
        this.params.primaryPowerPath = null
        return this
    }

    unpoweredDefaultActivity(activity: BuildingActivity): this {
        this.params.unpoweredDefaultActivity = activity
        return this
    }

    unblockPathSurface(): this {
        this.params.blocksPathSurface = false
        return this
    }

}
