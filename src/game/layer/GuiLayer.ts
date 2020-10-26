import { ScaledLayer } from '../../screen/ScreenLayer';
import { ResourceManager } from '../engine/ResourceManager';
import { InfoDockPanel, MessagePanel, Panel, RadarPanel } from '../../gui/Panel';
import { BaseElement } from '../../gui/BaseElement';

export class GuiLayer extends ScaledLayer {

    rootElement: BaseElement = new BaseElement();
    panelRadar: RadarPanel;
    panelMessages: MessagePanel;
    panelMessagesSide: Panel;
    panelCrystalSideBar: Panel;
    panelTopPanel: Panel;
    panelInformation: Panel;
    panelPriorityList: Panel;
    panelCameraControl: Panel;
    panelInfoDock: InfoDockPanel;
    panelEncyclopedia: Panel;

    constructor() {
        super(640, 480);
        const panelsCfg = ResourceManager.cfg('Panels640x480');
        const buttonsCfg = ResourceManager.cfg('Buttons640x480');
        this.panelRadar = this.rootElement.addChild(new RadarPanel('Panel_Radar', panelsCfg, buttonsCfg));
        this.panelMessages = this.rootElement.addChild(new MessagePanel('Panel_Messages', panelsCfg, buttonsCfg));
        this.panelMessagesSide = this.rootElement.addChild(new Panel('Panel_MessagesSide', panelsCfg, buttonsCfg));
        this.panelCrystalSideBar = this.rootElement.addChild(new Panel('Panel_CrystalSideBar', panelsCfg, buttonsCfg));
        this.panelTopPanel = this.rootElement.addChild(new Panel('Panel_TopPanel', panelsCfg, buttonsCfg));
        this.panelInformation = this.rootElement.addChild(new Panel('Panel_Information', panelsCfg, buttonsCfg));
        this.panelPriorityList = this.rootElement.addChild(new Panel('Panel_PriorityList', panelsCfg, buttonsCfg));
        this.panelCameraControl = this.rootElement.addChild(new Panel('Panel_CameraControl', panelsCfg, buttonsCfg));
        this.panelInfoDock = this.rootElement.addChild(new InfoDockPanel('Panel_InfoDock', panelsCfg, buttonsCfg));
        this.panelEncyclopedia = this.rootElement.addChild(new Panel('Panel_Encyclopedia', panelsCfg, buttonsCfg));
        this.rootElement.children = this.rootElement.children.reverse(); // reverse: earlier in cfg means higher z-value
        this.onRedraw = (context: CanvasRenderingContext2D) => {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            this.rootElement.onRedraw(context);
        };
    }

    handlePointerEvent(eventType: string, event: PointerEvent): boolean {
        const [cx, cy] = this.toCanvasCoords(event.clientX, event.clientY);
        const [sx, sy] = this.toScaledCoords(event.clientX, event.clientY);
        const hit = !this.context || this.context.getImageData(cx, cy, 1, 1).data[3] > 0;
        let needsRedraw = false;
        if (hit) {
            event.preventDefault();
            if (eventType === 'pointermove') {
                needsRedraw = this.rootElement.checkHover(sx, sy) || needsRedraw;
            } else if (eventType === 'pointerdown') {
                needsRedraw = this.rootElement.checkClick(sx, sy) || needsRedraw;
            } else if (eventType === 'pointerup') {
                needsRedraw = this.rootElement.checkRelease(sx, sy) || needsRedraw;
            }
        } else if (eventType === 'pointermove') {
            needsRedraw = this.rootElement.release() || needsRedraw;
        }
        if (needsRedraw) this.redraw(); // TODO performance: only redraw certain buttons/panels?
        return hit;
    }

    handleWheelEvent(eventType: string, event: WheelEvent): boolean {
        const [cx, cy] = this.toCanvasCoords(event.clientX, event.clientY);
        return !this.context || this.context.getImageData(cx, cy, 1, 1).data[3] > 0;
    }

}
