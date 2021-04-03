import { BaseElement } from '../BaseElement'
import { Button } from './Button'
import { ButtonCfg } from '../../../../cfg/ButtonsCfg'

export class InterfaceBackButton extends Button {

    constructor(parent: BaseElement, btnCfg: ButtonCfg) {
        super(parent, btnCfg)
        this.relX = 4
        this.relY = 14
    }

}
