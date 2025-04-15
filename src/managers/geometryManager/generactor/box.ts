import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 立方体生成器
 */
export default class Box extends BaseGeo {
  private readonly width: number;
  private readonly height: number;
  private readonly depth: number;

  constructor(width: number = 1, height: number = 1, depth: number = 1, threshold: number = 40) {
    super();
    this.type = 'BoxGeometry';
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.threshold = threshold;
    // build indices to faces
    this.buildPoints();
    this.buildFaces();
    this.generate();
  }
  buildPoints(): void {
    const vector = new THREE.Vector3();
    const widthHalf: number = this.width / 2;
    const heightHalf: number = this.height / 2;
    const depthHalf: number = this.depth / 2;

    // top bottom left right front back
    this.points.push(vector.clone().set(widthHalf, heightHalf, -depthHalf));
    this.points.push(vector.clone().set(widthHalf, heightHalf, depthHalf));
    this.points.push(vector.clone().set(-widthHalf, heightHalf, depthHalf));
    this.points.push(vector.clone().set(-widthHalf, heightHalf, -depthHalf));

    this.points.push(vector.clone().set(widthHalf, -heightHalf, -depthHalf));
    this.points.push(vector.clone().set(widthHalf, -heightHalf, depthHalf));
    this.points.push(vector.clone().set(-widthHalf, -heightHalf, depthHalf));
    this.points.push(vector.clone().set(-widthHalf, -heightHalf, -depthHalf));
  }
  buildFaces(): void {
    // const length = this.points.length;
    this.faces.push([0, 3, 2, 1]);
    this.faces.push([4, 5, 6, 7]);
    this.faces.push([3, 7, 6, 2]);
    this.faces.push([0, 1, 5, 4]);
    this.faces.push([1, 2, 6, 5]);
    this.faces.push([0, 4, 7, 3]);
  }
}
