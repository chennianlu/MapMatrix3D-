import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 圆锥生成器
 */
export default class Cone extends BaseGeo {
  constructor(
    radius: number,
    height = 1,
    radialSegments = 8,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    threshold: number = 40
  ) {
    super();
    this.type = 'ConeGeometry';

    radialSegments = Math.floor(radialSegments);
    // buffers

    const indices: Array<Array<number>> = [];
    const vertices: Array<THREE.Vector3> = [];

    // helper variables

    const indexArray: Array<number> = [];
    const halfHeight = height / 2;

    // generate geometry
    const isFull = thetaLength < Math.PI * 2;

    generateTorso(isFull);
    /**
     * 生成底部
     */
    generateCap(isFull);
    //生成侧面索引
    if (isFull) generateSide();

    this.points = vertices;
    this.faces = indices;
    this.threshold = threshold;
    /**
     * 构建外圈的顶点与侧边三角面
     */
    function generateTorso(isFull: boolean) {
      const vertex = new THREE.Vector3();
      //上圆心
      vertices.push(new THREE.Vector3(0, halfHeight, 0));

      // 底部细分点
      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;

        const theta = u * thetaLength + thetaStart;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex

        vertex.x = radius * sinTheta;
        vertex.y = -halfHeight;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.clone());
        if (isFull) {
          indexArray.push(x + 1);
        } else {
          if (x + 1 > radialSegments) {
            indexArray.push(1);
          } else {
            indexArray.push(x + 1);
          }
        }
      }

      //下圆心
      vertices.push(new THREE.Vector3(0, -halfHeight, 0));

      // generate indices

      for (let x = 1; x < vertices.length - 2; x++) {
        if (!isFull) {
          if (x + 1 === vertices.length - 2) {
            indices.push([0, x, 1]);
          } else {
            indices.push([0, x, x + 1]);
          }
        } else {
          indices.push([0, x, x + 1]);
        }
      }
    }

    function generateCap(isFull: boolean = true) {
      if (!isFull) {
        indices.push(indexArray.reverse());
      } else {
        indices.push(indexArray.concat(radialSegments + 2).reverse());
      }
    }

    //一次性生成一个侧面所构成的两个三角面索引
    function generateSide() {
      // faces
      indices.push([0, radialSegments + 2, 1]);
      indices.push([0, radialSegments + 1, radialSegments + 2]);
    }

    this.generate();
  }
}
