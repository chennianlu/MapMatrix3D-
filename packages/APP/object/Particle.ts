/**
 * @format
 */
// TODO  对外接口层不应该叫粒子，需要考虑如何与业务结合
import * as THREE from 'three';
import { BaseInitOptions, BaseObject } from './BaseObject';
import { ParticleInitOptions, ParticlePoints } from '../../../src/objects/ParticlePoints';
import { PARTICLE_TYPE } from '../../../src/constants';

export interface ParticleObjectInitOptions extends BaseInitOptions {
  particleType?: PARTICLE_TYPE;
  particleCounts?: number;
  radius?: number;
  rotation?: number;
  position?: number[];
}

export class ParticleObject extends BaseObject {
  public override readonly type: string = 'Particle';
  static override readonly type: string = "Particle";

  constructor(options: ParticleObjectInitOptions) {
    super(options);
  }

  /**
   * 初始化物体，挂载3D实例节点
   * 继承类尽量不要重写init函数
   * @param {ParticleInitOptions} params
   */
  public override async init(params?: ParticleInitOptions): Promise<ParticleObject> {
    // 初始化node
    const initOption = params || this.initOption

    this.node = new ParticlePoints(initOption);
    await this.node.init(initOption);
    this.setParent(initOption.parent as unknown as BaseObject);
    return this;
  }
}
