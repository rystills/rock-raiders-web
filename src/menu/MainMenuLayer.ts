import { MenuEntryCfg } from '../cfg/MenuEntryCfg'
import { BitmapFont } from '../core/BitmapFont'
import { clearIntervalSafe } from '../core/Util'
import { MOUSE_BUTTON, POINTER_EVENT } from '../event/EventTypeEnum'
import { GamePointerEvent } from '../event/GamePointerEvent'
import { GameWheelEvent } from '../event/GameWheelEvent'
import { NATIVE_FRAMERATE } from '../params'
import { ResourceManager } from '../resource/ResourceManager'
import { ScaledLayer } from '../screen/layer/ScreenLayer'
import { MainMenuScreen } from '../screen/MainMenuScreen'
import { MainMenuBaseItem } from './MainMenuBaseItem'
import { MainMenuIconButton } from './MainMenuIconButton'
import { MainMenuLabelButton } from './MainMenuLabelButton'
import { MainMenuLevelButton } from './MainMenuLevelButton'

export class MainMenuLayer extends ScaledLayer {

    screen: MainMenuScreen
    cfg: MenuEntryCfg
    loFont: BitmapFont
    hiFont: BitmapFont
    menuImage: SpriteImage
    titleImage: SpriteImage
    items: MainMenuBaseItem[] = []
    scrollY: number = 0
    scrollSpeedY: number = 0
    scrollInterval = null

    constructor(screen: MainMenuScreen, menuCfg: MenuEntryCfg) {
        super()
        this.screen = screen
        this.cfg = menuCfg
        this.loFont = menuCfg.loFont ? ResourceManager.getBitmapFont(menuCfg.loFont) : null
        this.hiFont = menuCfg.hiFont ? ResourceManager.getBitmapFont(menuCfg.hiFont) : null
        this.menuImage = menuCfg.menuImage ? ResourceManager.getImage(menuCfg.menuImage) : null
        this.titleImage = this.loFont.createTextImage(menuCfg.fullName)

        menuCfg.itemsLabel.forEach((item) => {
            if (item.label) {
                this.items.push(new MainMenuLabelButton(this, item))
            } else {
                this.items.push(new MainMenuIconButton(this, item))
            }
        })

        this.items.sort((a, b) => MainMenuBaseItem.compareZ(a, b))

        this.onRedraw = (context) => {
            context.drawImage(this.menuImage, 0, -this.scrollY)
            if (menuCfg.displayTitle) context.drawImage(this.titleImage, (this.fixedWidth - this.titleImage.width) / 2, this.cfg.position[1])
            this.items.forEach((item, index) => (this.items[this.items.length - 1 - index]).draw(context))
        }
    }

    reset() {
        super.reset()
        this.scrollY = 0
        this.scrollSpeedY = 0
    }

    show() {
        super.show()
        const that = this
        this.scrollInterval = setInterval(() => {
            if (that.scrollSpeedY === 0) return
            that.setScrollY(that.scrollSpeedY)
        }, 1000 / NATIVE_FRAMERATE)
    }

    hide() {
        this.scrollInterval = clearIntervalSafe(this.scrollInterval)
        super.hide()
    }

    handlePointerEvent(event: GamePointerEvent): Promise<boolean> {
        if (event.eventEnum === POINTER_EVENT.MOVE) {
            const [sx, sy] = this.toScaledCoords(event.clientX, event.clientY)
            let hovered = false
            this.items.forEach((item) => {
                if (!hovered) {
                    const absY = sy + (item.scrollAffected ? this.scrollY : 0)
                    hovered = item.checkHover(sx, absY)
                } else {
                    if (item.hover) item.needsRedraw = true
                    item.hover = false
                    item.setReleased()
                }
            })
            if (this.cfg.canScroll) {
                const scrollAreaHeight = 100
                if (sy < scrollAreaHeight) {
                    this.setScrollSpeedY(-(scrollAreaHeight - sy))
                } else if (sy > this.fixedHeight - scrollAreaHeight) {
                    this.setScrollSpeedY(sy - (this.fixedHeight - scrollAreaHeight))
                } else {
                    this.setScrollSpeedY(0)
                }
            }
        } else if (event.eventEnum === POINTER_EVENT.DOWN) {
            if (event.button === MOUSE_BUTTON.MAIN) {
                this.items.forEach((item) => item.checkSetPressed())
            }
        } else if (event.eventEnum === POINTER_EVENT.UP) {
            if (event.button === MOUSE_BUTTON.MAIN) {
                this.items.forEach((item) => {
                    if (item.pressed) {
                        item.setReleased()
                        if (item.actionName.toLowerCase() === 'next') {
                            this.screen.showMainMenu(item.targetIndex)
                        } else if (item.actionName.toLowerCase() === 'selectlevel') {
                            this.screen.selectLevel((item as MainMenuLevelButton).levelKey)
                        } else if (item.actionName) {
                            console.warn('not implemented: ' + item.actionName + ' - ' + item.targetIndex)
                        }
                    }
                })
            }
        }
        if (this.needsRedraw()) this.redraw()
        return new Promise((resolve) => resolve(false))
    }

    private setScrollSpeedY(deltaY: number) {
        this.scrollSpeedY = Math.sign(deltaY) * Math.pow(Math.round(deltaY / 20), 2)
    }

    handleWheelEvent(event: GameWheelEvent): Promise<boolean> {
        if (!this.cfg.canScroll) return new Promise((resolve) => resolve(false))
        this.setScrollY(event.deltaY)
        return new Promise((resolve) => resolve(true))
    }

    private setScrollY(deltaY: number) {
        const scrollYBefore = this.scrollY
        this.scrollY = Math.min(Math.max(this.scrollY + deltaY, 0), this.menuImage.height - this.fixedHeight)
        if (scrollYBefore !== this.scrollY) this.redraw()
    }

    needsRedraw(): boolean {
        return this.items.some((item) => item.needsRedraw)
    }

}
