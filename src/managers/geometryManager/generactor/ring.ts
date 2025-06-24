import * as THREE from 'three';
import BaseGeo from './baseGeo';

/**
 * 圆环生成器
 */
export default class Ring extends BaseGeo {
  constructor(
    radius = 1,
    tube = 0.4,
    radialSegments = 8,
    tubularSegments = 6,
    arc = Math.PI * 2,
    threshold: number = 40
  ) {
    super();
    this.type = 'TorusGeometry';

    radialSegments = Math.floor(radialSegments);
    tubularSegments = Math.floor(tubularSegments);

    // buffers

    const indices = [];
    const vertices = [];
    const leftSide = [];
    const rightSide = [];
    let index = 0;
    let indArr = [];
    const indArrWrap = [];
    // helper variables

    const vertex = new THREE.Vector3();

    // generate vertices

    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++) {
        const u = (i / tubularSegments) * arc;
        const v = (j / radialSegments) * Math.PI * 2;

        // vertex

        vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u);
        vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u);
        vertex.z = tube * Math.sin(v);
        if (i === 0) {
          leftSide.push(index);
        }
        if (i === tubularSegments) {
          rightSide.push(index);
        }
        indArr.push(index);
        index++;
        vertices.push(vertex.clone());
      }
      indArrWrap.push(indArr);
      indArr = [];
    }

    // generate indices

    for (let j = 0; j < radialSegments; j++) {
      for (let i = 0; i < tubularSegments; i++) {
        let numI, numJ;
        if (arc === Math.PI * 2 && i === tubularSegments - 1) {
          numI = -1;
        } else {
          numI = i;
        }

        if (j === radialSegments - 1) {
          numJ = -1;
        } else {
          numJ = j;
        }
        const a = indArrWrap[numJ + 1][i];
        const b = indArrWrap[j][i];
        const c = indArrWrap[j][numI + 1];
        const d = indArrWrap[numJ + 1][numI + 1];

        // faces

        indices.push([a, b, c, d]);
      }
    }

    function buildOthersFace(type: string): void {
      const indexArray = [];
      const u = type === 'left' ? 0 : arc;
      //生成一个切面圆心点
      const sinTheta = Math.sin(u);
      const cosTheta = Math.cos(u);

      vertex.x = radius * cosTheta;
      vertex.y = radius * sinTheta;
      vertex.z = 0;
      indexArray.push(index++);
      vertices.push(vertex.clone());

      //重新生成原管切面点
      for (let j = 0; j < radialSegments; j++) {
        const v = (j / radialSegments) * Math.PI * 2;

        // vertex

        vertex.x = (radius + tube * Math.cos(v)) * Math.cos(u);
        vertex.y = (radius + tube * Math.cos(v)) * Math.sin(u);
        vertex.z = tube * Math.sin(v);
        indexArray.push(index++);
        vertices.push(vertex.clone());
      }
      //圆心指向圆边的多边面还是三角面可以在这控制
      for (let d = 0; d < radialSegments; d++) {
        const a = indexArray[0]; //圆心
        const b = indexArray[d + 1];
        const c = indexArray[d + 2] || indexArray[1];
        type === 'left' ? indices.push([a, b, c]) : indices.push([b, a, c]);
      }
    }

    //生成侧面的点和坐标
    if (arc < Math.PI * 2) {
      indices.push(leftSide);
      indices.push(rightSide.reverse());
      // buildOthersFace('left');
      // buildOthersFace('right');
    }

    for (let i = 0; i < vertices.length; i++) {
      vertices[i].applyEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    }

    // build geometry
    this.points = vertices;
    this.faces = indices;
    this.threshold = threshold;

    this.generate();
  }
}
