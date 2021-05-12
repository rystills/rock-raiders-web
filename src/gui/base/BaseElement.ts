import { EventKey } from '../../event/EventKeyEnum'
import { ChangeCursor, LocalEvent } from '../../event/LocalEvents'
import { Cursor } from '../../screen/Cursor'

export class BaseElement {

    parent: BaseElement = null
    x: number = 0
    y: number = 0
    relX: number = 0
    relY: number = 0
    width: number = 0
    height: number = 0
    children: BaseElement[] = []
    hidden: boolean = false
    disabled: boolean = false
    hover: boolean = false
    pressed: boolean = false
    onClick: () => any = null
    onPublishEvent: (event: LocalEvent) => any = (event) => console.log('TODO publish event: ' + EventKey[event.eventKey])

    constructor(parent: BaseElement) {
        this.parent = parent
    }

    reset() {
        this.hidden = false
        this.disabled = false
        this.hover = false
        this.pressed = false
        this.children.forEach((c) => c.reset())
    }

    addChild<T extends BaseElement>(child: T): T {
        child.parent = this
        this.children.push(child)
        child.updatePosition()
        return child
    }

    onRedraw(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
        if (this.hidden) return
        this.children.forEach((child) => child.onRedraw(context))
        this.children.forEach((child) => child.drawHover(context))
        this.children.forEach((child) => child.drawTooltip(context))
    }

    drawHover(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    }

    // noinspection JSUnusedLocalSymbols
    drawTooltip(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    }

    isInactive(): boolean {
        for (let parent = this.parent; !!parent; parent = parent.parent) if (parent.isInactive()) return true
        return this.hidden || this.disabled
    }

    hide() {
        this.hidden = true
        this.children.forEach((child) => child.hide())
    }

    show() {
        this.hidden = false
        this.children.forEach((child) => child.show())
    }

    updatePosition() {
        this.x = this.parent ? this.parent.x + this.relX : this.relX
        this.y = this.parent ? this.parent.y + this.relY : this.relY
        this.children.forEach((child) => child.updatePosition())
    }

    isInRect(cx, cy) {
        return cx >= this.x && cy >= this.y && cx < this.x + this.width && cy < this.y + this.height
    }

    checkHover(cx, cy): boolean {
        if (this.isInactive()) return false
        const inRect = this.isInRect(cx, cy)
        let stateChanged = this.hover !== inRect
        this.hover = inRect
        this.pressed = this.pressed && this.hover
        // TODO start tooltip timeout (if not already started)
        this.children.forEach((child) => stateChanged = child.checkHover(cx, cy) || stateChanged)
        return stateChanged
    }

    checkClick(cx, cy): boolean {
        if (this.isInactive()) return false
        const inRect = this.isInRect(cx, cy)
        let stateChanged = this.pressed !== inRect
        this.pressed = inRect
        this.children.forEach((child) => stateChanged = child.checkClick(cx, cy) || stateChanged)
        return stateChanged
    }

    checkRelease(cx, cy): boolean {
        if (this.isInactive()) return false
        const inRect = this.isInRect(cx, cy)
        if (inRect && this.pressed && this.onClick) this.clicked()
        let stateChanged = false
        this.children.forEach((child) => stateChanged = child.checkRelease(cx, cy) || stateChanged)
        stateChanged = this.pressed || stateChanged
        this.pressed = false
        return stateChanged
    }

    clicked() {
        this.publishEvent(new ChangeCursor(Cursor.Pointer_Okay, 1000))
        this.onClick()
    }

    release(): boolean {
        let stateChanged = this.pressed || this.hover
        this.pressed = false
        this.hover = false
        this.children.forEach((child) => stateChanged = child.release() || stateChanged)
        return stateChanged
    }

    notifyRedraw() {
        this.parent?.notifyRedraw()
    }

    publishEvent(event: LocalEvent) {
        if (this.parent) this.parent.publishEvent(event)
        else this.onPublishEvent(event)
    }

    registerEventListener(eventKey: EventKey, callback: (GameEvent) => any) {
        this.parent.registerEventListener(eventKey, callback)
    }

}
