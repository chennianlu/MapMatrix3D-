import * as THREE from "three";
import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";
import { EffectGround } from "@enerv-3d/core";

import { Pyramid, PyramidOptions } from "@enerv-3d/core";
import { Shield, ShieldOptions } from "@enerv-3d/core";
import { VISIUAL_TYPE } from '../../../src/constants'
export interface VisualOptions extends BaseInitOptions {
    type: VISIUAL_TYPE
    radius?: number
    hemisphere?: boolean
    width?: number,
    height?: number,

}
//建筑特性：进入建筑级别隐藏外立面

export class VisualObject extends BaseObject {
    public override readonly type: string = "VisualObject";
    static override readonly type: string = "VisualObject";

    public visualType: string

    constructor(options: VisualOptions) {
        super(options);

    }

    /**
    * 初始化物体，挂载3D实例节点
    * 继承类尽量不要重写init函数
    * @param params 
    */
    public override async init(params?: VisualOptions): Promise<VisualObject> {
        const initOption = params || this.initOption as VisualOptions

        const { type } = initOption;
        // 初始化node
        switch (type) {
            case VISIUAL_TYPE.PYRAMID:
                this.node = new Pyramid(initOption)
                break;
            case VISIUAL_TYPE.GROUND:
                this.node = new EffectGround(initOption)
                break;
            case VISIUAL_TYPE.SHIELD:
                this.node = new Shield(initOption)
                break;

        }
        //业务主键绑定
        this.node.appKey = this.id;

        this.setParent(initOption.parent as BaseObject);
        return this;
    }
}
