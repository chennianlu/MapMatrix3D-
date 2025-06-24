import { TubeNormal, AnimationOptions, SpriteOptions } from "@enerv-3d/core";

import { LINE_TYPE } from "../../../src/constants";
import { BaseObject, BaseInitOptions } from "./BaseObject";




export interface LineObjectOptions extends BaseInitOptions {
    lineType?: LINE_TYPE,
    points?: Array<number[]>,
    corner?: number,
    radius?: number,
    url?: string,
    color?: string,
    opacity?: number,
    repeat?: number,
    parent?: any
    imageRepeat?: any,
    animation?: AnimationOptions,
    sprite?: SpriteOptions
}
export class LineObject extends BaseObject {
    public override readonly type: string = "Line";
    static override readonly type: string = "Line";

    declare public node: TubeNormal

    constructor(options: LineObjectOptions) {
        super(options);

    }

    /**
     * 初始化物体，挂载3D实例节点
     * 继承类尽量不要重写init函数
     * @param params 
     */
    public override async init(params?: LineObjectOptions): Promise<LineObject> {
        // 初始化node
        const initOption = params || this.initOption

        this.node = new TubeNormal(initOption);
        await this.node.init(initOption)
        //业务主键绑定
        this.node.appKey = this.id;
        this.setParent(initOption.parent as BaseObject);
        return this;
    }


    play(animation: AnimationOptions) {
        this.node.play(animation)
    }
    stop() {
        this.node.stop();
    }



}
