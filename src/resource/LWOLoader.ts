// noinspection JSUnusedLocalSymbols,JSBitwiseOperatorUsage

/**
 * @author Marcus-Bizal https://github.com/marcbizal
 * patched by Scarabol
 *
 * This loader loads LWOB files exported from LW6.
 *
 * Support
 *  -
 */

import { AdditiveBlending, BufferAttribute, BufferGeometry, ClampToEdgeWrapping, Color, DoubleSide, MirroredRepeatWrapping, RepeatWrapping, Texture, Vector3 } from 'three'
import { decodeFilepath, decodeString, getFilename } from '../core/Util'
import { SceneMesh } from '../scene/SceneMesh'
import { SequenceTextureMaterial } from '../scene/SequenceTextureMaterial'
import { ResourceManager } from './ResourceManager'

// HEADER SPEC //
const LWO_MAGIC = 0x4C574F42 // "LWOB"
const OFF_MAGIC = 8

/********************/
/* TYPE SIZES START */
/********************/

const ID4_SIZE = 4
const I1_SIZE = 1
const I2_SIZE = 2
const I4_SIZE = 4
const F4_SIZE = 4

const COL4_SIZE = 4
const VEC12_SIZE = 12
const IP2_SIZE = 2
const FP4_SIZE = 4
const DEG4_SIZE = 4

/********************/
/*  TYPE SIZES END  */
/********************/

/*********************/
/* CHUNK TYPES START */
/*********************/

const LWO_FORM = 0x464F524D
const LWO_PNTS = 0x504E5453
const LWO_SFRS = 0x53524653
const LWO_POLS = 0x504F4C53
const LWO_CRVS = 0x43525653
const LWO_PCHS = 0x50434853
const LWO_SURF = 0x53555246

const CHUNK_HEADER_SIZE = 8
const SUBCHUNK_HEADER_SIZE = 6

/*********************/
/*  CHUNK TYPES END  */
/*********************/

/**************************/
/* SURF DEFINITIONS START */
/**************************/

/**************************/
/* SURF DEFINITIONS START */
/**************************/

const SURF_COLR = 0x434F4C52
const SURF_FLAG = 0x464C4147

// Base Shading Values (Fixed Point)
const SURF_LUMI = 0x4C554D49
const SURF_DIFF = 0x44494646
const SURF_SPEC = 0x53504543
const SURF_REFL = 0x5245464C
const SURF_TRAN = 0x5452414E

// Base Shading Values (Floating Point)
const SURF_VLUM = 0x564C554D
const SURF_VDIF = 0x56444946
const SURF_VSPC = 0x56535043
const SURF_VRFL = 0x5646524C
const SURF_VTRN = 0x5654524E

const SURF_GLOS = 0x474C4F53
const SURF_RFLT = 0x52464C54
const SURF_RIMG = 0x52494D47
const SURF_RIND = 0x52494E44
const SURF_EDGE = 0x45444745
const SURF_SMAN = 0x534D414E

/**************************/
/*  SURF DEFINITIONS END  */
/**************************/

/*****************************/
/* TEXTURE DEFINITIONS START */
/*****************************/

// Start of Definition
const SURF_CTEX = 0x43544558
const SURF_DTEX = 0x44544558
const SURF_STEX = 0x53544558
const SURF_RTEX = 0x52544558
const SURF_TTEX = 0x54544558
const SURF_LTEX = 0x4C544558
const SURF_BTEX = 0x42544558

// Flags
const SURF_TFLG = 0x54464C47

// Location and Size
const SURF_TSIZ = 0x5453495A
const SURF_TCTR = 0x54435452
const SURF_TFAL = 0x5446414C
const SURF_TVEL = 0x5456454C

// Color
const SURF_TCLR = 0x54434C52

// Value
const SURF_TVAL = 0x5456414C

// Bump Amplitude
const SURF_TAMP = 0x54414D50

// Image Map
const SURF_TIMG = 0x54494D47

// Image Alpha
const SURF_TALP = 0x54414C50

// Image Wrap Options
const SURF_TWRP = 0x54575250

// Antialiasing Strength
const SURF_TAAS = 0x54414153

// Texture Opacity
const SURF_TOPC = 0x544F5043

