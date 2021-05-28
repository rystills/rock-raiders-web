import { EntityType } from './EntityType'

export class EntityParameter<T> {

    entityType: EntityType = null
    aeFilename: string = null
    stats: T = null

    constructor(entityType: EntityType, aeFilename: string, stats: T) {
        this.entityType = entityType
        this.aeFilename = aeFilename
        this.stats = stats
    }

}
