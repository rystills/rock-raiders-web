import { Vector2 } from 'three'
import { Sample } from '../audio/Sample'
import { LevelEntryCfg } from '../cfg/LevelsCfg'
import { NerpParser } from '../core/NerpParser'
import { NerpRunner } from '../core/NerpRunner'
import { PausableInterval, setPausableInterval } from '../core/PausableInterval'
import { EventBus } from '../event/EventBus'
import { EventKey } from '../event/EventKeyEnum'
import { AirLevelChanged, RaidersChangedEvent } from '../event/LocalEvents'
import { RequestedRaidersChanged } from '../event/WorldEvents'
import { CHECK_SPAWN_RAIDER_TIMER, TILESIZE, UPDATE_OXYGEN_TIMER } from '../params'
import { ResourceManager } from '../resource/ResourceManager'
import { EntityManager } from './EntityManager'
import { RaiderActivity } from './model/activities/RaiderActivity'
import { EntityType } from './model/EntityType'
import { GameResultState } from './model/GameResult'
import { GameState } from './model/GameState'
import { MoveJob } from './model/job/raider/MoveJob'
import { Raider } from './model/raider/Raider'
import { SceneManager } from './SceneManager'

export class WorldManager {

    sceneMgr: SceneManager // TODO can be removed, when entities are decoupled from their scene mesh/entity
    entityMgr: EntityManager
    nerpRunner: NerpRunner = null
    oxygenUpdateInterval: PausableInterval = null
    spawnRaiderInterval: PausableInterval = null
    oxygenRate: number = 0

    constructor() {
        EventBus.registerEventListener(EventKey.CAVERN_DISCOVERED, () => {
            GameState.discoveredCaverns++
        })
        EventBus.registerEventListener(EventKey.REQUESTED_RAIDERS_CHANGED, () => {
            if (GameState.requestedRaiders > 0 && !this.spawnRaiderInterval) {
                this.spawnRaiderInterval = setPausableInterval(this.checkSpawnRaiders.bind(this), CHECK_SPAWN_RAIDER_TIMER)
            }
        })
        EventBus.registerEventListener(EventKey.PAUSE_GAME, () => {
            this.nerpRunner?.pauseExecution()
            this.oxygenUpdateInterval?.pause()
            this.spawnRaiderInterval?.pause()
        })
        EventBus.registerEventListener(EventKey.UNPAUSE_GAME, () => {
            this.nerpRunner?.startExecution()
            this.oxygenUpdateInterval?.unPause()
            this.spawnRaiderInterval?.unPause()
        })
    }

    setup(levelConf: LevelEntryCfg, onLevelEnd: (state: GameResultState) => any) {
        GameState.totalCaverns = levelConf.reward?.quota?.caverns || 0
        this.oxygenRate = levelConf.oxygenRate
        // load nerp script
        this.nerpRunner = NerpParser.parse(this.entityMgr, ResourceManager.getResource(levelConf.nerpFile))
        this.nerpRunner.messages.push(...(ResourceManager.getResource(levelConf.nerpMessageFile)))
        this.nerpRunner.onLevelEnd = onLevelEnd
    }

    start() {
        this.nerpRunner?.startExecution()
        this.oxygenUpdateInterval = setPausableInterval(this.updateOxygen.bind(this), UPDATE_OXYGEN_TIMER)
    }

    stop() {
        this.spawnRaiderInterval?.pause()
        this.oxygenUpdateInterval?.pause()
        this.nerpRunner?.pauseExecution()
    }

    updateOxygen() {
        const sum = this.entityMgr.getOxygenSum()
        const rateMultiplier = 0.001
        const valuePerSecond = 1 / 25
        const msToSeconds = 0.001
        const diff = sum * this.oxygenRate * rateMultiplier * valuePerSecond * UPDATE_OXYGEN_TIMER * msToSeconds / 10
        const airLevel = Math.min(1, Math.max(0, GameState.airLevel + diff))
        if (GameState.airLevel !== airLevel) {
            GameState.airLevel = airLevel
            EventBus.publishEvent(new AirLevelChanged(GameState.airLevel))
        }
    }

    checkSpawnRaiders() {
        if (GameState.requestedRaiders < 1) {
            this.spawnRaiderInterval?.pause()
            return
        }
        if (this.entityMgr.hasMaxRaiders()) return
        const spawnBuildings = this.entityMgr.getBuildingsByType(EntityType.TOOLSTATION, EntityType.TELEPORT_PAD)
        for (let c = 0; c < spawnBuildings.length && GameState.requestedRaiders > 0; c++) {
            const station = spawnBuildings[c]
            if (station.spawning) continue
            GameState.requestedRaiders--
            EventBus.publishEvent(new RequestedRaidersChanged(GameState.requestedRaiders))
            station.spawning = true
            const raider = new Raider(this.sceneMgr, this.entityMgr)
            const heading = station.getHeading()
            raider.addToScene(new Vector2(0, TILESIZE / 2).rotateAround(new Vector2(0, 0), -heading).add(station.getPosition2D()), heading)
            raider.playPositionalAudio(Sample[Sample.SND_teleport], false)
            raider.changeActivity(RaiderActivity.TeleportIn, () => {
                station.spawning = false
                raider.changeActivity()
                raider.sceneEntity.createPickSphere(raider.stats.PickSphere, raider)
                const walkOutPos = station.primaryPathSurface.getRandomPosition()
                raider.setJob(new MoveJob(walkOutPos))
                this.entityMgr.raiders.push(raider)
                EventBus.publishEvent(new RaidersChangedEvent(this.entityMgr))
            })
        }
    }

}