/*****************************/
/*  TEXTURE DEFINITIONS END  */
/*****************************/

/*************************/
/* FLAG DEFINITION START */
/*************************/

const LUMINOUS_BIT = 1
const OUTLINE_BIT = 2
const SMOOTHING_BIT = 4
const COLORHIGHLIGHTS_BIT = 8
const COLORFILTER_BIT = 16
const OPAQUEEDGE_BIT = 32
const TRANSPARENTEDGE_BIT = 64
const SHARPTERMINATOR_BIT = 128
const DOUBLESIDED_BIT = 256
const ADDITIVE_BIT = 512
const SHADOWALPHA_BIT = 1024

/*************************/
/*  FLAG DEFINITION END  */
/*************************/

/*************************/
/* TFLG DEFINITION START */
/*************************/

const XAXIS_BIT = 1
const YAXIS_BIT = 2
const ZAXIS_BIT = 4
const WORLDCOORDS_BIT = 8
const NEGATIVEIMAGE_BIT = 16
const PIXELBLENDING_BIT = 32
const ANTIALIASING_BIT = 64

/*************************/
/*  TFLG DEFINITION END  */

/*************************/

function getVector3AtOffset(view, offset) {
    let vector = new Vector3()
    vector.x = view.getFloat32(offset)
    vector.y = view.getFloat32(offset + F4_SIZE)
    vector.z = view.getFloat32(offset + (F4_SIZE * 2))
    return vector
}

function planarMapUVS(geometry, vertices, uvs, indices, materialIndex, size, center, flags) {
    // Check to ensure that one of the flags is set, if not throw an error.
    const mask = XAXIS_BIT | YAXIS_BIT | ZAXIS_BIT
    if (flags & mask) {
        for (let group of geometry.groups) {
            if (group.materialIndex !== materialIndex) continue

            for (let i = group.start; i < group.start + group.count; i++) {

                let vertexIndex = indices[i] * 3
                let x = vertices[vertexIndex] - center.x
                let y = vertices[vertexIndex + 1] - center.y
                let z = vertices[vertexIndex + 2] - center.z

                let uvIndex = indices[i] * 2
                let u = 0
                let v = 0

                if (flags & XAXIS_BIT) {
                    u = z / size.z + 0.5
                    v = y / size.y + 0.5
                } else if (flags & YAXIS_BIT) {
                    u = x / size.x + 0.5
                    v = z / size.z + 0.5
                } else if (flags & ZAXIS_BIT) {
                    u = x / size.x + 0.5
                    v = y / size.y + 0.5
                }

                uvs[uvIndex] = u
                uvs[uvIndex + 1] = v
            }
        }
    } else {
        // console.warn("LWOLoader.planarMapUVS: No axis bit is set!"); // XXX what is this about
    }
}

export class LWOLoader {

    COUNTER_CLOCKWISE: false

    meshPath: string
    entityPath: string
    verbose: boolean = false
    materials: SequenceTextureMaterial[] = []
    geometry: BufferGeometry = new BufferGeometry()
    vertices: Float32Array = null
    indices: Uint16Array = null
    uvs: Float32Array = null

    constructor(meshPath: string, entityPath: string = null, verbose: boolean = false) {
        this.verbose = verbose
        this.meshPath = meshPath
        this.entityPath = entityPath
    }

    parsePoints(view, chunkOffset, chunkSize) {
        if (chunkSize % VEC12_SIZE !== 0) {
            console.error('LWOLoader.parse: F12 does not evenly divide into chunk size (' + chunkSize + '). Possible corruption.')
            return
        }

        let numVertices = (chunkSize / F4_SIZE) / 3
        this.vertices = new Float32Array(numVertices * 3)
        this.uvs = new Float32Array(numVertices * 2)

        for (let i = 0; i < numVertices; i++) {
            let vertexIndex = i * 3
            let vertexOffset = vertexIndex * F4_SIZE
            this.vertices[vertexIndex] = view.getFloat32(chunkOffset + vertexOffset) 				// x
            this.vertices[vertexIndex + 1] = view.getFloat32(chunkOffset + vertexOffset + F4_SIZE) 	// y
            this.vertices[vertexIndex + 2] = view.getFloat32(chunkOffset + vertexOffset + (F4_SIZE * 2)) 	// z
        }
    }

