import { AdditiveBlending, Color } from 'three'
import { ResourceManager } from '../../../resource/ResourceManager'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { EntityType } from '../EntityType'
import { PriorityIdentifier } from '../job/PriorityIdentifier'
import { MaterialEntity } from './MaterialEntity'
import { MaterialEntityBuilder } from './MaterialEntityBuilder'

export class MaterialFactory {

    private static createCrystal(sceneMgr: SceneManager, entityMgr: EntityManager): MaterialEntity {
        return new MaterialEntityBuilder(sceneMgr, entityMgr, EntityType.CRYSTAL)
            .priorityIdentifier(PriorityIdentifier.aiPriorityCrystal)
            .stats(ResourceManager.stats.PowerCrystal)
            .addLwoModel('MiscAnims/Crystal/vlp_greencrystal.lwo', (mat) => {
                mat.blending = AdditiveBlending
                mat.depthWrite = false // otherwise transparent parts "carve out" objects behind
                mat.setOpacity(0.5) // XXX read from LWO file?
            }, 1.75)
            .addLwoModel('World/Shared/Crystal.lwo', (mat) => {
                mat.emissive = new Color(0, 8, 0) // XXX read from LWO file?
                mat.color = new Color(0, 0, 0) // XXX read from LWO file?
                mat.setOpacity(0.9) // XXX read from LWO file?
            })
            .build()
    }

    private static createOre(sceneMgr: SceneManager, entityMgr: EntityManager): MaterialEntity {
        return new MaterialEntityBuilder(sceneMgr, entityMgr, EntityType.ORE)
            .priorityIdentifier(PriorityIdentifier.aiPriorityOre)
            .stats(ResourceManager.stats.Ore)
            .addLwoModel('MiscAnims/Ore/Ore1st.lwo')
            .build()
    }

    private static createDynamite(sceneMgr: SceneManager, entityMgr: EntityManager): MaterialEntity {
        return new MaterialEntityBuilder(sceneMgr, entityMgr, EntityType.DYNAMITE)
            .addAnimatedEntity('MiscAnims/Dynamite/Dynamite.ae')
            .priorityIdentifier(PriorityIdentifier.aiPriorityDestruction)
            .build()
    }

    private static createBarrier(sceneMgr: SceneManager, entityMgr: EntityManager): MaterialEntity {
        return new MaterialEntityBuilder(sceneMgr, entityMgr, EntityType.BARRIER)
            .addAnimatedEntity('MiscAnims/Barrier/Barrier.ae')
            .priorityIdentifier(PriorityIdentifier.aiPriorityConstruction)
            .build()
    }

    private static createElectricFence(sceneMgr: SceneManager, entityMgr: EntityManager): MaterialEntity {
        return new MaterialEntityBuilder(sceneMgr, entityMgr, EntityType.ELECTRIC_FENCE)
            .priorityIdentifier(PriorityIdentifier.aiPriorityConstruction)
            .stats(ResourceManager.stats.ElectricFence)
            .build()
    }

}
