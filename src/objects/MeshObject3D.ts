import { Mesh, BufferGeometry, Material, Intersection, Raycaster, Vector3 } from 'three';
import { BaseObject3D, BaseInitOptions } from './BaseObject3D';

export interface MeshObjectInitOptions extends BaseInitOptions {
  geometry?: BufferGeometry;
  material?: Material | Material[];
  appKey?: number | string | null;
}

// === Mixin 类型定义 ===

/**
 * 构造函数类型，用于Mixin
 */
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * BaseObject3D的接口，用于类型混合
 */
interface BaseObject3DInterface {
  appKey: number | string | null;
  pickedEnable: boolean;
  bloomStatus: boolean;
  overrideColor: string | null;
  overrideOpacity: number;
  lockedStatus: boolean;
  
  on(eventType: string, func: Function): this;
  off(eventType: string, func: Function): this;
  once(eventType: string, func: Function): this;
  emit(eventType: string, ...args: any[]): void;
  
  setPosition(pos: number[] | Vector3): this;
  setScale(scale: number[] | Vector3): this;
  setRotation(rotation: number[]): this;
  show(deep?: boolean): this;
  hide(deep?: boolean): this;
  setColor(color: string | null): this;
  setOpacity(opacity: number): this;
  setBloomEffect(enabled: boolean): this;
  clear(): void;
}

/**
 * Mesh功能的接口
 */
interface MeshInterface {
  geometry: BufferGeometry;
  material: Material | Material[];
  morphTargetInfluences?: number[];
  morphTargetDictionary?: { [key: string]: number };
  readonly isMesh: true;
  
  updateMorphTargets(): void;
  getVertexPosition(index: number, target: Vector3): Vector3;
  raycast(raycaster: Raycaster, intersects: Intersection[]): void;
}

// === Mixin 实现函数 ===

/**
 * BaseObject3D功能的Mixin
 */
function BaseObject3DMixin<TBase extends Constructor>(Base: TBase) {
  return class BaseObject3DMixinClass extends Base implements BaseObject3DInterface {
    public appKey: number | string | null = null;
    private _listeners: any = {};
    private _pickedEnable: boolean = true;
    public bloomStatus: boolean = false;
    public overrideColor: string | null = null;
    public overrideOpacity: number = 1;
    public lockedStatus: boolean = false;

    constructor(...args: any[]) {
      super(...args);
      // 使用id作为默认appKey
      this.appKey = (this as any).id || null;
    }

    // === 事件系统 ===
    public on(eventType: string, func: Function): this {
      if (!this._listeners[eventType]) {
        this._listeners[eventType] = [];
      }
      this._listeners[eventType].push(func);
      return this;
    }

    public off(eventType: string, func: Function): this {
      if (this._listeners[eventType]) {
        const index = this._listeners[eventType].indexOf(func);
        if (index > -1) {
          this._listeners[eventType].splice(index, 1);
        }
      }
      return this;
    }

    public once(eventType: string, func: Function): this {
      const cb = (...args: any[]) => {
        func.apply(this, args);
        this.off(eventType, cb);
      };
      this.on(eventType, cb);
      return this;
    }

    public emit(eventType: string, ...args: any[]): void {
      if (this._listeners[eventType]) {
        this._listeners[eventType].forEach((func: Function) => {
          func.apply(this, args);
        });
      }
    }

    // === 属性访问器 ===
    get pickedEnable(): boolean {
      return this._pickedEnable;
    }

    set pickedEnable(enable: boolean) {
      this._pickedEnable = enable;
    }

    // === 便利方法 ===
    public setPosition(pos: number[] | Vector3): this {
      const position = (this as any).position;
      if (position) {
        if (Array.isArray(pos)) {
          position.set(pos[0], pos[1], pos[2]);
        } else {
          position.copy(pos);
        }
      }
      return this;
    }

    public setScale(scale: number[] | Vector3): this {
      const scaleObj = (this as any).scale;
      if (scaleObj) {
        if (Array.isArray(scale)) {
          scaleObj.set(scale[0], scale[1], scale[2]);
        } else {
          scaleObj.copy(scale);
        }
      }
      return this;
    }

    public setRotation(rotation: number[]): this {
      const rotationObj = (this as any).rotation;
      if (rotationObj) {
        rotationObj.set(rotation[0], rotation[1], rotation[2]);
      }
      return this;
    }

    public show(deep: boolean = true): this {
      (this as any).visible = true;
      if (deep && (this as any).traverse) {
        (this as any).traverse((child: any) => child.visible = true);
      }
      return this;
    }

    public hide(deep: boolean = true): this {
      (this as any).visible = false;
      if (deep && (this as any).traverse) {
        (this as any).traverse((child: any) => child.visible = false);
      }
      return this;
    }

    public setColor(color: string | null): this {
      this.overrideColor = color;
      const material = (this as any).material;
      if (color && material) {
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach((mat: any) => {
          if ('color' in mat) {
            mat.color.setStyle(color);
          }
        });
      }
      return this;
    }

    public setOpacity(opacity: number): this {
      this.overrideOpacity = opacity;
      const material = (this as any).material;
      if (material) {
        const materials = Array.isArray(material) ? material : [material];
        materials.forEach((mat: any) => {
          mat.transparent = opacity < 1;
          mat.opacity = opacity;
        });
      }
      return this;
    }

    public setBloomEffect(enabled: boolean): this {
      this.bloomStatus = enabled;
      return this;
    }

    public clear(): void {
      this._listeners = {};
    }
  };
}

