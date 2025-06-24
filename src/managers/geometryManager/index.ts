import * as THREE from 'three';
// import { CSG } from 'three-csg-ts';
import { BaseGeo, Annulus, Box, Sphere, Ring, Icosahedron, Cylinder, Cone } from './generactor';
import { GeneratorSTL } from './generator';
import cache from '../cache';

interface Generator {
  threshold?: number | undefined;
  points?: Array<THREE.Vector3>;
  faces?: Array<Array<number>>;
}

const GeometryMap = {
  geoMap: cache.registerCache('Geometry'),
  UNIT: 1, // 基础单位
  version: 1,
  plane: function (
    options: {
      width?: number;
      height?: number;
    } = {}
  ) {
    const { width = this.UNIT, height = this.UNIT } = options;

    let typeMap = this.geoMap.get('plane');
    if (!typeMap) {
      this.geoMap.set('plane', new Map());
      typeMap = this.geoMap.get('plane');
    }

    //主键规则
    const primaryKey = `${width}_${height}`;
    let planeGenerator = typeMap.get(primaryKey);
    if (!planeGenerator) {
      planeGenerator = {};
      const geometry = new THREE.PlaneGeometry(width, height);
      geometry.userData.version = 2;
      planeGenerator.geometry = geometry;
      typeMap.set(primaryKey, planeGenerator);
    }
    return planeGenerator;
  },
  /*矩形*/
  box: function (
    options: {
      width?: number;
      height?: number;
      depth?: number;
      threshold?: number;
    } = {}
  ) {
    const { width = this.UNIT, height = this.UNIT, depth = this.UNIT, threshold = 40 } = options;

    let typeMap = this.geoMap.get('box');
    if (!typeMap) {
      this.geoMap.set('box', new Map());
      typeMap = this.geoMap.get('box');
    }

    //主键规则
    const primaryKey = `${width}_${height}_${depth}_${threshold}`;
    let boxGenerator = typeMap.get(primaryKey);
    if (!boxGenerator) {
      // geometry = new THREE.BoxBufferGeometry(width, height, depth);
      boxGenerator = new Box(width, height, depth, threshold);
      const geometry = boxGenerator.geometry;
      //测试圆角几何体
      // geometry = new RoundedBoxGeometry( 2 , 2 , 2 , .25 , 3 )
      geometry.userData.version = 2;
      typeMap.set(primaryKey, boxGenerator);
    }
    return boxGenerator;
  },

  /* plane */
  plane1: function (
    options: {
      width?: number;
      height?: number;
    } = {}
  ) {
    const { width = this.UNIT, height = this.UNIT } = options;

    let typeMap = this.geoMap.get('plane');
    if (!typeMap) {
      this.geoMap.set('plane', new Map());
      typeMap = this.geoMap.get('plane');
    }
    //主键规则
    const primaryKey = `${width}_${height}`;
    let planeGenerator = typeMap.get(primaryKey);
    if (!planeGenerator) {
      // geometry = new THREE.SphereBufferGeometry(radius, 3, 2);
      planeGenerator = {
        geometry: new THREE.PlaneGeometry(width, height),
      };

      typeMap.set(primaryKey, planeGenerator);
    }
    return planeGenerator;
  },
  /* 球体*/
  sphere: function (
    options: {
      radius?: number;
      widthSegments?: number;
      heightSegments?: number;
      threshold?: number;
    } = {}
  ) {
    const {
      radius = this.UNIT / 2,
      widthSegments = 32,
      heightSegments = 16,
      threshold = 40,
    } = options;
    let typeMap = this.geoMap.get('sphere');
    if (!typeMap) {
      this.geoMap.set('sphere', new Map());
      typeMap = this.geoMap.get('sphere');
    }
    //主键规则
    const primaryKey = `${radius}_${widthSegments}_${heightSegments}_${threshold}`;
    let sphereGenerator = typeMap.get(primaryKey);
    if (!sphereGenerator) {
      // geometry = new THREE.SphereBufferGeometry(radius, 3, 2);
      sphereGenerator = new Sphere(radius, widthSegments, heightSegments, threshold);
      const geometry = sphereGenerator.geometry;
      geometry.userData.version = 2;
      typeMap.set(primaryKey, sphereGenerator);
    }
    return sphereGenerator;
  },
  /*圆柱*/
  cylinder: function (
    options: {
      radius?: number;
      height?: number;
      sides?: number;
      angle?: number;
      threshold?: number;
    } = {}
  ) {
    const {
      radius = this.UNIT / 2,
      height = this.UNIT,
      sides = 32,
      angle = 360,
      threshold = 40,
    } = options;
    const arc = (angle * Math.PI) / 180;
    // const segments = Math.max(Math.floor(angle / 360 * sides), 1);
    let typeMap = this.geoMap.get('cylinder');
    if (!typeMap) {
      this.geoMap.set('cylinder', new Map());
      typeMap = this.geoMap.get('cylinder');
    }
    //主键规则
    const primaryKey = `${radius}_${height}_${angle}_${sides}_${threshold}`;
    let cylinderGenerator = typeMap.get(primaryKey);
    if (!cylinderGenerator) {
      // geometry = new CylinderSideFaceGeometry(radius, radius, height, segments, 1, false, Math.PI / 2, arc);
      cylinderGenerator = new Cylinder(
        radius,
        radius,
        height,
        sides,
        1,
        Math.PI / 2,
        arc,
        threshold
      );
      const geometry = cylinderGenerator.geometry;
      geometry.userData.version = 2;
      typeMap.set(primaryKey, cylinderGenerator);
    }
    return cylinderGenerator;
  },
  /*圆锥*/
  cone: function (
    options: {
      radius?: number;
      sides?: number;
      angle?: number;
      threshold?: number;
    } = {}
  ) {
    const { radius = this.UNIT / 2, sides = 32, angle = 360, threshold = 40 } = options;
    const arc = (angle * Math.PI) / 180;
    // const segments = Math.max(Math.floor(angle / 360 * sides), 1);
    let typeMap = this.geoMap.get('cone');
    if (!typeMap) {
      this.geoMap.set('cone', new Map());
      typeMap = this.geoMap.get('cone');
    }
    //主键规则
    const primaryKey = `${radius}_${sides}_${angle}_${threshold}`;
    let coneGenerator = typeMap.get(primaryKey);
    if (!coneGenerator) {
      // geometry = new THREE.ConeBufferGeometry(radius, this.UNIT, radialSegments, 1);
      coneGenerator = new Cone(radius, this.UNIT, sides, 0, arc, threshold);
      const geometry = coneGenerator.geometry;
      geometry.userData.version = this.version;
      typeMap.set(primaryKey, coneGenerator);
    }
    return coneGenerator;
  },
  /*圆管*/
  annulus: function (
    options: {
      radius?: number;
      thickness?: number;
      sides?: number;
      angle?: number;
      threshold?: number;
    } = {}
  ) {
    let {
      radius = this.UNIT / 2,
      thickness = (1 / 8) * this.UNIT,
      sides = 32,
      angle = 360,
      threshold = 40,
    } = options;
    const arc = (angle * Math.PI) / 180;
    //壁厚不能超出半径
    if (thickness > radius) thickness = radius;
    // const segments = Math.max(Math.floor(angle / 360 * radialSegments), 1);
    let typeMap = this.geoMap.get('annulus');
    if (!typeMap) {
      this.geoMap.set('annulus', new Map());
      typeMap = this.geoMap.get('annulus');
    }
    //主键规则
    const primaryKey = `${radius}_${thickness}_${angle}_${sides}_${threshold}`;
    let annulusGenerator = typeMap.get(primaryKey);
    if (!annulusGenerator) {
      // geometry = new AnnulusGeometry(this.UNIT / 2, this.UNIT / 2 - thickness, this.UNIT, segments, Math.PI / 2, arc);
      annulusGenerator = new Annulus(
        radius,
        radius - thickness,
        this.UNIT,
        sides,
        Math.PI / 2,
        arc,
        threshold
      );
      const geometry = annulusGenerator.geometry;
      geometry.userData.version = this.version;
      typeMap.set(primaryKey, annulusGenerator);
    }
    return annulusGenerator;
  },

  /*圆环*/
  circularRing: function (
    options: {
      radius?: number;
      ringRadius?: number;
      radialSegments?: number;
      tubularSegments?: number;
      angle?: number;
      threshold?: number;
    } = {}
  ) {
    let {
      radius = (3 * this.UNIT) / 8,
      ringRadius = this.UNIT / 8,
      radialSegments = 32,
      tubularSegments = 32,
      angle = 360,
      threshold = 40,
    } = options;
    const arc = (angle * Math.PI) / 180;
    //管径不允许超过半径
    if (ringRadius > radius) ringRadius = radius;
    let typeMap = this.geoMap.get('circularRing');
    if (!typeMap) {
      this.geoMap.set('circularRing', new Map());
      typeMap = this.geoMap.get('circularRing');
    }
    //主键规则
    const primaryKey = `${radius}_${ringRadius}_${angle}_${radialSegments}_${tubularSegments}_${threshold}`;
    let ringGenerator = typeMap.get(primaryKey);

    if (!ringGenerator) {
      // geometry = new TorusGeometry(radius, ringRadius, radialSegments, tubularSegments, arc );
      ringGenerator = new Ring(radius, ringRadius, radialSegments, tubularSegments, arc, threshold);
      const geometry = ringGenerator.geometry;
      // geometry.rotateX(-Math.PI / 2);
      geometry.userData.version = 2;
      typeMap.set(primaryKey, ringGenerator);
    }
    return ringGenerator;
  },
  /* 棱角球 */
  icosahedron: function (
    options: {
      radius?: number;
      threshold?: number;
    } = {}
  ) {
    // radius: 2 / Math.sin(Math.PI / 3)//正确的计算方式：  立方体包围盒边长的一半为x，棱长为a=4*x/(1+sqrt(5)),r^2=x^2+(a/2)^2,x=2，r=2.3511
    const x = 1 / 2;
    const a = (4 * x) / (1 + Math.sqrt(5));
    const r = Number(Math.sqrt(Math.pow(x, 2) + Math.pow(a / 2, 2)).toFixed(4));

    const { radius = r, threshold = 40 } = options;
    let typeMap = this.geoMap.get('icosahedron');
    if (!typeMap) {
      this.geoMap.set('icosahedron', new Map());
      typeMap = this.geoMap.get('icosahedron');
    }
    //主键规则
    const primaryKey = `${radius}_${threshold}`;
    let icosahedronGenerator = typeMap.get(primaryKey);
    if (!icosahedronGenerator) {
      //IcosahedronBufferGeometry 第二个参数代表细分数
      // geometry = new THREE.IcosahedronBufferGeometry(radius, detail);
      icosahedronGenerator = new Icosahedron(radius, threshold);
      const geometry = icosahedronGenerator.geometry;
      geometry.userData.version = this.version;
      //将正二十面体index化（虚假的index，冗余仍在，真正的index化需要改写源码或是增加大段代码），有比较完善的接口setIndex，可输入索引数组，自动转为index BufferAttribute 格式
      let indices = [];
      for (let i = 0; i < 60; i += 3) {
        indices.push(i, i + 1, i + 2);
      }
      geometry.setIndex(indices);
      typeMap.set(primaryKey, icosahedronGenerator);
    }

    return icosahedronGenerator;
  },
};

