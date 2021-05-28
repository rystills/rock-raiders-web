import { ResourceManager } from '../../../resource/ResourceManager'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { BuildingActivity } from '../activities/BuildingActivity'
import { RaiderActivity } from '../activities/RaiderActivity'
import { EntityType } from '../EntityType'
import { BuildingEntity } from './BuildingEntity'
import { BuildingEntityBuilder } from './BuildingEntityBuilder'

export class BuildingFactory {

    static createBuildingFromType(entityType: EntityType, sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        switch (entityType) {
            case EntityType.TOOLSTATION:
                return this.createToolstation(sceneMgr, entityMgr)
            case EntityType.TELEPORT_PAD:
                return this.createTeleportPad(sceneMgr, entityMgr)
            case EntityType.DOCKS:
                return this.createDocks(sceneMgr, entityMgr)
            case EntityType.POWER_STATION:
                return this.createPowerStation(sceneMgr, entityMgr)
            case EntityType.BARRACKS:
                return this.createBarracks(sceneMgr, entityMgr)
            case EntityType.UPGRADE:
                return this.createUpgrade(sceneMgr, entityMgr)
            case EntityType.GEODOME:
                return this.createGeodome(sceneMgr, entityMgr)
            case EntityType.ORE_REFINERY:
                return this.createOreRefinery(sceneMgr, entityMgr)
            case EntityType.GUNSTATION:
                return this.createGunStation(sceneMgr, entityMgr)
            case EntityType.TELEPORT_BIG:
                return this.createTeleportBig(sceneMgr, entityMgr)
            default:
                throw 'Unexpected building type: ' + EntityType[entityType]
        }
    }

    static createBarracks(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.BARRACKS, 'Buildings/Barracks/Barracks.ae', ResourceManager.stats.Barracks)
            .build()
    }

    static createPowerStation(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.POWER_STATION, 'Buildings/Powerstation/Powerstation.ae', ResourceManager.stats.Powerstation)
            .secondaryBuildingPart(-1, 0)
            .dropAction(RaiderActivity.Deposit)
            .build()
    }

    static createDocks(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.DOCKS, 'Buildings/Docks/Docks.ae', ResourceManager.stats.Docks)
            .primaryPowerPath(0, -1)
            .waterPathSurface(0, 1)
            .build()
    }

    static createGeodome(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.GEODOME, 'Buildings/Geo-dome/Geo-dome.ae', ResourceManager.stats.Geodome)
            .removePrimaryPowerPath()
            .secondaryBuildingPart(0, 1)
            .build()
    }

    static createGunStation(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.GUNSTATION, 'Buildings/gunstation/gunstation.ae', ResourceManager.stats.GunStation)
            .removePrimaryPowerPath()
            .unpoweredDefaultActivity(BuildingActivity.Stand)
            .build()
    }

    static createOreRefinery(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.ORE_REFINERY, 'Buildings/OreRefinery/OreRefinery.ae', ResourceManager.stats.OreRefinery)
            .primaryPowerPath(0, 2)
            .secondaryBuildingPart(0, 1)
            .dropAction(RaiderActivity.Deposit)
            .build()
    }

    static createTeleportBig(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.TELEPORT_BIG, 'Buildings/BIGTeleport/BIGTeleport.ae', ResourceManager.stats.TeleportBIG)
            .secondaryBuildingPart(1, 0)
            .secondaryPowerPath(1, 1)
            .build()
    }

    static createTeleportPad(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.TELEPORT_PAD, 'Buildings/Teleports/Teleports.ae', ResourceManager.stats.TeleportPad)
            .build()
    }

    static createToolstation(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.TOOLSTATION, 'Buildings/Toolstation/Toolstation.ae', ResourceManager.stats.Toolstation)
            .unblockPathSurface()
            .build()
    }

    static createUpgrade(sceneMgr: SceneManager, entityMgr: EntityManager): BuildingEntity {
        return new BuildingEntityBuilder(sceneMgr, entityMgr)
            .init(EntityType.UPGRADE, 'Buildings/Upgrade/Upgrade.ae', ResourceManager.stats.Upgrade)
            .build()
    }

}
