import { Vector2 } from 'three'
import { getRandom, getRandomInclusive } from '../../../core/Util'
import { TILESIZE } from '../../../params'
import { ResourceManager } from '../../../resource/ResourceManager'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { AnimEntityActivity } from '../activities/AnimEntityActivity'
import { EntityType } from '../EntityType'
import { SurfaceType } from '../map/SurfaceType'
import { MoveState } from '../MoveState'
import { PathTarget } from '../PathTarget'
import { Monster } from './Monster'

export class SmallSpider extends Monster {

    idleTimer: number = 0
    radiusSq: number = 0

    constructor(sceneMgr: SceneManager, entityMgr: EntityManager) {
        super(sceneMgr, entityMgr, EntityType.SMALL_SPIDER, 'Creatures/SpiderSB/SpiderSB.ae')
        this.floorOffset = 1 // TODO rotate spider according to surface normal vector
    }

    get stats() {
        return ResourceManager.stats.SmallSpider
    }

    update(elapsedMs: number) {
        this.idleTimer -= elapsedMs
        if (this.idleTimer > 0) return
        if (this.target.length > 0 && this.moveToClosestTarget(this.target) === MoveState.MOVED) { // TODO consider elapsed time when moving
            if (!this.sceneMgr.terrain.getSurfaceFromWorld(this.getPosition()).surfaceType.floor) {
                this.onDeath()
            }
        } else {
            this.changeActivity()
            this.target = [this.findTarget()]
            this.idleTimer = 1000 + getRandom(9000)
        }
    }

    private findTarget(): PathTarget {
        const terrain = this.sceneMgr.terrain
        const currentCenter = terrain.getSurfaceFromWorld(this.getPosition()).getCenterWorld()
        for (let c = 0; c < 20; c++) {
            const targetX = getRandomInclusive(currentCenter.x - (TILESIZE + TILESIZE / 2), currentCenter.x + TILESIZE + TILESIZE / 2)
            const targetZ = getRandomInclusive(currentCenter.z - TILESIZE / 2, currentCenter.z + TILESIZE / 2)
            const surfaceType = terrain.getSurfaceFromWorldXZ(targetX, targetZ).surfaceType
            if (surfaceType !== SurfaceType.WATER && surfaceType !== SurfaceType.LAVA) { // TODO evaluate CrossLand, CrossLava, CrossWater from stats
                return new PathTarget(new Vector2(targetX, targetZ))
            }
        }
        console.warn('Could not find a target')
        return null
    }

    onDeath() {
        this.removeFromScene()
        this.entityMgr.spiders.remove(this)
    }

    changeActivity(activity: AnimEntityActivity = this.getDefaultActivity(), onAnimationDone: () => any = null, durationTimeMs: number = null) {
        super.changeActivity(activity, onAnimationDone, durationTimeMs)
        this.radiusSq = this.sceneEntity.getRadiusSquare()
    }

}
