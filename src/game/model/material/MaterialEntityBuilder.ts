import { BaseConfig } from '../../../cfg/BaseConfig'
import { SequenceTextureMaterial } from '../../../scene/SequenceTextureMaterial'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { EntityType } from '../EntityType'
import { PriorityIdentifier } from '../job/PriorityIdentifier'
import { MaterialEntity } from './MaterialEntity'
import { MaterialParameter } from './MaterialParameter'

export class MaterialEntityBuilder {

    sceneMgr: SceneManager
    entityMgr: EntityManager
    entityType: EntityType
    params: MaterialParameter

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager, entityType: EntityType) {
        this.sceneMgr = sceneMgr
        this.entityMgr = entityMgr
        this.entityType = entityType
    }

    stats(stats: BaseConfig): this {
        this.params.stats = stats
        return this
    }

    priorityIdentifier(priorityIdentifier: PriorityIdentifier): this {
        this.params.priorityIdentifier = priorityIdentifier
        return this
    }

    addAnimatedEntity(aeFilename: string): this {
        this.params.aeFilename = aeFilename
        return this
    }

    addLwoModel(lwoFilename: string, materialCallback: (m: SequenceTextureMaterial) => any = null, scale: number = 1): this {
        this.params.lwoFilename = lwoFilename
        // FIXME apply scale
        // FIXME apply material callback
        return this
    }

    build(): MaterialEntity {
        if (!this.params) throw 'Parameters not yet initialized'
        return new MaterialEntity(this.sceneMgr, this.entityMgr, this.params)
    }

}
