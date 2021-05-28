import { DoubleSide, MeshPhongMaterial, Texture } from 'three'
import { PausableInterval, setPausableInterval } from '../core/PausableInterval'
import { SEQUENCE_TEXTURE_FRAMERATE } from '../params'

export class SequenceTextureMaterial extends MeshPhongMaterial {

    textures: Texture[] = []
    sequenceInterval: PausableInterval = null

    constructor(name: string) {
        super({
            side: DoubleSide,
            alphaToCoverage: true,
            shininess: 0,
        })
        this.name = name
    }

    clone(): this {
        const clone = super.clone() as this
        clone.setTextures(this.textures)
        return clone
    }

    dispose() {
        super.dispose()
        this.sequenceInterval?.pause()
    }

    setTextures(textures: Texture[]) {
        this.textures = textures
        this.sequenceInterval?.pause()
        if (textures.length < 1) return
        if (textures.length > 1) {
            let seqNum = 0
            this.sequenceInterval = setPausableInterval(() => {
                this.map = textures[seqNum++]
                if (seqNum >= textures.length) seqNum = 0
            }, 1000 / SEQUENCE_TEXTURE_FRAMERATE)
        }
        this.map = textures[0]
        this.color.set(0xFFFFFF) // overwrite color, when color map (texture) in use
    }

    setOpacity(opacity: number) {
        this.opacity = opacity
        this.transparent = this.transparent || this.opacity < 1
    }

}
