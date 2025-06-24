import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 正二十面体(棱角球)
 */
export default class Icosahedron extends BaseGeo {
  constructor(radius = 1, threshold: number = 40) {
    super();
    const t = (1 + Math.sqrt(5)) / 2;

    const vertices = [
      [-1, t, 0],
      [1, t, 0],
      [-1, -t, 0],
      [1, -t, 0],
      [0, -1, t],
      [0, 1, t],
      [0, -1, -t],
      [0, 1, -t],
      [t, 0, -1],
      [t, 0, 1],
      [-t, 0, -1],
      [-t, 0, 1],
    ];

    const faces = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ];
    this.type = 'IcosahedronGeometry';

    // default buffer data

    const vertexBuffer: any[] = [];
    // the subdivision creates the vertex buffer data

    subdivide();
    applyRadius(radius);

    // helper functions

    function subdivide() {
      for (let i = 0; i < vertices.length; i++) {
        vertexBuffer.push(new THREE.Vector3(...vertices[i]));
      }
    }

    function applyRadius(radius: number) {
      const vertex = new THREE.Vector3();

      // iterate over the entire buffer and apply the radius to each vertex

      for (let i = 0; i < vertexBuffer.length; i++) {
        vertex.x = vertexBuffer[i].x;
        vertex.y = vertexBuffer[i].y;
        vertex.z = vertexBuffer[i].z;

        vertex.normalize().multiplyScalar(radius);

        vertexBuffer[i].setX(vertex.x);
        vertexBuffer[i].setY(vertex.y);
        vertexBuffer[i].setZ(vertex.z);
      }
    }

    this.points = vertexBuffer;
    this.faces = faces;
    this.threshold = threshold;

    this.generate();
  }
}
