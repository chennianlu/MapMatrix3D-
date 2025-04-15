import MatStorage from './module/MatStorage';
import { IMaterialManagerCreateOption, ISetMatInfoParam, TMaterial } from './define';
import * as THREE from 'three';

/**
 * 材质管理器
 */
class MaterialManager {
  private storage: MatStorage;

  constructor() {
    this.storage = new MatStorage();
  }

  /**
   * 创建材质
   * 外部不需要关注是否需要做材质共用
   * @param options
   */
  public create(options: IMaterialManagerCreateOption = {}): TMaterial {
    // 获取新的材质之后更新一次weakMap;
    const mat = this.storage.create(options);

    return mat;
  }

  /**
   * 添加一次材质引用
   * @param referenceObj
   * @param mat
   */
  public addReference(referenceObj: THREE.Mesh, mat: TMaterial): void {
    this.storage.addReference(mat, { uuid: referenceObj.uuid });
  }

  /**
   * pure 减少一次材质引用
   * @param referenceObj
   * @param mat
   */
  public subReference(referenceObj: THREE.Mesh, mat: TMaterial): void {
    this.storage.subReference(mat, { uuid: referenceObj.uuid });
  }

  /**
   * 重置材质管理器
   */
  public reset() {
    this.storage.clear();
  }
}
const materialManager = new MaterialManager();
export default materialManager;
