import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";
import { BatteryPack, BatteryPackOptions } from './BatteryPack'

interface PackInfo {
    id: string //唯一标识
    name: string  //名称
    cell: {
        layout: number[],//row col  行列排布也可能是串并关系，不完善
        count: number  //电芯数量
    }
}

interface ClusterInfo {
    id: string //唯一标识
    name: string  //名称
    productCode: string, //产品编码
    children: PackInfo[]
}

export interface CabinetOptions extends BaseInitOptions {
    clusterData: ClusterInfo[]
}


/**
 * @class Cabinet
 * @description 箱体、柜类，例如配电柜、冰箱
 * @description 特点：默认不对该类子节点初始化，根据层级变化响应动态加载
 * 进入该层级后：
 *      1、检查是否有开门动画，默认playAnimation('open-door')
 *      2、查询该物体下的所有子节点数据，初始化子节点物体
 * 退出该层级后：
 *      1、检查是否有关门动画，默认playAnimation('close-door')
 *      2、隐藏柜内物体，保证性能
 */
export class Cabinet extends BaseObject {
    public override readonly type: string = "Cabinet";
    static override readonly type: string = "Cabinet";

    public loadClusterState: boolean;
    clusterData: ClusterInfo[];

    constructor(options: CabinetOptions) {
        super(options);
        this.clusterData = options.clusterData || [];
        this.loadClusterState = false;
    }



    /**
     * 加载机柜电池蔟和pack结构
     * @returns boolean
     */
    async loadCluster() {
        const _this = this;
        // 判断是否已经加载过电池蔟和电池包
        if (this.loadClusterState) {
            this._showCluster();
            return;
        }
        const children = this.children;

        for (let i = 0; i < children.length; i++) {
            const cluster = children[i];
            // 对pack实例化
            const childrenData = cluster.childrenData || [];
            for (let ii = 0; ii < childrenData.length; ii++) {
                const packData = childrenData[ii];
                const productCode = packData.productCode;
                if (productCode) {
                    const splitArr = _this.productCode.split('/');
                    const splitStr = splitArr.splice(0, splitArr.length - 2);
                    packData.path = `${splitStr.join('/')}/${productCode}/`;
                }
                const pack = new BatteryPack(packData);
                await pack.init(packData)

            }
        }
        this.loadClusterState = true;
    }

    private _showCluster() {
        this.children.forEach(child => {
            const cluster = child;
            const children = cluster.children;
            // 显示子节点
            children.forEach(pack => {
                pack.show(false);
            });
        });
    }

    hideCluster() {
        this.children.forEach(child => {
            const cluster = child;
            const children = cluster.children;
            // 显示子节点
            children.forEach(pack => {
                pack.hide(false);
            });
        });
    }
}
