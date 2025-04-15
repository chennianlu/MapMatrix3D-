import * as THREE from 'three';

/**
 * @Description: 存放一些通用的多边形计算函数，方便复用和整理
 */
class PolygonComputeLib {
  constructor() {}
  /**
   * @Description: 计算一个n边面法向量.用每条边与中心连接的三角面计算法向，乘上面积权重累加，计算法向量
   * @param face {Array<number>} n边面的点索引
   * @param points {Array<THREE.Vector3>} 点集
   * @return normal {THREE.Vector3} 法向量
   */
  static computeFaceNormal(face, points) {
    //计算中心点
    let center = new THREE.Vector3();
    face.forEach(index => center.add(points[index]));
    center.divideScalar(face.length);
    //计算每条边与中心点构成的三边面的法向量，并乘上面积作为权重，累加到一起
    let faceNormal = new THREE.Vector3();
    for (let i = 0; i < face.length; i++) {
      let cross = new THREE.Vector3()
        .subVectors(points[face[(i + 1) % face.length]], points[face[i]])
        .cross(new THREE.Vector3().subVectors(center, points[face[i]]));
      let area = cross.length();
      let normal = cross.normalize();
      faceNormal.add(normal.multiplyScalar(area));
    }
    faceNormal.normalize();
    return faceNormal;
  }

  /**
   * @Description: 计算一个三边面的法向量
   * @param face {Array<number>} 三边面
   * @param points {Array<THREE.Vector3>} 点集，只读
   * @return {THREE.Vector3} 法向量
   */
  static computeTriFaceNormal(face, points) {
    return new THREE.Vector3()
      .subVectors(points[face[1]], points[face[0]])
      .cross(new THREE.Vector3().subVectors(points[face[2]], points[face[0]]))
      .normalize();
  }

  /**
   * @Description:n边面三角化函数，采用凸集合划分，再三角化的算法
   * @param face {Array<number>} n边面
   * @param faceNormal {THREE.Vector3} 面的法向量
   * @param points {Array<THREE.Vector3>} 点集
   * @return triFaces {Array<Array<number>>} 三边面集合
   */
  static triangulate(face, faceNormal, points) {
    //凸集划分
    face = [...face]; //克隆一下，因为这里可能要调整顺序，但是并不想更改内部结构，之后可以考虑统一更改
    let oriLength = face.length;
    let loopTimes = 0; //用于预防死循环情况
    let convexFaces = [];
    let convexSet = [];
    let convexSize = 0; //记录凸集中的私有点，首尾为公有点
    for (let i = 0; i < face.length && face.length !== 0; ) {
      if (face.length < 3) {
        break;
      }
      let triFace = face.slice(i, i + 3);
      if (
        triFace.length !== 3 ||
        this.computeTriFaceNormal(triFace, points).dot(faceNormal) < 0 ||
        this.isPointsInFace(face.slice(0, i + 3), face.slice(i + 3), points)
      ) {
        //出现凹角，从下一个点开始，
        if (convexSize === 0) {
          //出现凹角，并且本次未找到凸集，说明第一个点开始就是凹角了，从下一个点开始，
          face.push(...face.splice(0, 1)); //把第一个点移到最后
          loopTimes++;
          if (loopTimes > face.length) {
            // console.warn("死循环啦,直接摆烂式三角化，认为剩下的点就是一个凸集，因为这种情况太诡异，blender也无能为力");
            convexFaces.push(face);
            break;
          }
        } else {
          convexSet = face.slice(0, convexSize + 2); //加上首尾点为本次分割的凸集
          // console.log("凸集",convexSet)
          convexFaces.push(convexSet); //记录凸集
          face.splice(1, convexSize); //删去划入凸集的顶点，保留首尾的共用顶点
          convexSize = 0; //清零
          i = 0;
          loopTimes = 0;
        }
      } else {
        convexSize++;
        i++;
      }
    }
    //凸集三角化,直接第一个点与每条边连接三角形
    let triFaces = [];
    convexFaces.forEach(convexFace => {
      for (let i = 1; i < convexFace.length - 1; i++) {
        triFaces.push([convexFace[0], convexFace[i], convexFace[i + 1]]);
      }
    });
    return triFaces;
  }

  //是否存在点集中的点都在面的内
  /**
   * @Description:  判断点集中是否存在点在n边面内，用于划分凸集
   * @param face {Array<number>} n边面
   * @param pointIndexes {Array<number>} 点索引集
   * @param points {Array<THREE.Vector3>} 点集，只读
   * @return {boolean}
   */
  static isPointsInFace(face, pointIndexes, points) {
    let existInnerPoint = false;
    pointIndexes.forEach(pointIndex => {
      if (this.isFaceInner(face, points[pointIndex].clone(), points)) existInnerPoint = true;
    });
    return existInnerPoint;
  }

  /**
   * @Description: 判断是否在一个三角形内部，及在所有边左侧
   * @param face {Array<number>} 三角形面
   * @param testPoint {THREE.Vector3} 要判断的点
   * @param points {Array<THREE.Vector3>} 点集，只读
   * @return in {bool}
   */
  static isFaceInner(face, testPoint, points) {
    let lastNormal = new THREE.Vector3();
    for (let i = 0; i < face.length; i++) {
      let normal = new THREE.Vector3()
        .subVectors(points[face[(i + 1) % face.length]], points[face[i]])
        .cross(new THREE.Vector3().subVectors(testPoint, points[face[i]]))
        .normalize();
      if (i !== 0) {
        if (lastNormal.dot(normal) < 0) return false;
      }
      lastNormal.add(normal).normalize();
    }
    return true;
  }
}
export { PolygonComputeLib };
