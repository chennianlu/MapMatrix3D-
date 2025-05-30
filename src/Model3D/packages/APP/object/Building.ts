import * as THREE from "three";
import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";

export interface BuildingOptions extends BaseInitOptions {

}
//建筑特性：进入建筑级别隐藏外立面

export class BuildingObject extends BaseObject {
    public override readonly type: string = "Building";
    static override readonly type: string = "Building";

    constructor(options: BuildingOptions) {
        super(options);

    }

}
