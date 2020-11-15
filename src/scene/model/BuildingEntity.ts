import { EventBus } from '../../event/EventBus';
import { BuildingSelected } from '../../event/LocalEvents';
import { Building } from '../../game/model/entity/building/Building';
import { AnimEntity } from './anim/AnimEntity';
import { Selectable, SelectionType } from '../../game/model/Selectable';
import { ResourceManager } from '../../resource/ResourceManager';
import { MathUtils, Vector3 } from 'three';
import { GameState } from '../../game/model/GameState';
import { EntityAddedEvent, EntityType } from '../../event/WorldEvents';
import degToRad = MathUtils.degToRad;

export class BuildingEntity extends AnimEntity implements Selectable {

    type: Building;
    selected: boolean;
    powerSwitch: boolean = true;
    powerLink: boolean = false;
    spawning: boolean = false;

    constructor(buildingType: Building) {
        super(ResourceManager.getAnimationEntityType(buildingType.aeFile));
        this.type = buildingType;
        this.group.userData = {'selectable': this};
        this.pickSphereRadius = 30; // TODO read pick sphere size from cfg
        this.selectionFrameSize = 15;
    }

    getSelectionType(): SelectionType {
        return SelectionType.BUILDING;
    }

    select() {
        this.selectionFrame.visible = true;
        if (!this.selected) {
            this.selected = true;
            EventBus.publishEvent(new BuildingSelected(this));
            return this;
        }
        return null;
    }

    deselect() {
        this.selectionFrame.visible = false;
        this.selected = false;
    }

    getSelectionCenter(): Vector3 {
        return this.pickSphere ? new Vector3().copy(this.pickSphere.position).applyMatrix4(this.group.matrixWorld) : null;
    }

    getSelectionEvent(): BuildingSelected {
        return new BuildingSelected(this);
    }

    getDropPosition(): Vector3 {
        const dropPos = this.getPosition().add(new Vector3(0, 0, this.type.dropPosDist)
            .applyEuler(this.getRotation()).applyAxisAngle(new Vector3(0, 1, 0), degToRad(this.type.dropPosAngleDeg)));
        dropPos.y = this.worldMgr.getTerrainHeight(dropPos.x, dropPos.z);
        return dropPos;
    }

    isPowered(): boolean {
        return this.powerSwitch && (this.type.selfPowered || this.powerLink);
    }

    onDiscover() {
        super.onDiscover();
        const index = GameState.buildingsUndiscovered.indexOf(this);
        if (index !== -1) GameState.buildingsUndiscovered.splice(index, 1);
        GameState.buildings.push(this);
        EventBus.publishEvent(new EntityAddedEvent(EntityType.BUILDING, this));
    }

}