/**
 * Mesh增强功能的Mixin
 */
function MeshEnhancementMixin<TBase extends Constructor<Mesh>>(Base: TBase) {
  return class MeshEnhancementClass extends Base implements MeshInterface {
    public readonly isMesh: true = true;

    constructor(...args: any[]) {
      super(...args);
      this.updateMorphTargets();
    }

    /**
     * 更新morph targets
     */
    public updateMorphTargets(): void {
      const geometry = this.geometry;
      if (!geometry) return;
      
      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);

      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];

        if (morphAttribute !== undefined) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};

          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);
            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }

    /**
     * 获取顶点位置
     */
    public getVertexPosition(index: number, target: Vector3): Vector3 {
      const geometry = this.geometry;
      if (!geometry || !geometry.attributes.position) {
        return target.set(0, 0, 0);
      }
      
      const position = geometry.attributes.position;
      target.fromBufferAttribute(position, index);

      // 处理 morph targets
      const morphPosition = geometry.morphAttributes.position;
      const morphInfluences = this.morphTargetInfluences;

      if (morphPosition && morphInfluences) {
        const morphA = new Vector3(0, 0, 0);
        const tempA = new Vector3();

        for (let i = 0, il = morphPosition.length; i < il; i++) {
          const influence = morphInfluences[i];
          if (influence === 0) continue;

          const morphAttribute = morphPosition[i];
          tempA.fromBufferAttribute(morphAttribute, index);

          if (geometry.morphTargetsRelative) {
            morphA.addScaledVector(tempA, influence);
          } else {
            morphA.addScaledVector(tempA.sub(target), influence);
          }
        }

        target.add(morphA);
      }

      return target;
    }

    /**
     * 重写射线检测以确保正确的材质和几何体处理
     */
    public raycast(raycaster: Raycaster, intersects: Intersection[]): void {
      // 调用原生Mesh的raycast方法
      super.raycast(raycaster, intersects);
    }

    /**
     * 设置几何体
     */
    public setGeometry(geometry: BufferGeometry): this {
      this.geometry = geometry;
      this.updateMorphTargets();
      return this;
    }

    /**
     * 设置材质
     */
    public setMaterial(material: Material | Material[]): this {
      this.material = material;
      return this;
    }

    /**
     * 获取材质
     */
    public getMaterial(): Material | Material[] {
      return this.material;
    }

    /**
     * 重写copy方法
     */
    public copy(source: this, recursive?: boolean): this {
      super.copy(source, recursive);

      if (source.morphTargetInfluences !== undefined) {
        this.morphTargetInfluences = source.morphTargetInfluences.slice();
      }

      if (source.morphTargetDictionary !== undefined) {
        this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);
      }

      return this;
    }

    /**
     * 资源清理
     */
    public dispose(): void {
      if (this.geometry) {
        this.geometry.dispose();
      }

      if (this.material) {
        if (Array.isArray(this.material)) {
          this.material.forEach(material => material.dispose());
        } else {
          this.material.dispose();
        }
      }

      // 调用BaseObject3D的清理方法
      if ((this as any).clear) {
        (this as any).clear();
      }
    }
  };
}

// === 最终的MeshObject3D类 ===

/**
 * 创建混合了BaseObject3D和Mesh功能的基类
 */
const BaseMixedMesh = BaseObject3DMixin(MeshEnhancementMixin(Mesh));

/**
 * @class MeshObject3D
 * @desc 通过Mixin模式同时继承BaseObject3D和Three.Mesh的功能
 * 提供完整的3D网格对象功能，包括事件系统、便利方法和原生Mesh功能
 * @extends Mesh (通过Mixin)
 * @implements BaseObject3DInterface
 * @implements MeshInterface
 */
export class MeshObject3D extends BaseMixedMesh {
  public override readonly type = 'MeshObject3D';

  constructor(
    geometry: BufferGeometry = new BufferGeometry(),
    material: Material | Material[] = [],
    options: MeshObjectInitOptions = {}
  ) {
    super(geometry, material);

    // 应用选项
    if (options.name) this.name = options.name;
    if (options.pickedEnable !== undefined) this.pickedEnable = options.pickedEnable;
    if (options.appKey !== undefined) this.appKey = options.appKey;
    
    // 设置默认值
    this.appKey = this.appKey || this.id;
  }
}

// === 类型导出，确保类型推断正确 ===
export type MeshObject3DType = MeshObject3D & BaseObject3DInterface & MeshInterface;
  