import { Vector2, Vector3 } from 'three'
import { PausableTimeout, setPausableTimeout } from '../core/PausableTimeout'
import { EventBus } from '../event/EventBus'
import { EventKey } from '../event/EventKeyEnum'
import { SelectionChanged, SelectPanelType } from '../event/LocalEvents'
import { JobCreateEvent } from '../event/WorldEvents'
import { ADDITIONAL_RAIDER_PER_SUPPORT, MAX_RAIDER_BASE, NATIVE_FRAMERATE, TILESIZE } from '../params'
import { BaseEntity } from './model/BaseEntity'
import { BuildingEntity } from './model/building/BuildingEntity'
import { BuildingSite } from './model/building/BuildingSite'
import { EntityType } from './model/EntityType'
import { GameSelection } from './model/GameSelection'
import { Surface } from './model/map/Surface'
import { MaterialEntity } from './model/material/MaterialEntity'
import { Bat } from './model/monster/Bat'
import { RockMonster } from './model/monster/RockMonster'
import { SmallSpider } from './model/monster/SmallSpider'
import { Raider } from './model/raider/Raider'
import { RaiderTraining } from './model/raider/RaiderTraining'
import { VehicleEntity } from './model/vehicle/VehicleEntity'

export class EntityManager {

    private static readonly TARGET_INTERVAL_MS: number = 1000 / NATIVE_FRAMERATE

    updateEntitiesTimeout: PausableTimeout = null
    sleepForMs: number = null
    elapsedGameTimeMs: number = 0
    selection: GameSelection = new GameSelection()
    buildings: BuildingEntity[] = []
    buildingsUndiscovered: BuildingEntity[] = []
    raiders: Raider[] = []
    raidersUndiscovered: Raider[] = []
    materials: MaterialEntity[] = []
    materialsUndiscovered: MaterialEntity[] = []
    buildingSites: BuildingSite[] = []
    spiders: SmallSpider[] = []
    bats: Bat[] = []
    rockMonsters: RockMonster[] = []
    vehicles: VehicleEntity[] = []
    vehiclesUndiscovered: VehicleEntity[] = []

    constructor() {
        // event handler must be placed here, because only this class knows the "actual" selection instance
        EventBus.registerEventListener(EventKey.SELECTION_CHANGED, (event: SelectionChanged) => {
            if (event.selectPanelType === SelectPanelType.NONE) this.selection.deselectAll()
        })
        EventBus.registerEventListener(EventKey.PAUSE_GAME, () => {
            this.pause()
        })
        EventBus.registerEventListener(EventKey.UNPAUSE_GAME, () => {
            this.unPause()
        })
    }

    reset() {
        this.elapsedGameTimeMs = 0
        this.selection = new GameSelection()
        this.buildings = []
        this.buildingsUndiscovered = []
        this.raiders = []
        this.raidersUndiscovered = []
        this.materials = []
        this.materialsUndiscovered = []
        this.buildingSites = []
        this.spiders = []
        this.bats = []
        this.rockMonsters = []
        this.vehicles = []
        this.vehiclesUndiscovered = []
    }

    start() {
        this.updateAllEntities()
    }

    updateAllEntities() {
        const startUpdate = window.performance.now()
        this.elapsedGameTimeMs += EntityManager.TARGET_INTERVAL_MS
        this.forEachEntity((e) => e.update(EntityManager.TARGET_INTERVAL_MS))
        const endUpdate = window.performance.now()
        const updateDurationMs = endUpdate - startUpdate
        this.sleepForMs = EntityManager.TARGET_INTERVAL_MS - Math.round(updateDurationMs)
        this.updateEntitiesTimeout?.pause()
        this.updateEntitiesTimeout = setPausableTimeout(this.updateAllEntities.bind(this), this.sleepForMs > 0 ? this.sleepForMs : 0)
    }

    stop() {
        this.updateEntitiesTimeout?.pause()
        this.forEachEntity((e) => e.removeFromScene())
        this.reset()
    }

