import * as THREE from 'three';
import MaterialGenerator from './MaterialGenerator';
import {
  IMaterialManagerCreateOption,
  TStorageMap,
  TMaterial,
  TMaterialType,
  TReferenceWeakMap,
  IReferenceInfo,
} from '../define';
import cache from '../../cache';

/**
 * 材质管理器
 */
class MatStorage {
  private map: TStorageMap;
  private readonly defaultOption: IMaterialManagerCreateOption;
  private referenceMap: TReferenceWeakMap;

  constructor() {
    // 材质缓存 材质类型 -> 材质属性组合的key -> {mat: 材质本身， img: 材质图片}
    this.map = cache.registerCache('Material');
    for (let i = 0; i < MaterialGenerator.MaterialType.length; i++) {
      this.map.set(
        MaterialGenerator.MaterialType[i],
        new Map<string, { mat: TMaterial; img: string }>()
      );
    }

    // 引用关系缓存 材质实体 ->
    this.referenceMap = new WeakMap<TMaterial, Set<string>>();

    this.defaultOption = {
      type: 'MeshStandardMaterial',
      opacity: 1,
      side: THREE.DoubleSide,
      wireframe: false,
    };
  }

  /**
   * 根据材质或者创建option接口对象获取键值
   * @param mat
   */
  private getKey(mat: TMaterial | IMaterialManagerCreateOption) {
    let { type, opacity, color, uuid } = mat;
    if (uuid) return uuid;
    if (color instanceof THREE.Color) {
      color = color.getHexString();
    }
    return `${type}_${color}_${opacity}`;
  }

  /**
   * 创建材质 或者更新材质
   * 外部不需要关注是否需要做材质共用
   * @param options 选项
   * @param oldMat 旧模型
   */
  public create(options: IMaterialManagerCreateOption = {}): TMaterial {
    // 合并options
    options = { ...this.defaultOption, ...options } as any;

    const key = this.getKey(options);
    let curMatMap = this.map.get(options.type);
    if (!curMatMap) {
      this.map.set(options.type, new Map());
      curMatMap = this.map.get(options.type);
    }
    // 获取缓存内的材质 或者 生成新材质并写入缓存
    let material = curMatMap.get(key)?.mat;
    if (!material) {
      material = MaterialGenerator.CreateByType(options);
      // 通过材质管理器创建的材质 在材质系统中一定拥有一个weakMap引用映射维护
      this.referenceMap.set(material, new Set());
    }
    return material;
  }

  public remove(mat: TMaterial) {
    let key = this.getKey(mat);
    const { type } = mat;
  }

  /**
   * 添加引用
   * @param mat
   * @param referInfo
   */
  public addReference(mat: TMaterial, referInfo: IReferenceInfo) {
    this.referenceMap.get(mat)?.add(referInfo.uuid);
  }

  /**
   * 减少引用
   * @param mat
   * @param referInfo
   */
  public subReference(mat: TMaterial, referInfo: IReferenceInfo) {
    const referSet = this.referenceMap.get(mat);
    // map有映射 则找到set 进行删除
    if (referSet) {
      referSet.delete(referInfo.uuid);
      // 删除之后判断大小 如果为0 则销毁weakMap 且删除缓存内源头
      if (referSet.size === 0) {
        this.map.get(<TMaterialType>mat.type)?.delete(this.getKey(mat));
        this.referenceMap.delete(mat);
      }
    }
  }

  /**
   * 重置管理器
   */
  public clear() {
    this.map.forEach(matTypeMap => {
      matTypeMap.forEach(cur => {
        cur.mat.dispose();
      });
    });
    this.map.clear();
    this.referenceMap = new WeakMap<TMaterial, Set<string>>();
  }
}

export default MatStorage;
