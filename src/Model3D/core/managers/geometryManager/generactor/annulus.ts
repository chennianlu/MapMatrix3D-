import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 空心圆柱生成器
 */
export default class Annulus extends BaseGeo {
  constructor(
    outRadius = 1,
    inRadius = 1,
    height = 1,
    radialSegments = 8,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    threshold: number = 40
  ) {
    super();
    this.type = 'AnnulusGeometry';
    this.points = [];
    this.faces = [];
    this.threshold = threshold;
    radialSegments = Math.floor(radialSegments);
    // buffers

    const vertices: Array<THREE.Vector3> = [];

    let index = 0;
    const indexArray: Array<Array<number>> = [];
    const facesArray: Array<Array<number>> = [];
    const halfHeight = height / 2;
    const isFull = thetaLength < Math.PI * 2;

    // 生成同心圆环上的顶点
    generatePoints(outRadius);
    generatePoints(inRadius);
    //构建圆环内外壁
    buildIOFaces('out');
    buildIOFaces('in');
    //构建上下底面
    buildUDFaces('up');
    buildUDFaces('down');

    // 构建侧面
    if (isFull) {
      buildLRFaces('left');
      buildLRFaces('right');
    }
    this.points = vertices;
    this.faces = facesArray;
    function generatePoints(radius: number): void {
      const vertex = new THREE.Vector3();

      // generate vertices, normals and uvs

      for (let y = 0; y < 2; y++) {
        const indexRow = [];

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;

          const theta = u * thetaLength + thetaStart;

          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // vertex

          vertex.x = radius * sinTheta;
          vertex.y = -y * height + halfHeight;
          vertex.z = radius * cosTheta;
          vertices.push(vertex.clone());

          // save index of vertex in respective row

          indexRow.push(index++);
        }

        // now save vertices of the row in our index array

        indexArray.push(indexRow);
      }
    }

    function buildIOFaces(type: string) {
      const index = type === 'out' ? 0 : 2;
      const pointTopIndex = indexArray[index];
      const pointBottomIndex = indexArray[index + 1];
      for (let i = 0; i < radialSegments; i++) {
        if (isFull) {
          if (type === 'out') {
            facesArray.push([
              pointTopIndex[i],
              pointBottomIndex[i],
              pointBottomIndex[i + 1],
              pointTopIndex[i + 1],
            ]);
          } else if (type === 'in') {
            facesArray.push([
              pointBottomIndex[i],
              pointTopIndex[i],
              pointTopIndex[i + 1],
              pointBottomIndex[i + 1],
            ]);
          }
        } else {
          if (i + 1 === radialSegments) {
            if (type === 'out') {
              facesArray.push([
                pointTopIndex[i],
                pointBottomIndex[i],
                pointBottomIndex[0],
                pointTopIndex[0],
              ]);
            } else if (type === 'in') {
              facesArray.push([
                pointBottomIndex[i],
                pointTopIndex[i],
                pointTopIndex[0],
                pointBottomIndex[0],
              ]);
            }
          } else {
            if (type === 'out') {
              facesArray.push([
                pointTopIndex[i],
                pointBottomIndex[i],
                pointBottomIndex[i + 1],
                pointTopIndex[i + 1],
              ]);
            } else if (type === 'in') {
              facesArray.push([
                pointBottomIndex[i],
                pointTopIndex[i],
                pointTopIndex[i + 1],
                pointBottomIndex[i + 1],
              ]);
            }
          }
        }
      }
    }

    function buildUDFaces(type: string) {
      const index = type === 'up' ? 0 : 1;
      const pointTopIndex = indexArray[index];
      const pointBottomIndex = indexArray[index + 2];
      for (let i = 0; i < radialSegments; i++) {
        if (isFull) {
          if (type === 'up') {
            facesArray.push([
              pointTopIndex[i],
              pointTopIndex[i + 1],
              pointBottomIndex[i + 1],
              pointBottomIndex[i],
            ]);
          } else if (type === 'down') {
            facesArray.push([
              pointTopIndex[i],
              pointBottomIndex[i],
              pointBottomIndex[i + 1],
              pointTopIndex[i + 1],
            ]);
          }
        } else {
          if (i + 1 === radialSegments) {
            if (type === 'up') {
              facesArray.push([
                pointTopIndex[i],
                pointTopIndex[0],
                pointBottomIndex[0],
                pointBottomIndex[i],
              ]);
            } else if (type === 'down') {
              facesArray.push([
                pointTopIndex[i],
                pointBottomIndex[i],
                pointBottomIndex[0],
                pointTopIndex[0],
              ]);
            }
          } else {
            if (type === 'up') {
              facesArray.push([
                pointTopIndex[i],
                pointTopIndex[i + 1],
                pointBottomIndex[i + 1],
                pointBottomIndex[i],
              ]);
            } else if (type === 'down') {
              facesArray.push([
                pointTopIndex[i],
                pointBottomIndex[i],
                pointBottomIndex[i + 1],
                pointTopIndex[i + 1],
              ]);
            }
          }
        }
      }
    }

    function buildLRFaces(type: string) {
      const topOutIndex = indexArray[0];
      const bottomOutIndex = indexArray[1];
      const topInIndex = indexArray[2];
      const bottomIntIndex = indexArray[3];
      if (type === 'left') {
        facesArray.push([topOutIndex[0], topInIndex[0], bottomIntIndex[0], bottomOutIndex[0]]);
      } else if (type === 'right') {
        facesArray.push([
          topInIndex[radialSegments],
          topOutIndex[radialSegments],
          bottomOutIndex[radialSegments],
          bottomIntIndex[radialSegments],
        ]);
      }
    }

    this.generate();
  }
}
