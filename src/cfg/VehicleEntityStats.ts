import { BaseConfig } from './BaseConfig'

export class VehicleEntityStats extends BaseConfig {

    Levels: number
    CostCrystal: number
    EngineSound: string
    PickSphere: number
    CrossLand: boolean = false
    CrossWater: boolean = false
    CrossLava: boolean = false
    RouteSpeed: number | number[] = []
    SoilDrillTime: number[] = []
    LooseDrillTime: number[] = []
    MedDrillTime: number[] = []
    HardDrillTime: number[] = []
    SeamDrillTime: number[] = []

}
