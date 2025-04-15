import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 圆柱生成器
 */
export default class Cylinder extends BaseGeo {
  constructor(
    radiusTop = 1,
    radiusBottom = 1,
    height = 1,
    radialSegments = 8,
    heightSegments = 1,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    threshold: number = 40
  ) {
    super();
    this.type = 'CylinderGeometry';

    radialSegments = Math.floor(radialSegments);
    heightSegments = Math.floor(heightSegments);

    // buffers

    const indices: Array<Array<number>> = [];
    const vertices: Array<THREE.Vector3> = [];

    // helper variables

    let index = 0;
    const indexArray: any[][] = [];
    const halfHeight = height / 2;

    // generate geometry
    const isFull = thetaLength < Math.PI * 2;
    // 侧面构建
    generateTorso(isFull);
    //上下面构建
    if (radiusTop > 0) generateCap(true, isFull);
    if (radiusBottom > 0) generateCap(false, isFull);
    //生成侧面索引
    if (isFull) generateSide();

    this.points = vertices;
    this.faces = indices;
    this.threshold = threshold;
    /**
     * 构建外圈的顶点与四边面
     */
    function generateTorso(isFull: boolean) {
      const vertex = new THREE.Vector3();

      // generate vertices
      for (let y = 0; y <= heightSegments; y++) {
        const indexRow = [];

        const v = y / heightSegments;

        // calculate the radius of the current row

        const radius = v * (radiusBottom - radiusTop) + radiusTop;

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;

          const theta = u * thetaLength + thetaStart;

          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex

          vertex.x = radius * sinTheta;
          vertex.y = -v * height + halfHeight;
          vertex.z = radius * cosTheta;
          vertices.push(vertex.clone());

          // save index of vertex in respective row

          indexRow.push(index++);
        }

        // now save vertices of the row in our index array

        indexArray.push(indexRow);
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < heightSegments; y++) {
          let a, b, c, d;
          // we use the index array to access the correct indices
          if (isFull) {
            a = indexArray[y][x];
            b = indexArray[y + 1][x];
            c = indexArray[y + 1][x + 1];
            d = indexArray[y][x + 1];
          } else {
            if (x + 1 === radialSegments) {
              a = indexArray[y][0];
              b = indexArray[y][radialSegments - 1];
              c = indexArray[y + 1][radialSegments - 1];
              d = indexArray[y + 1][0];
            } else {
              a = indexArray[y][x];
              b = indexArray[y + 1][x];
              c = indexArray[y + 1][x + 1];
              d = indexArray[y][x + 1];
            }
          }

          // faces

          indices.push([a, b, c, d]);
        }
      }
    }

    function generateCap(top: boolean, isFull: boolean = true) {
      if (!isFull) {
        if (top) {
          const resArr = [...indexArray[0]];
          resArr.pop();
          indices.push(resArr);
        } else {
          const resArr = [...indexArray[1]];
          resArr.pop();

          indices.push(resArr.reverse());
        }
      } else {
        const sign = top === true ? 1 : -1;
        //上下底面圆心
        vertices.push(new THREE.Vector3(0, halfHeight * sign, 0));
        if (top) {
          indices.push(indexArray[0].concat(index));
        } else {
          indices.push(indexArray[1].concat(index).reverse());
        }
        index++;
      }
    }

    //一次性生成一个侧面所构成的两个四边面索引
    function generateSide() {
      const a = indexArray[0][0];
      const b = indexArray[heightSegments][0];
      const c = indexArray[heightSegments][radialSegments];
      const d = indexArray[0][radialSegments];

      const topCenter = index - 1 - 1;
      const bottomCenter = index - 1;

      // faces

      indices.push([a, topCenter, bottomCenter, b]);
      indices.push([topCenter, d, c, bottomCenter]);
    }

    this.generate();
  }
}
