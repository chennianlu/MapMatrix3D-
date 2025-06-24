import * as THREE from 'three';

/**
 * 提供的材质
 */
export type TMaterialType = 'MeshStandardMaterial' | 'MeshLambertMaterial';
export interface TMaterial extends THREE.Material {
  uniforms?: any;
  color?: any;
  map?: any;
}

/**
 * 定义缓存的数据结构
 */
export type TStorageMap = Map<string, Map<string, any>>;

/**
 * 引用关系map [ three材质, '引用mesh uuid'[]]
 */
export type TReferenceWeakMap = WeakMap<TMaterial, Set<string>>;
/**
 * 创建参数
 */
export interface IMaterialManagerCreateOption {
  uuid?: string;
  type?: TMaterialType;
  color?: string;
  opacity?: number;
  side?: any;
  wireframe?: boolean;
}

/**
 * 设置材质信息
 */
export interface ISetMatInfoParam {
  key: string;
  name: string;
}

export interface IReferenceInfo {
  uuid: string;
}