    pause() {
        this.updateEntitiesTimeout?.pause()
        this.forEachEntity((e) => e.onPause())
    }

    unPause() {
        this.forEachEntity((e) => e.onUnPause())
        this.updateEntitiesTimeout?.unPause()
    }

    forEachEntity(callback: (e: BaseEntity) => any) {
        this.buildings.forEach((b) => callback(b))
        this.buildingsUndiscovered.forEach((b) => callback(b))
        this.raiders.forEach((r) => callback(r))
        this.raidersUndiscovered.forEach((r) => callback(r))
        this.materials.forEach((m) => callback(m))
        this.materialsUndiscovered.forEach((m) => callback(m))
        this.spiders.forEach((m) => callback(m))
        this.bats.forEach((b) => callback(b))
        this.rockMonsters.forEach((r) => callback(r))
        this.vehicles.forEach((v) => callback(v))
        this.vehiclesUndiscovered.forEach((v) => callback(v))
    }

    getBuildingsByType(...buildingTypes: EntityType[]): BuildingEntity[] {
        return this.buildings.filter(b => b.isUsable() && buildingTypes.some(bt => b.entityType === bt))
    }

    getClosestBuildingByType(position: Vector3, ...buildingTypes: EntityType[]): BuildingEntity {
        return EntityManager.getClosestBuilding(this.getBuildingsByType(...buildingTypes), position)
    }

    getTrainingSites(training: RaiderTraining): BuildingEntity[] {
        return this.buildings.filter((b) => b.isTrainingSite(training))
    }

    getClosestTrainingSite(position: Vector3, training: RaiderTraining) {
        return EntityManager.getClosestBuilding(this.getTrainingSites(training), position)
    }

    private static getClosestBuilding(buildings: BuildingEntity[], position: Vector3) {
        let closest = null, minDist = null
        buildings.forEach((b) => {
            const bPos = b.getPosition()
            const dist = position.distanceToSquared(bPos) // TODO better use pathfinding
            if (closest === null || dist < minDist) {
                closest = b
                minDist = dist
            }
        })
        return closest // TODO when using path finding, return path instead
    }

    getMaxRaiders(): number {
        return MAX_RAIDER_BASE + this.buildings.count((b) => b.isUsable() && b.entityType === EntityType.BARRACKS) * ADDITIONAL_RAIDER_PER_SUPPORT
    }

    discoverSurface(surface: Surface) {
        const minX = surface.x * TILESIZE, minZ = surface.y * TILESIZE
        const maxX = minX + TILESIZE, maxZ = minZ + TILESIZE
        this.discoverEntities(this.raidersUndiscovered, minX, maxX, minZ, maxZ)
        this.discoverEntities(this.buildingsUndiscovered, minX, maxX, minZ, maxZ)
        this.discoverEntities(this.materialsUndiscovered, minX, maxX, minZ, maxZ)
    }

    discoverEntities(undiscovered: BaseEntity[], minX, maxX, minZ, maxZ) {
        const discovered = []
        undiscovered.forEach((e) => {
            const pos = e.getPosition()
            if (pos.x >= minX && pos.x < maxX && pos.z >= minZ && pos.z < maxZ) {
                e.onDiscover()
                discovered.push(e)
            }
        })
        discovered.forEach((r) => undiscovered.remove(r))
    }

    placeMaterial(item: MaterialEntity, worldPosition: Vector2) {
        item.addToScene(worldPosition, 0)
        if (item.sceneEntity.visible) {
            this.materials.push(item)
            EventBus.publishEvent(new JobCreateEvent(item.createCarryJob()))
        } else {
            this.materialsUndiscovered.push(item)
        }
        return item
    }

    getOxygenSum(): number {
        return this.raiders.map((r) => r.stats.OxygenCoef).reduce((l, r) => l + r, 0) +
            this.buildings.map((b) => b.isUsable() ? b.stats.OxygenCoef : 0).reduce((l, r) => l + r, 0)
    }

    hasMaxRaiders(): boolean {
        return this.raiders.length >= this.getMaxRaiders()
    }

}
