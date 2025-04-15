/**
 * @format
 */
import { GeometryObject3D } from '@enerv-3d/core';
import {
  WaterPlane as WaterPlaneObject,
  WaterPlaneInit,
} from '@enerv-3d/core';
import { BaseInitOptions, BaseObject } from './BaseObject';

export interface WaterPlaneInitOptions extends BaseInitOptions, WaterPlaneInit {
  /**
   * @default 5
   * @description 水平面的宽度和高度
   */
  width?: number;
  height?: number;
}

export class WaterPlane extends BaseObject {
  public override readonly type: string = 'WaterPlane';
  static override readonly type: string = "WaterPlane";


  constructor(options: WaterPlaneInitOptions) {
    super(options);
  }

  /**
   * 初始化物体，挂载3D实例节点
   * 继承类尽量不要重写init函数
   * @param {ParticleInitOptions} params
   */
  public override async init(params?: WaterPlaneInitOptions): Promise<WaterPlane> {
    // 初始化node
    const initOption = (params || this.initOption) as WaterPlaneInitOptions;
    const geometryOptions = {
      type: 'plane' as const,
      geometryParam: {
        width: initOption?.width ?? 5,
        height: initOption?.height ?? 5,
      },
    };
    const plane = new GeometryObject3D({ geometryType: geometryOptions.type, ...geometryOptions });
    plane.init();

    // debugger;
    this.node = new WaterPlaneObject(plane.geometry, initOption);
    await this.node.init(initOption as BaseInitOptions);
    this.setParent(initOption.parent as unknown as BaseObject);
    return this;
  }
}
