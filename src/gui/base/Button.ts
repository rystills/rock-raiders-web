import { SoundManager } from '../../audio/SoundManager'
import { ButtonCfg } from '../../cfg/ButtonCfg'
import { MOUSE_BUTTON } from '../../event/EventTypeEnum'
import { GuiResourceCache } from '../GuiResourceCache'
import { BaseElement } from './BaseElement'

export class Button extends BaseElement {

    buttonType: string = null
    sfxName: string = null
    imgNormal: SpriteImage = null
    imgHover: SpriteImage = null
    imgPressed: SpriteImage = null
    imgDisabled: SpriteImage = null
    tooltip: string = null
    sfxTooltip: string = null

    constructor(parent: BaseElement, btnCfg: ButtonCfg) {
        super(parent)
        if (Array.isArray(btnCfg.buttonType)) {
            [this.buttonType, this.sfxName] = btnCfg.buttonType
        } else {
            this.buttonType = btnCfg.buttonType
        }
        this.imgNormal = GuiResourceCache.getImageOrNull(btnCfg.normalFile)
        this.imgHover = GuiResourceCache.getImageOrNull(btnCfg.highlightFile)
        this.imgPressed = GuiResourceCache.getImageOrNull(btnCfg.pressedFile)
        this.imgDisabled = GuiResourceCache.getImageOrNull(btnCfg.disabledFile)
        this.relX = btnCfg.relX
        this.relY = btnCfg.relY
        this.width = btnCfg.width || this.imgNormal?.width || this.imgPressed?.width || this.imgHover?.width
        this.height = btnCfg.height || this.imgNormal?.height || this.imgPressed?.height || this.imgHover?.height
        if (Array.isArray(btnCfg.tooltip)) {
            [this.tooltip, this.sfxTooltip] = btnCfg.tooltip
        } else {
            this.tooltip = btnCfg.tooltip
        }
        this.tooltip = this.tooltip?.replace(/_/g, ' ')
        this.updatePosition()
        this.onClick = () => console.log('button pressed: ' + this.buttonType)
    }

    showTooltip() {
        // TODO show tooltip rendering
        if (this.sfxName) SoundManager.playSound(this.sfxName)
        if (this.sfxTooltip) SoundManager.playSound(this.sfxTooltip)
    }

    checkHover(cx, cy): boolean {
        const stateChanged = super.checkHover(cx, cy)
        if (stateChanged) this.notifyRedraw()
        return stateChanged
    }

    checkClick(cx, cy, button: MOUSE_BUTTON): boolean {
        const stateChanged = super.checkClick(cx, cy, button)
        if (stateChanged) this.notifyRedraw()
        return stateChanged
    }

    checkRelease(cx, cy, button: MOUSE_BUTTON): boolean {
        const stateChanged = super.checkRelease(cx, cy, button)
        if (stateChanged) this.notifyRedraw()
        return stateChanged
    }

    release(): boolean {
        const stateChanged = super.release()
        if (stateChanged) this.notifyRedraw()
        return stateChanged
    }

    onRedraw(context: SpriteContext) {
        if (this.hidden) return
        let img = this.imgNormal
        if (this.disabled) {
            img = this.imgDisabled || this.imgPressed || this.imgNormal
        } else if (this.pressedByButton !== null) {
            img = this.imgPressed || this.imgNormal
        } else if (this.hover) {
            img = this.imgHover || this.imgNormal
        }
        if (img) context.drawImage(img, this.x, this.y)
        super.onRedraw(context)
    }

}

