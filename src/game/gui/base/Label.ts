import { BaseElement } from './BaseElement'
import { ButtonCfg } from '../../../cfg/ButtonsCfg'

export class Label extends BaseElement {

    tooltip: string
    label: string

    constructor(parent: BaseElement, btnCfg: ButtonCfg, label: string) {
        super(parent)
        this.relX = btnCfg.relX
        this.relY = btnCfg.relY
        this.width = btnCfg.width
        this.height = btnCfg.height
        this.tooltip = btnCfg.tooltip
        this.label = label
        this.updatePosition()
    }

    onRedraw(context: CanvasRenderingContext2D) {
        if (this.hidden) return
        context.textAlign = 'center'
        context.font = 'bold 10px Arial'
        context.fillStyle = '#fff'
        context.fillText(this.label, this.x + this.width / 2, this.y + this.height - 2)
        super.onRedraw(context)
    }

}

