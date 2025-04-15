// /**
//  * @format
//  * @description  : 电池充电状态动态效果
//  * @LastEditors  : 黄鹏 huangp08@catl.com
//  * @LastEditTime : 2023-09-25 11:01:16
//  */
// import { MetaBall, MetaBallInitOptions } from '@enerv-3d/core';
// import { BaseInitOptions, BaseObject } from './BaseObject';

// export interface ChargingStatusInitOptions extends BaseInitOptions {
//     subSphereCounts?: number;
// }

// export class ChargingStatus extends BaseObject {
//     public override readonly type: string = 'ChargingStatus';
//     static override readonly type: string = "ChargingStatus";

//     constructor(options: ChargingStatusInitOptions) {
//         super(options);
//     }

//     /**
//      * 初始化物体，挂载3D实例节点
//      * 继承类尽量不要重写init函数
//      * @param {MetaBallInitOptions} params
//      */
//     public override async init(params?: MetaBallInitOptions): Promise<ChargingStatus> {
//         // 初始化node
//         const initOption = params || this.initOption

//         this.node = new MetaBall(initOption);
//         await this.node.init(initOption);
//         this.setParent(initOption.parent);
//         return this;
//     }
// }