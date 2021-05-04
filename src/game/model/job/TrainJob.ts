import { EventBus } from '../../../event/EventBus'
import { EntityTrained } from '../../../event/WorldEvents'
import { RaiderActivity } from '../activities/RaiderActivity'
import { FulfillerEntity } from '../FulfillerEntity'
import { Surface } from '../map/Surface'
import { RaiderTraining } from '../raider/RaiderTraining'
import { Job } from './Job'
import { JobType } from './JobType'
import { TrainingPathTarget } from './TrainingPathTarget'

export class TrainJob extends Job {

    workplaces: TrainingPathTarget[]
    training: RaiderTraining

    constructor(surface: Surface, training: RaiderTraining) {
        super(JobType.TRAIN)
        this.workplaces = [new TrainingPathTarget(surface)]
        this.training = training
    }

    getWorkplaces(): TrainingPathTarget[] {
        return this.workplaces
    }

    onJobComplete() {
        super.onJobComplete()
        this.fulfiller.forEach((f) => {
            f.addTraining(this.training)
            EventBus.publishEvent(new EntityTrained(f, this.training))
        })
    }

    getWorkActivity(): RaiderActivity {
        return RaiderActivity.Train
    }

    getWorkDuration(fulfiller: FulfillerEntity): number {
        return 10000 // XXX adjust training time
    }

}
