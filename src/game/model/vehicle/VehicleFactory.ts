import { ResourceManager } from '../../../resource/ResourceManager'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { RaiderActivity } from '../activities/RaiderActivity'
import { EntityType } from '../EntityType'
import { RaiderTraining } from '../raider/RaiderTraining'
import { VehicleEntity } from './VehicleEntity'
import { VehicleEntityBuilder } from './VehicleEntityBuilder'

export class VehicleFactory {

    static createVehicleFromType(entityType: EntityType, sceneMgr: SceneManager, entityMgr: EntityManager): VehicleEntity {
        switch (entityType) {
            case EntityType.HOVERBOARD:
                return this.createHoverboard(sceneMgr, entityMgr)
            case EntityType.SMALL_DIGGER:
                return this.createSmallDigger(sceneMgr, entityMgr)
            case EntityType.SMALL_TRUCK:
                return this.createSmallTruck(sceneMgr, entityMgr)
            case EntityType.SMALL_CAT:
                return this.createSmallCat(sceneMgr, entityMgr)
            case EntityType.SMALL_MLP:
                return this.createSmallMlp(sceneMgr, entityMgr)
            case EntityType.SMALL_HELI:
                return this.createSmallHeli(sceneMgr, entityMgr)
            case EntityType.BULLDOZER:
                return this.createBullDozer(sceneMgr, entityMgr)
            case EntityType.WALKER_DIGGER:
                return this.createWalkerDigger(sceneMgr, entityMgr)
            case EntityType.LARGE_MLP:
                return this.createLargeMlp(sceneMgr, entityMgr)
            case EntityType.LARGE_DIGGER:
                return this.createLargeDigger(sceneMgr, entityMgr)
            case EntityType.LARGE_CAT:
                return this.createLargeCat(sceneMgr, entityMgr)
            default:
                throw 'Unexpected vehicle type: ' + EntityType[entityType]
        }
    }

    private static createHoverboard(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.HOVERBOARD, 'Vehicles/Hoverboard/Hoverboard.ae', ResourceManager.stats.Hoverboard)
            .driverActivity(RaiderActivity.Hoverboard)
            .build()
    }

    private static createSmallDigger(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.SMALL_DIGGER, 'Vehicles/SmallDigger/SmallDigger.ae', ResourceManager.stats.SmallDigger)
            .driverActivity(RaiderActivity.SMALLDIGGER)
            .build()
    }

    private static createSmallTruck(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.SMALL_TRUCK, 'Vehicles/SmallTruck/SmallTruck.ae', ResourceManager.stats.SmallTruck)
            .driverActivity(RaiderActivity.SMALLTRUCK)
            .build()
    }

    private static createSmallCat(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.SMALL_CAT, 'Vehicles/SmallCat/SmallCat.ae', ResourceManager.stats.SmallCat)
            .driverActivity(RaiderActivity.SMALLCAT)
            .driverTraining(RaiderTraining.SAILOR)
            .build()
    }

    private static createSmallMlp(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.SMALL_MLP, 'Vehicles/SMLP/SMLP.ae', ResourceManager.stats.Smallmlp)
            .driverActivity(RaiderActivity.SMALLMLP)
            .build()
    }

    private static createSmallHeli(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.SMALL_HELI, 'Vehicles/SmallHeli/SmallHeli.ae', ResourceManager.stats.SmallHeli)
            .driverActivity(RaiderActivity.SMALLheli)
            .driverTraining(RaiderTraining.PILOT)
            .build()
    }

    private static createBullDozer(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.BULLDOZER, 'Vehicles/Bulldozer/Bulldozer.ae', ResourceManager.stats.Bulldozer)
            .build()
    }

    private static createWalkerDigger(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.WALKER_DIGGER, 'Vehicles/WalkerBody/WalkerBody.ae', ResourceManager.stats.WalkerDigger)
            // ResourceManager.getAnimationEntityType('Vehicles/WalkerLegs/WalkerLegs.ae', sceneMgr.listener) // TODO implement walker vehicle
            .build()
    }

    private static createLargeMlp(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.LARGE_MLP, 'Vehicles/LMLP/LMLP.ae', ResourceManager.stats.LargeMLP)
            .build()
    }

    private static createLargeDigger(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.LARGE_DIGGER, 'Vehicles/LargeDigger/LargeDigger.ae', ResourceManager.stats.LargeDigger)
            .build()
    }

    private static createLargeCat(sceneMgr: SceneManager, entityMgr: EntityManager) {
        return new VehicleEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.LARGE_CAT, 'Vehicles/LargeCat/LargeCat.ae', ResourceManager.stats.LargeCat)
            .driverTraining(RaiderTraining.SAILOR)
            .build()
    }
}