/**
 * 根据参数创建对应的几何体
 */
class GeometryController {
  private storage: Map<string, THREE.BufferGeometry>;

  constructor() {
    this.storage = new Map();
    // 几何体缓存方案为根据几何体类型+特性作为主键缓存
  }

  create(type: GeometryType, options = {}) {
    if (!GeometryMap[type]) {
      console.error(`不支持创建类型为${type}的几何体`);
      return null;
    }
    // @ts-ignore
    const generator = GeometryMap[type](options);
    let result: {
        geometry?: THREE.BufferGeometry;
      } = {},
      geometry;
    //兼容多边面形式的构造器创建和 bufferGeometry形式创建
    if (generator instanceof THREE.BufferGeometry) {
      geometry = generator;
      // @ts-ignore
      result.geometry = geometry;
    } else {
      geometry = generator.geometry;
      result = generator;
    }
    geometry.name = type;

    return result as {
      points?: THREE.Vector3[];
      lines?: number[][];
      faces?: number[][];
      triangles?: number[][][];
      faceNormals?: THREE.Vector3[];
      facePointNormalShareFaceIndexes?: number[][];

      depth?: number;
      generator?: BaseGeo;
      geometry: THREE.BufferGeometry;
      height?: number;
      threshold?: number;
      type?: string;
      width?: 1;
    };
  }

  /**
   * @Description: 根据旧的geometry与发生变化attribute信息 options生成新的geometry，并记录到GeometryMap中
   * @return {THREE.BufferGeometry}
   * @date 2023-01-05 13:47:05
   */
  generateByUpdateAttribute(
    oldGeometry: THREE.BufferGeometry,
    objectData: { uuid: string; threshold: number },
    options: Map<string, object>
  ) {
    const newGeometry = new GeneratorSTL().generateByUpdateAttribute(oldGeometry, options);
    let typeMap = GeometryMap.geoMap.get('polygon');
    const primaryKey = `${objectData.uuid}_${objectData.threshold}`;
    typeMap.set(primaryKey, { geometry: newGeometry });
    return newGeometry;
  }

  generatorGeo(generate: Generator) {
    const generateGeo = new BaseGeo({
      threshold: generate.threshold,
      points: generate.points,
      faces: generate.faces,
    });
    generateGeo.generate();
    return generateGeo;
  }
}

export default new GeometryController();
