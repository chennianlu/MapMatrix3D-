import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";
import { Widget3D } from "@enerv-3d/core";
import { factory } from "./factory";

import {
    WIDGET,
    LAYOUT_X,
    LAYOUT_Y,
    LAYOUT_Z,
} from "../../../src/constants";
interface TextStyle {
    fontSize: number;
    color: string;
    text: string;
}

export interface WidgetOptions extends BaseInitOptions {
    type?: WIDGET;
    text?: string;
    dom?: HTMLElement;
    width?: number;
    height?: number;
    textParam?: TextStyle;
    canvas?: null | HTMLCanvasElement;
}

export class Widget extends BaseObject {
    public override readonly type: string = "Widget";
    static override readonly type: string = "Widget";

    public widgetType: WIDGET;
    public width: number;
    public height: number;
    public textParam: TextStyle;
    canvas: null | HTMLCanvasElement;
    public defaultLayout: Layout;
    declare public node: Widget3D

    constructor(options: WidgetOptions) {
        super(options);

        this.widgetType = options.type;
        this.width = options.width;
        this.height = options.height;
        this.textParam = options.textParam;
        this.defaultLayout = {
            rule: [LAYOUT_X.CENTER, LAYOUT_Y.TOP, LAYOUT_Z.CENTER],
        }
        this.canvas = options.canvas || null;
    }

    /**
     * 初始化物体，挂载3D实例节点
     * 继承类尽量不要重写init函数
     * @param params 
     */
    public override async init(params?: WidgetOptions): Promise<Widget> {
        // 初始化node
        const initOption = params || this.initOption as WidgetOptions

        this.node = new Widget3D(initOption);
        await this.node.init()
        //业务主键绑定
        this.node.appKey = this.id;

        this.setParent(initOption.parent as BaseObject);
        return this;
    }

    override destroy() {
        //1 从factory中移除
        factory.remove(this);
        //2 物体从父节点中删除
        this.setParent(null);
        // 挂载dom元素从渲染区域移除
        if (this.node.domEle) {
            this.node.domEle.parentNode.removeChild(this.node.domEle);
        }
    }
}
