import { EventBus } from '../../../../event/EventBus'
import { RaidersChangedEvent } from '../../../../event/LocalEvents'
import { EntityManager } from '../../../EntityManager'
import { RaiderActivity } from '../../activities/RaiderActivity'
import { BuildingEntity } from '../../building/BuildingEntity'
import { FulfillerEntity } from '../../FulfillerEntity'
import { PathTarget } from '../../PathTarget'
import { RaiderTraining } from '../../raider/RaiderTraining'
import { RaiderJob } from './RaiderJob'

export class TrainRaiderJob extends RaiderJob {

    entityMgr: EntityManager
    training: RaiderTraining
    building: BuildingEntity
    workplaces: PathTarget[]

    constructor(entityMgr: EntityManager, training: RaiderTraining, building: BuildingEntity) {
        super()
        this.entityMgr = entityMgr
        this.training = training
        this.building = building
        this.workplaces = this.getWorkplaces()
    }

    getWorkplaces(): PathTarget[] {
        if (!this.building?.isUsable()) {
            this.workplaces = []
            this.entityMgr.getTrainingSites(this.training).map((s) => s.getTrainingTargets().forEach((t) => this.workplaces.push(t)))
        }
        return this.workplaces
    }

    onJobComplete() {
        super.onJobComplete()
        this.raider.addTraining(this.training)
        EventBus.publishEvent(new RaidersChangedEvent(this.entityMgr, this.training))
    }

    getWorkActivity(): RaiderActivity {
        return RaiderActivity.Train
    }

    getWorkDuration(fulfiller: FulfillerEntity): number {
        return 10000 // XXX adjust training time
    }

}
