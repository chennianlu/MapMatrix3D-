import * as THREE from 'three';
import { PolygonGeometryGenerator } from './polygon/polygonGeometryGenerator.js';

type ParameterType = {
  points: THREE.Vector3[];
  faces: number[][];
  threshold: number;
};

/**
 * @desc 对polygon中BufferGeometry创建类PolygonGeometryGenerator的ts封装，使用单例模式，支持后续拓展记录几何体生成的情况
 * @class Generator
 */
class GeneratorSTL {
  private geometryGenerator: PolygonGeometryGenerator;
  constructor() {
    if (new.target !== GeneratorSTL) {
      return;
    }
    if (!GeneratorSTL._instance) {
      GeneratorSTL._instance = this;
      //这里添加构造函数属性
      this.geometryGenerator = new PolygonGeometryGenerator();
    }
    return GeneratorSTL._instance;
  }

  static _instance: GeneratorSTL;

  // static STL:null | GeneratorSTL = null;
  /**
   * @Description: 根据输入参数 产生几何体
   * @param parameters {ParameterType}
   * @return {}
   */
  generate(parameters: ParameterType) {
    return this.geometryGenerator?.generateGeometry(parameters);
  }

  generateByUpdateAttribute(oldGeometry: THREE.BufferGeometry, options: Map<string, any>) {
    return this.geometryGenerator?.generateByUpdateAttribute(oldGeometry, options);
  }
}

export { GeneratorSTL };
