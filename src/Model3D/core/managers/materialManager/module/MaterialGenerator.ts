import * as THREE from 'three';
import { IMaterialManagerCreateOption, TMaterial, TMaterialType } from '../define';

class MaterialGenerator {
  static MaterialType: TMaterialType[] = ['MeshStandardMaterial'];
  /**
   * 默认创建的是 MeshStandardMaterial
   * @param options
   * @constructor
   */
  static CreateByType = (options: IMaterialManagerCreateOption): TMaterial => {
    const { type } = options;
    switch (type) {
      case 'MeshStandardMaterial':
        return MaterialGenerator.MeshStandardMaterial(options); // TODO 测试
        break;
      case 'MeshLambertMaterial':
        return MaterialGenerator.MeshLambertMaterial(options);
        break;
      default:
        return MaterialGenerator.MeshStandardMaterial(options);
    }
  };

  static MeshStandardMaterial = (options: { [key: string]: any }): TMaterial => {
    const { opacity } = options;
    const defaultOptions = {
      opacity: 1,
      color: 0x808080,
      roughness: 0.8,
    };
    Object.assign(defaultOptions, options);
    let material = new THREE.MeshStandardMaterial(defaultOptions);
    material.color.set(options.color);
    //默认关闭透明
    material.transparent = false;
    if (opacity < 1) {
      material.transparent = true;
      material.opacity = options.opacity;
    }
    material.userData = {};
    material.userData.counter = 0;
    material.needsUpdate = true;
    material.side = options.side;
    return material;
  };

  static MeshLambertMaterial = (options: { [key: string]: any }): TMaterial => {
    const { opacity } = options;
    let material = new THREE.MeshLambertMaterial(options);
    if (options.color) material.color.set(options.color);
    //默认关闭透明
    material.transparent = false;
    if (opacity < 1) {
      material.transparent = true;
      material.opacity = options.opacity;
    }
    material.userData = {};
    material.userData.counter = 0;
    material.needsUpdate = true;
    material.side = options.side;
    return material;
  };
}

export default MaterialGenerator;