    parseSurfaceNames(buffer, chunkOffset, chunkSize) {
        let textChunk = new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, chunkSize))
        this.materials = textChunk.split('\0').filter((s) => !!s).map((name) => new SequenceTextureMaterial(name))
        if (this.verbose) console.log('LWO contains ' + this.materials.length + ' materials with following names: ' + this.materials.map((m) => m.name))
    }

    parsePolygons(view, chunkOffset, chunkSize) {
        // Gather some initial data so that we can get the proper size
        let totalNumIndices = 0
        let offset = 0
        while (offset < chunkSize) {
            const numIndices = view.getInt16(chunkOffset + offset)
            const materialIndex = view.getInt16(chunkOffset + offset + 2 + (numIndices * 2))

            this.geometry.addGroup(totalNumIndices, (numIndices - 2) * 3, materialIndex - 1)

            totalNumIndices += (numIndices - 2) * 3
            offset += 4 + (numIndices * 2)
        }

        offset = 0
        let currentIndex = 0
        this.indices = new Uint16Array(totalNumIndices)
        while (offset < chunkSize) {
            let numIndices = view.getInt16(chunkOffset + offset)

            offset += 2

            let faceIndices = new Int16Array(numIndices)
            for (let i = 0; i <= numIndices; i++) {
                faceIndices[i] = view.getInt16(chunkOffset + offset + (i * 2))
            }

            for (let i = 0; i < numIndices - 2; i++) {
                if (this.COUNTER_CLOCKWISE) {
                    this.indices[currentIndex++] = faceIndices[0]
                    this.indices[currentIndex++] = faceIndices[i + 2]
                    this.indices[currentIndex++] = faceIndices[i + 1]
                } else {
                    this.indices[currentIndex++] = faceIndices[0]
                    this.indices[currentIndex++] = faceIndices[i + 1]
                    this.indices[currentIndex++] = faceIndices[i + 2]
                }
            }

            offset += 2 + (numIndices * 2)
        }
    }

    parseSurface(view, buffer, chunkOffset, chunkSize) {
        let offset = 0
        while (view.getUint8(chunkOffset + offset) !== 0) offset++

        let materialName = decodeString(new Uint8Array(buffer, chunkOffset, offset))
        if (this.verbose) console.log('Start parsing surface: ' + materialName)
        let materialIndex = -1
        let material: SequenceTextureMaterial = null
        for (let i = 0; i < this.materials.length; i++) {
            if (this.materials[i].name === materialName) {
                materialIndex = i
                material = this.materials[i]
            }
        }
        if (!material) {
            console.error('LWOLoader.parse: Surface in SURF chunk does not exist in SRFS')
            return
        }

        let textureFlags = 0
        let textureSize = new Vector3(0, 0, 0)
        let textureCenter = new Vector3(0, 0, 0)
        // let textureFalloff = new Vector3(0, 0, 0);
        // let textureVelocity = new Vector3(0, 0, 0);

        while (offset < chunkSize) {
            const subChunkOffset = chunkOffset + offset
            if (view.getUint8(subChunkOffset) === 0) {
                offset++
            } else {
                const subChunkType = view.getInt32(subChunkOffset)
                const subChunkSize = view.getInt16(subChunkOffset + ID4_SIZE)

                if (this.verbose) console.log('Parsing sub-chunk ' + new TextDecoder().decode(new Uint8Array(buffer, subChunkOffset, ID4_SIZE)) + ' at ' + subChunkOffset + '; length ' + subChunkSize)

                const currentOffset = subChunkOffset + SUBCHUNK_HEADER_SIZE
                switch (subChunkType) {
                    case SURF_COLR:
                        const colorArray = [
                            view.getUint8(currentOffset + 0) / 255,
                            view.getUint8(currentOffset + 1) / 255,
                            view.getUint8(currentOffset + 2) / 255,
                        ]
                        material.color = new Color().fromArray(colorArray)
                        if (this.verbose) console.log('Material color (COLR): ' + colorArray.join(' '))
                        break
                    case SURF_FLAG:
                        const flags = view.getUint16(currentOffset)
                        if (this.verbose) console.log('Flags (FLAG): ' + flags.toString(2))
                        // if (this.verbose && flags & LUMINOUS_BIT) console.warn('Flag is set but unhandled: luminous') // flag replaced with LUMI below
                        if (this.verbose && flags & OUTLINE_BIT) console.warn('Flag is set but unhandled: outline')
                        if (this.verbose && flags & SMOOTHING_BIT) console.warn('Flag is set but unhandled: smoothing')
                        if (this.verbose && flags & COLORHIGHLIGHTS_BIT) console.warn('Flag is set but unhandled: colorHighlights')
                        if (this.verbose && flags & COLORFILTER_BIT) console.warn('Flag is set but unhandled: colorFilter')
                        if (this.verbose && flags & OPAQUEEDGE_BIT) console.warn('Flag is set but unhandled: opaqueEdge')
                        if (this.verbose && flags & TRANSPARENTEDGE_BIT) console.warn('Flag is set but unhandled: transparentEdge')
                        if (this.verbose && flags & SHARPTERMINATOR_BIT) console.warn('Flag is set but unhandled: sharpTerminator')
                        if (flags & DOUBLESIDED_BIT) material.side = DoubleSide
                        if (flags & ADDITIVE_BIT) {
                            material.blending = AdditiveBlending
                            material.depthWrite = false // otherwise transparent parts "carve out" objects behind
                        }
                        if (this.verbose && flags & SHADOWALPHA_BIT) console.warn('Flag is set but unhandled: shadowAlpha')
                        break
                    case SURF_RIND:
                        const refractiveIndex = view.getFloat32(currentOffset)
                        material.refractionRatio = 1 / refractiveIndex
                        break
                    case SURF_EDGE:
                        const edgeTransparencyThreshold = view.getFloat32(currentOffset)
                        if (this.verbose) console.warn('Edge transparency threshold (0.0 to 1.0): ' + edgeTransparencyThreshold)
                        break
                    case SURF_SMAN:
                        const maxSmoothAngle = view.getFloat32(currentOffset)
                        if (this.verbose) console.warn('Implement maximum angle between two adjacent polygons that can be smooth shaded: ' + maxSmoothAngle)
                        break
                    case SURF_LUMI:
                        const luminosity = view.getInt16(currentOffset) / 256
                        if (this.verbose) console.log('Luminosity (LUMI): ' + luminosity)
                        material.emissiveIntensity = luminosity
                        break
                    case SURF_DIFF:
                        const diffuse = view.getInt16(currentOffset) / 256
                        if (this.verbose) console.log('Diffuse (DIFF): ' + diffuse)
                        if (!diffuse) material.color = null
                        break
                    case SURF_SPEC:
                        const specular = view.getInt16(currentOffset) / 256
                        // material.specular = material.color.multiplyScalar(specular);
                        if (this.verbose) console.warn('Specular (SPEC): ' + specular)
                        break
                    case SURF_REFL:
                        let reflection = 0
                        if (reflection === SURF_VRFL) {
                            reflection = view.getFloat32(currentOffset)
                        } else {
                            reflection = view.getInt16(currentOffset) / 256
                        }
                        material.reflectivity = reflection
                        if (this.verbose) console.log('Reflectivity (REFL): ' + material.reflectivity)
                        break
                    case SURF_TRAN:
                    case SURF_VTRN:
                        let transparency = 0
                        if (subChunkType === SURF_VTRN) {
                            transparency = view.getFloat32(currentOffset)
                        } else {
                            transparency = view.getInt16(currentOffset) / 256
                        }
                        material.setOpacity(1 - transparency)
                        if (this.verbose) console.log('Opacity (TRAN/VTRN): ' + material.opacity)
                        break
                    case SURF_VLUM:
                        const vLuminosity = view.getFloat32(currentOffset)
                        if (this.verbose) console.log('Luminosity (VLUM): ' + vLuminosity)
                        material.emissiveIntensity = vLuminosity
                        break
                    case SURF_VDIF:
                        let vDiffuse = view.getFloat32(currentOffset)
                        if (this.verbose) console.log('Diffuse (VDIF): ' + vDiffuse)
                        // material.vertexColors = !!vDiffuse // XXX push vertex colors first
                        break
                    case SURF_VSPC:
                        let vSpecular = view.getFloat32(currentOffset)
                        // material.specular = material.color.multiplyScalar(vSpecular);
                        if (this.verbose) console.warn('Specular (VSPC): ' + vSpecular)
                        break
                    case SURF_CTEX: // start of new texture sub-chunk
                    case SURF_DTEX:
                    case SURF_STEX:
                    case SURF_RTEX:
                    case SURF_TTEX:
                    case SURF_BTEX:
                        const textureTypeName = decodeFilepath(new Uint8Array(buffer, currentOffset, subChunkSize))
                        if (this.verbose) console.warn('Unhandled texture typename: ' + textureTypeName)
                        // XXX handle different texture types
                        break
                    case SURF_TFLG:
                        textureFlags = view.getUint16(currentOffset)
                        if (this.verbose) console.log('Flags (TFLG): ' + textureFlags.toString(2))
                        if (this.verbose && textureFlags & XAXIS_BIT) console.warn('Flag is set but unhandled: X Axis')
                        if (this.verbose && textureFlags & YAXIS_BIT) console.warn('Flag is set but unhandled: Y Axis')
                        if (this.verbose && textureFlags & ZAXIS_BIT) console.warn('Flag is set but unhandled: Z Axis')
                        if (this.verbose && textureFlags & WORLDCOORDS_BIT) console.warn('Flag is set but unhandled: World Coords')
                        if (this.verbose && textureFlags & NEGATIVEIMAGE_BIT) console.warn('Flag is set but unhandled: Negative Image')
                        if (this.verbose && textureFlags & PIXELBLENDING_BIT) console.warn('Flag is set but unhandled: Pixel Blending')
                        if (this.verbose && textureFlags & ANTIALIASING_BIT) console.log('Flag is set: Antialiasing') // turned on by default
                        break
                    case SURF_TSIZ:
                        textureSize = getVector3AtOffset(view, currentOffset)
                        if (this.verbose) console.log('Texture size (TSIZ): ' + textureSize.toArray().join(' '))
                        break
                    case SURF_TCTR:
                        textureCenter = getVector3AtOffset(view, currentOffset)
                        if (this.verbose) console.warn('Unhandled texture center (TCTR): ' + textureCenter.toArray().join(' '))
                        break
                    case SURF_TCLR:
                        const textureColorArray = [
                            view.getUint8(currentOffset + 0) / 255,
                            view.getUint8(currentOffset + 1) / 255,
                            view.getUint8(currentOffset + 2) / 255,
                            view.getUint8(currentOffset + 3) / 255,
                        ]
                        // const textureColor = new Color().fromArray(textureColorArray);
                        // seems to be 0 0 0 anyway...
                        if (this.verbose) console.log('Unhandled texture color (TCLR): ' + textureColorArray.join(' '))
                        break
                    case SURF_TVAL:
                        const textureValue = view.getUint16(currentOffset) / 256
                        if (this.verbose) console.warn('Unhandled texture value (TVAL): ' + textureValue)
                        break
                    case SURF_TIMG:
                        const textureFilepath = decodeFilepath(new Uint8Array(buffer, currentOffset, subChunkSize))
                        if (this.verbose) console.log('Texture filepath (TIMG): ' + textureFilepath)
                        const lTextureFilename = getFilename(textureFilepath)?.toLowerCase()
                        if (!lTextureFilename || lTextureFilename === '(none)') break
                        material.transparent = material.transparent || !!lTextureFilename.match(/a\d\d\d\D.*bmp/i)
                        const hasSequence = lTextureFilename.endsWith('(sequence)')
                        const sequenceBaseFilepath = lTextureFilename.substring(0, lTextureFilename.length - '(sequence)'.length).trim()
                        let textures: Texture[] = []
                        if (hasSequence) {
                            const match = sequenceBaseFilepath.match(/(.+\D)0+(\d+)\..+/i)
                            textures = ResourceManager.getTexturesBySequenceName(this.meshPath + match[1])
                        } else {
                            const texture = ResourceManager.getMeshTexture(lTextureFilename, this.meshPath, this.entityPath)
                            textures = texture ? [texture] : []
                        }
                        material.setTextures(textures)
                        break
                    case SURF_TWRP:
                        const horizontalWrappingMode = this.parseWrappingMode(view.getUint16(currentOffset))
                        const verticalWrappingMode = this.parseWrappingMode(view.getUint16(currentOffset + 2))
                        material.textures.forEach((t) => {
                            t.wrapS = horizontalWrappingMode
                            t.wrapT = verticalWrappingMode
                        })
                        break
                    case SURF_TAAS: // not supported by threejs
                        // const antialiasingStrength = view.getFloat32(currentOffset)
                        // if (this.verbose) console.log('Antialiasing strength: ' + antialiasingStrength)
                        break
                    default: // TODO implement all LWO features
                        if (this.verbose) console.warn('Found unrecognised SURF sub-chunk type ' + new TextDecoder().decode(new Uint8Array(buffer, subChunkOffset, ID4_SIZE)) + ' (' + subChunkType + ') at ' + subChunkOffset + '; length ' + subChunkSize)
                        break
                }

                offset += SUBCHUNK_HEADER_SIZE + subChunkSize
            }
        }

        planarMapUVS(this.geometry, this.vertices, this.uvs, this.indices, materialIndex, textureSize, textureCenter, textureFlags)

        if (this.verbose) console.log('Done parsing surface: ' + materialName)
    }

    parse(buffer: ArrayBuffer): SceneMesh {
        const view = new DataView(buffer)

        if (view.getUint32(0) !== LWO_FORM) {
            console.error('LWOLoader.parse: Cannot find header.')
            return
        }

        const fileSize = view.getUint32(ID4_SIZE)
        if (fileSize + CHUNK_HEADER_SIZE !== view.byteLength) {
            console.warn('LWOLoader.parse: Discrepancy between size in header (' + (fileSize + CHUNK_HEADER_SIZE) + ' bytes) and actual size (' + view.byteLength + ' bytes).')
        }

        let magicOffset = ID4_SIZE + I4_SIZE
        if (view.getUint32(magicOffset) !== LWO_MAGIC) {
            const magic = decodeString(new Uint8Array(buffer, magicOffset, ID4_SIZE))
            console.error('LWOLoader.parse: Invalid magic ID (' + magic + ') in LWO header.')
            return
        }

        let cursor = 12
        while (cursor < view.byteLength) {
            // Skip null byte padding
            if (view.getUint8(cursor) === 0) {
                cursor++
            } else {
                const chunkType = view.getInt32(cursor)
                const chunkSize = view.getInt32(cursor + ID4_SIZE)

                cursor += CHUNK_HEADER_SIZE

                switch (chunkType) {
                    case LWO_PNTS:
                        this.parsePoints(view, cursor, chunkSize)
                        break
                    case LWO_SFRS:
                        this.parseSurfaceNames(buffer, cursor, chunkSize)
                        break
                    case LWO_POLS:
                        this.parsePolygons(view, cursor, chunkSize)
                        break
                    case LWO_SURF:
                        this.parseSurface(view, buffer, cursor, chunkSize)
                        break
                    default:
                        console.warn('Found unrecognised chunk type ' + decodeString(new Uint8Array(buffer, cursor - CHUNK_HEADER_SIZE, ID4_SIZE)) + ' at ' + cursor)
                }

                cursor += chunkSize
            }

        }

        this.geometry.setAttribute('position', new BufferAttribute(this.vertices, 3))
        this.geometry.setAttribute('uv', new BufferAttribute(this.uvs, 2))
        this.geometry.setIndex(new BufferAttribute(this.indices, 1))
        this.geometry.computeVertexNormals()

        return new SceneMesh(this.geometry, this.materials)
    }

    /**
     * Documentation: https://www.sandbox.de/osg/lightwave.htm
     */
    parseWrappingMode(wrap: number) {
        if (wrap === 0) { // Unsupported texture wrapping mode with black color outside of texture image
            return ClampToEdgeWrapping
        } else if (wrap === 1) {
            return ClampToEdgeWrapping
        } else if (wrap === 2) {
            return RepeatWrapping
        } else if (wrap === 3) {
            return MirroredRepeatWrapping
        } else {
            console.warn('Unexpected texture wrapping mode given: ' + wrap)
            return RepeatWrapping
        }
    }
}
