import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 球体生成器
 */
export default class Sphere extends BaseGeo {
  constructor(
    radius = 1,
    widthSegments = 32,
    heightSegments = 16,
    threshold: number = 40,
    phiStart = 0,
    phiLength = Math.PI * 2,
    thetaStart = 0,
    thetaLength = Math.PI
  ) {
    super();
    this.type = 'SphereGeometry';

    widthSegments = Math.max(3, Math.floor(widthSegments));
    heightSegments = Math.max(2, Math.floor(heightSegments));

    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

    let index = 0;
    const grid = [];

    const vertex = new THREE.Vector3();

    // buffers

    const indices = [];
    const vertices = [];

    // generate vertices

    for (let iy = 0; iy <= heightSegments; iy++) {
      const verticesRow = [];

      const v = iy / heightSegments;

      // special case for the poles

      let uOffset = 0;

      if (iy == 0 && thetaStart == 0) {
        uOffset = 0.5 / widthSegments;
      } else if (iy == heightSegments && thetaEnd == Math.PI) {
        uOffset = -0.5 / widthSegments;
      }

      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;

        // vertex

        vertex.x =
          -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
        vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
        vertex.z =
          radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

        vertices.push(vertex.clone());

        verticesRow.push(index++);
      }

      grid.push(verticesRow);
    }

    // indices
    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        let a, b, c, d;

        if (iy === 0) {
          a = grid[iy][0];
          c = grid[iy + 1][ix];
          d = ix + 1 === widthSegments ? grid[iy + 1][0] : grid[iy + 1][ix + 1];
          indices.push([a, c, d]);
        } else if (iy === heightSegments - 1) {
          a = ix + 1 === widthSegments ? grid[iy][0] : grid[iy][ix + 1];
          // a = grid[ iy ][ ix + 1 ];
          b = grid[iy][ix];
          c = grid[iy + 1][0];
          indices.push([a, b, c]);
        } else {
          a = ix + 1 === widthSegments ? grid[iy][0] : grid[iy][ix + 1];
          // a = grid[ iy ][ ix + 1 ];
          b = grid[iy][ix];
          c = grid[iy + 1][ix];
          // d = grid[ iy + 1 ][ ix + 1 ];
          d = ix + 1 === widthSegments ? grid[iy + 1][0] : grid[iy + 1][ix + 1];
          indices.push([a, b, c, d]);
        }
      }
    }
    // build geometry
    this.points = vertices;
    this.faces = indices;
    this.threshold = threshold;
    this.generate();
  }
}
