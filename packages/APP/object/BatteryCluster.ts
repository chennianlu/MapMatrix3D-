import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";

export interface BatteryClusterOptions extends BaseInitOptions {

}
//建筑特性：进入建筑级别隐藏外立面

export class BatteryCluster extends BaseObject {
    public override readonly type: string = "BatteryCluster";
    static override readonly type: string = "BatteryCluster";

    constructor(options: BatteryClusterOptions) {
        super(options);

    }

}
