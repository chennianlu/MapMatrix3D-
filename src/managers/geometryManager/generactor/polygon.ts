import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 立方体生成器
 */
export default class Polygon extends BaseGeo {
  constructor(points: THREE.Vector3[], faces: number[][], threshold: number = 40) {
    super();

    this.type = 'PolygonGeometry';
    this.points = points;
    this.faces = faces;
    this.threshold = threshold;
    this.generate();
  }
}
