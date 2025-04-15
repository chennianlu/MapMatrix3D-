import { BaseObject, BaseInitOptions } from "./BaseObject";
import { GeometryObject3D } from "@enerv-3d/core";

export interface GeoInitOptions extends BaseInitOptions {
    pickedEnable?: boolean;
    id?: string;
    name?: string;
    type?: GeometryType
    color?: number
    opacity?: number
    geometryParam?: any
}

export class Geometry extends BaseObject {
    public override readonly type: string = "Geometry";
    static override readonly type: string = "Geometry";
    declare public node: GeometryObject3D

    constructor(options: GeoInitOptions) {
        super(options);
    }


    public override async init(params?: any): Promise<Geometry> {
        // 初始化node
        const initOption = params || this.initOption

        this.node = new GeometryObject3D({
            geometryType: initOption.type || 'box',
            ...initOption
        });
        await this.node.init()
        this.node.appKey = this.id;
        this.setParent(initOption.parent);
        return this;
    }

}