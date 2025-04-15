//多边形几何体的生成器
import { PolygonComputeLib } from './polygonComputeLib';
import * as THREE from 'three';

THREE.BufferAttribute.prototype.copyVector3sArray = function (vectors) {
  const array = this.array;
  let offset = 0;

  for (let i = 0, l = vectors.length; i < l; i++) {
    let vector = vectors[i];

    if (vector === undefined) {
      console.warn('THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i);
      vector = new THREE.Vector3();
    }

    array[offset++] = vector.x;
    array[offset++] = vector.y;
    array[offset++] = vector.z;
  }

  return this;
};

/**
 * @Description:  多边形几何体的生成器
 */
class PolygonGeometryGenerator {
  constructor() {
    this.faces = [];
    this.points = [];
    this.threshold = 40;
  }

  /**
   * @Description: 生成几何体，返回 geometry 和surfaceParam中要加上的faceNormals和facePointNormalShareFaceIndexes
   * @param parameter {{points:Array<THREE.Vector3>,faces:Array<Array<number>>,threshold:number}}
   * @return {{geometry:THREE.BufferGeometry,
   * lines: number[][],
   * triangles: number[][][],
   * faceNormals:THREE.Vector3[],
   * facePointNormalShareFaceIndexes:number[][]}}
   * geometry 生成的BufferGeometry
   * faceNormals 面的法向量信息
   * facePointNormalShareFaceIndexes 面的每个点法向所来源的邻面索引
   */
  generateGeometry(parameter) {
    this.faces = parameter.faces;
    this.points = parameter.points;
    this.threshold = parameter.threshold;
    // let geometryGenerator = new SubdivisionStructure(parameter)
    // geometryGenerator.generateGeo(parameter.threshold);
    this.generate();
    this.generateLines();
    // console.log('test',this.triangles,this.lines);
    return {
      geometry: this.geometry,
      faceNormals: this.faceNormals,
      facePointNormalShareFaceIndexes: this.facePointNormalShareFaceIndexes,
      triangles: this.triangles,
      lines: this.lines,
    };
  }

  /**
   * @Description: 用于生成lines信息，用于多边形编辑类生成一系列索引
   */
  generateLines() {
    const lineMap = new Map();
    this.lines = [];

    function getKey(index0, index1) {
      return index0 + '_' + index1;
    }

    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i];
      if (face && face.length > 2) {
        for (let j = 0; j < face.length; j++) {
          if (
            !lineMap.has(getKey(face[j], face[(j + 1) % face.length])) &&
            !lineMap.has(getKey(face[(j + 1) % face.length], face[j]))
          ) {
            this.lines.push([face[j], face[(j + 1) % face.length]]);
            lineMap.set(getKey(face[j], face[(j + 1) % face.length]), 1);
          }
        }
      }
    }
  }

  /**
   * @Description: 根据点集(this.points)与面集生成geometry(this.faces)，法向量由面计算 ,保存在this.geo中
   */
  generate() {
    //先生成一个无任何顶点复用的三角面faces和points集合
    const faces = this.faces;
    const points = this.points;
    this.quadToTriVertMaps = []; //四边面顶点到三边面顶点的映射
    new Array(points.length).fill(0).forEach(() => this.quadToTriVertMaps.push([])); //谨防points中有空值
    //重新生成triangles和faceNormals
    this.triangles = [];
    this.faceNormals = [];

    //生成点到面的索引
    this.pointToFaceList = [];
    new Array(points.length).fill(0).forEach(() => this.pointToFaceList.push([]));
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      face.forEach(pointIndex => {
        this.pointToFaceList[pointIndex].push(i);
      });
    }

    //先计算每个n边面的法向，并计算三角化结果，记录下来。
    // 依据面的法向以及顶点之间的相邻关系及阈值进行平滑着色，计算每个点的共用关系
    // 在生成三角化的BufferGeometry 生成点的normal的时候作用平滑着色的顶点共用关系，得到每个顶点实际的法向来源（相邻可共用顶点面）
    //三角化和平滑着色互不影响 geo中可以毫无index复用信息，position和normal都一样也不复用
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      // console.log("计算面的法向 faceIndex",i,face)
      let faceNormal = PolygonComputeLib.computeFaceNormal(face, points);
      let triFaces = PolygonComputeLib.triangulate(face, faceNormal, points);
      this.faceNormals[i] = faceNormal;
      this.triangles[i] = triFaces;
    }
    // console.log("N边面法向",this.faceNormals,'所有三角面',this.triangles)
    //构建每个面的每个顶点的法向依赖(每个顶点一个面索引集，代表所能共享的面，最后把这些面的法向量加权，就是最终顶点的法向量了)，
    this.facePointNormalShareFaceIndexes = {}; //保存面中每一个点的法线所共享的面的索引导出的时候也要用到这个数据结构
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let curFaceNormal = this.faceNormals[i];
      let pointNormalShareFaceIndexes = {};
      for (const pointIndex of face) {
        let shareFaceIndexes = [i]; //这个点所共享法向的邻面下标，肯定包含自身
        // let pointToFace = this.qe.getVertToFace(pointIndex);//点面索引
        let pointToFace = this.pointToFaceList[pointIndex]; //点面索引
        pointToFace.forEach(faceIndex => {
          if (faceIndex === i) {
            //continue;
          } else {
            let adjacentFaceNormal = this.faceNormals[faceIndex];
            if (
              curFaceNormal.dot(adjacentFaceNormal) >= Math.cos((this.threshold / 180) * Math.PI)
            ) {
              shareFaceIndexes.push(faceIndex);
            }
          }
        });
        pointNormalShareFaceIndexes[pointIndex] = shareFaceIndexes;
      }
      this.facePointNormalShareFaceIndexes[i] = pointNormalShareFaceIndexes;
    }
    // console.log("每个点的共享情况", this.facePointNormalShareFaceIndexes);
    //生成BufferGeometry所需的信息,我们这里对N边面之间的point和normal不做任何复用，之后有需要可以加。但是一个n边面三角化产生的三角面是存在顶点复用的，还算科学，其实根本原因是threeJs中points和normal一一绑定，不能任意组合
    const geoPoints = [];
    const geoNormals = [];
    const geoFaces = []; //geometry中的面信息,一维数组
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let polygonToGeometryPointMap = {}; //多边形编辑的点下标到geometry中的点下标的查找结构,这个是独属于这个面的，要想用于各种查询还要改写，加上对应面的信息，
      // 由于在polyEditor中相同位置的点一定是共用的，所以完全可以实现一个n边面中的点，到三角面中的点的一到多索引关系
      let pointNormalShareFaceIndexes = this.facePointNormalShareFaceIndexes[i];
      //先把顶点位置，法向写入结构，并记录对应索引位置，用于一个n边面所属的三角面点之间的复用
      for (let j = 0; j < face.length; j++) {
        const pointIndex = face[j];
        geoPoints.push(points[pointIndex].clone());

        //计算共用的法向值
        let normal = new THREE.Vector3();
        const shareFaceIndexes = pointNormalShareFaceIndexes[pointIndex];
        shareFaceIndexes.forEach(faceIndex => {
          normal.add(this.faceNormals[faceIndex]);
        });
        normal.normalize();
        if (normal.length() < 1e-3) {
          // console.warn('平滑后的点的法线长度为0，不对劲啊', 'pointIndex', pointIndex, 'faceIndex', i, shareFaceIndexes);
        }
        geoNormals.push(normal);
        polygonToGeometryPointMap[pointIndex] = geoPoints.length - 1;
        this.quadToTriVertMaps[pointIndex].push(geoPoints.length - 1); //写入polygonToGeometryPointMap的查找集,用于以后更改了n边面的点，可以直接修改作用到geo中的具体点，而不需要重新生成整个geo
      }
      //geometry的三边面索引记录,这里要对triFaces做一次转换，因为法向共用以及实际的顶点坐标index的写入顺序并不一致
      let triFaces = this.triangles[i];
      for (const triFace of triFaces) {
        let triIndexes = [];
        for (let j = 0; j < triFace.length; j++) {
          let polygonIndex = triFace[j];
          let geometryIndex = polygonToGeometryPointMap[polygonIndex];
          triIndexes.push(geometryIndex);
        }
        geoFaces.push(...triIndexes);
      }
    }
    // console.log("uv attribute", geoUVs)
    //生成THREE.BufferGeometry
    // this.geoNormals=geoNormals;
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(geoPoints.length * 3), 3).copyVector3sArray(
        geoPoints
      )
    );
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(geoNormals.length * 3), 3).copyVector3sArray(
        geoNormals
      )
    );
    geometry.setIndex(new THREE.Uint32BufferAttribute(geoFaces, 1));
    this.geometry = geometry;
  }

  /**
   * @Description: 通过更新旧的geometry的某个attribute字段来生成一个新的geometry
   * @return {THREE.BufferGeometry}
   */
  generateByUpdateAttribute(oldGeometry, options) {
    let newGeometry = oldGeometry.clone();
    // console.log("oldGeometry", oldGeometry);
    // console.log('newGeometry', newGeometry);
    return newGeometry;
  }

  //使用示例
  // new PolygonGeometryGenerator().generateGeometry({points:this.points,faces:this.faces,threshold:30})
}

export { PolygonGeometryGenerator };
