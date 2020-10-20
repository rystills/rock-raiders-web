import { Group } from 'three';
import { Surface } from './Surface';

export class Terrain {

    textureSet: any = {};
    width: number = 0;
    height: number = 0;
    surfaces: Surface[][] = [];
    floorGroup: Group = new Group();
    roofGroup: Group = new Group();

    constructor() {
        this.roofGroup.visible = false; // keep roof hidden unless switched to other camera
    }

    getSurface(x, y): Surface {
        x = Math.floor(x);
        y = Math.floor(y);
        return this.getSurfaceOrNull(x, y) || new Surface(this, 1, x, y, 0); // 1 = solid rock
    }

    getSurfaceOrNull(x, y): Surface {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.surfaces[x][y];
        } else {
            return null;
        }
    }

}
