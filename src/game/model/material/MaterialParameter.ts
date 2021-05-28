import { BaseConfig } from '../../../cfg/BaseConfig'
import { EntityParameter } from '../EntityParameter'
import { EntityType } from '../EntityType'
import { PriorityIdentifier } from '../job/PriorityIdentifier'

export class MaterialParameter extends EntityParameter<BaseConfig> {

    lwoFilename: string
    targetBuildingTypes: EntityType[] = []
    priorityIdentifier: PriorityIdentifier = null

}
