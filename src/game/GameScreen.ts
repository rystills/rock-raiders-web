import { BaseScreen } from '../screen/BaseScreen';
import { ResourceManager } from './engine/ResourceManager';
import { ScreenLayer } from '../screen/ScreenLayer';
import { SceneManager } from './engine/SceneManager';
import { TerrainLoader } from './engine/TerrainLoader';
import { EventManager } from './engine/EventManager';
import { IngameUI } from './gui/IngameUI';
import { Raycaster, Vector3 } from 'three';
import { Terrain } from './model/Terrain';
import { LWOLoader } from 'three/examples/jsm/loaders/LWOLoader';
import { AnimEntityLoader } from './entity/AnimEntityLoader';

export class GameScreen extends BaseScreen {

    onLevelEnd: (gameResult: string) => void; // TODO game result is actually an objects with much more data
    gameLayer: ScreenLayer;
    sceneManager: SceneManager;
    terrain: Terrain;
    ingameUI: IngameUI;
    levelConf: object;

    constructor(resourceManager: ResourceManager, eventManager: EventManager) {
        super(resourceManager, eventManager);
        this.gameLayer = this.createLayer({zIndex: 0, withContext: false});
        this.eventMgr.addMoveEventListener(this.gameLayer, (cx, cy) => this.moveMouseTorch(cx, cy));
        this.sceneManager = new SceneManager(this.gameLayer.canvas);
        // this.ingameUI = new IngameUI(this);
    }

    startLevel(levelName) {
        console.log('Starting level ' + levelName);
        this.levelConf = this.resMgr.configuration['Lego*']['Levels'][levelName];
        if (!this.levelConf) throw 'Could not find level configuration for "' + levelName + '"'; // TODO error handling
        // console.log(this.levelConf);

        // create terrain mesh and add it to the scene
        this.terrain = new TerrainLoader().loadTerrain(this.resMgr, this.levelConf);
        this.sceneManager.scene.add(this.terrain.floorGroup);

        // load in non-space objects next
        const objectList = this.resMgr.objectLists[this.levelConf['OListFile']];
        Object.values(objectList).forEach((olObject: any) => {
            const lTypeName = olObject.type ? olObject.type.toLowerCase() : olObject.type;
            // all object positions are off by half a tile
            olObject.xPos += 0.5;
            olObject.yPos += 0.5;
            const buildingType = this.resMgr.configuration['Lego*']['BuildingTypes'][olObject.type];
            if (lTypeName === 'TVCamera'.toLowerCase()) {
                // coords need to be rescaled since 1 unit in LRR is 1, but 1 unit in the remake is tileSize (128)
                const tileSize = 1; // TODO scale with surface scale
                this.sceneManager.camera.position.set(olObject.xPos * tileSize, 1.25, olObject.yPos * tileSize);  // TODO scale with terrain/buildings use half of max terrain height
                let targetOffset = new Vector3(-1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), olObject.heading / 180 * Math.PI);
                let target = new Vector3().copy(this.sceneManager.camera.position).add(targetOffset);
                target.y = 0.5; // TODO scale with terrain/buildings use half of max terrain height
                this.sceneManager.controls.target.copy(target);
                this.sceneManager.controls.update();
                // } else if (lTypeName === "Pilot".toLowerCase()) {
                //     note inverted x/y coords for terrain list
                //     const newRaider = new Raider(terrain[parseInt(olObject.yPos, 10)][parseInt(olObject.xPos, 10)]);
                //     newRaider.setCenterX(olObject.xPos * tileSize);
                //     newRaider.setCenterY(olObject.yPos * tileSize);
                //     // convert to radians (note that heading angle is rotated 90 degrees clockwise relative to the remake angles)
                //     newRaider.drawAngle = (olObject.heading - 90) / 180 * Math.PI;
                //     raiders.push(newRaider);
            } else if (buildingType) {
                // FIXME add all parts for this building type not only main space
                console.log(buildingType);
                console.log(olObject);
                const aeUrl = buildingType + '/' + olObject.type + '.ae';
                new AnimEntityLoader().load(aeUrl, (entity) => {
                    console.log('loaded');
                    console.log(entity);
                });
                // const currentSpace = terrain[Math.floor(parseFloat(olObject.yPos))][Math.floor(parseFloat(olObject.xPos))];
                // currentSpace.setTypeProperties(buildingType);
                // currentSpace.headingAngle = (olObject.heading - 90) / 180 * Math.PI;
                // // check if this space was in a wall, but should now be touched
                // checkRevealSpace(currentSpace);
                // // set drawAngle to headingAngle now if this space isn't initially in the fog
                // if (currentSpace.touched) {
                //     currentSpace.drawAngle = currentSpace.headingAngle - Math.PI / 2;
                // }
                // if (currentSpace.powerPathSpace) { // not all buildings have a native power path
                //     // check if this building's power path space was in a wall, but should now be touched
                //     checkRevealSpace(currentSpace.powerPathSpace);
                //     currentSpace.powerPathSpace.setTypeProperties("building power path");
                // }
                // } else if (lTypeName === "PowerCrystal".toLowerCase()) {
                //     const currentSpace = terrain[Math.floor(parseFloat(olObject.yPos))][Math.floor(parseFloat(olObject.xPos))];
                //     collectables.push(new Collectable(currentSpace, "crystal", olObject.xPos, olObject.yPos));
            } else {
                // TODO implement remaining object types like: spider, drives and hovercraft
                console.log('Object type ' + olObject.type + ' not yet implemented');
            }
        });

        // levelConf.numOfCrystals = 0;
        // levelConf.numOfOres = 0;
        // levelConf.numOfDigables = 0;
        // for (let x = 0; x < terrain.length; x++) {
        //     for (let y = 0; y < terrain[x].length; y++) {
        //         const space = terrain[x][y];
        //         levelConf.numOfCrystals += space.containedCrystals;
        //         levelConf.numOfOres += space.containedOre + space.getRubbleOreContained();
        //         levelConf.numOfDigables += space.isDigable() ? 1 : 0;
        //     }
        // }

        // finally show all the layers
        this.gameLayer.show();
        this.show();
    }

    show() {
        super.show();
        this.sceneManager.startRendering();
    }

    hide() {
        this.sceneManager.stopRendering();
        super.hide();
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        if (this.sceneManager) this.sceneManager.renderer.setSize(width, height);
    }

    moveMouseTorch(cx, cy) { // TODO better move this to scene manager?
        const rx = (cx / this.gameLayer.canvas.width) * 2 - 1;
        const ry = -(cy / this.gameLayer.canvas.height) * 2 + 1;
        const raycaster = new Raycaster();
        raycaster.setFromCamera({x: rx, y: ry}, this.sceneManager.camera);
        const intersects = raycaster.intersectObjects(this.terrain.floorGroup.children, true);
        if (intersects.length > 0) {
            const hit = intersects[0].point;
            hit.y += 3; // TODO adapt to terrain scale?
            this.sceneManager.cursorTorchlight.position.copy(hit);
        }
    }

}
