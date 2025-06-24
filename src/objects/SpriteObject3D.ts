import { Sprite, SpriteMaterial, Vector2, Intersection, Raycaster } from 'three';
import { BaseObject3D, BaseInitOptions } from './BaseObject3D';

export interface SpriteObjectInitOptions extends BaseInitOptions {
  material?: SpriteMaterial;
  center?: Vector2;
  scale?: number[];
}

/**
 * @class SpriteObject3D
 * @desc Sprite对象的3D包装类，继承BaseObject3D并包含Sprite的功能
 * @extends BaseObject3D
 */
export class SpriteObject3D extends BaseObject3D {
  public override readonly type = 'SpriteObject3D';
  public sprite: Sprite;

  // 代理Sprite的主要属性
  public get center(): Vector2 {
    return this.sprite.center;
  }

  public set center(value: Vector2) {
    this.sprite.center = value;
  }

  public get isSprite(): boolean {
    return this.sprite.isSprite;
  }

  constructor(material?: SpriteMaterial, options: SpriteObjectInitOptions = {}) {
    super(options);

    // 创建内部的Sprite实例
    this.sprite = new Sprite(
      material || options.material
    );

    // 设置中心点
    if (options.center) {
      this.sprite.center.copy(options.center);
    }

    // 将Sprite添加为子对象
    this.add(this.sprite);

    // 设置基本属性
    if (options.name) this.name = options.name;
    if (options.pickedEnable !== undefined) this.pickedEnable = options.pickedEnable;
    if (options.scale) this.setScale(options.scale);
  }

  // 代理Sprite的核心方法
  public raycast(raycaster: Raycaster, intersects: Intersection[]): void {
    return this.sprite.raycast(raycaster, intersects);
  }

  // 获取和设置材质
  public getMaterial(): SpriteMaterial {
    return this.sprite.material;
  }

  public setSpriteMaterial(value: SpriteMaterial): this {
    this.sprite.material = value;
    return this;
  }

  // 便利方法：直接设置材质
  public setMaterial(material: SpriteMaterial): this {
    this.sprite.material = material;
    return this;
  }

  // 获取Sprite实例（如果需要直接访问Sprite的其他方法）
  public getSprite(): Sprite {
    return this.sprite;
  }

  // 设置中心点
  public setCenter(x: number, y: number): this;
  public setCenter(center: Vector2): this;
  public setCenter(centerOrX: Vector2 | number, y?: number): this {
    if (typeof centerOrX === 'number' && typeof y === 'number') {
      this.sprite.center.set(centerOrX, y);
    } else if (centerOrX instanceof Vector2) {
      this.sprite.center.copy(centerOrX);
    }
    return this;
  }

  // 获取中心点
  public getCenter(): Vector2 {
    return this.sprite.center.clone();
  }

  // 设置渲染相关属性
  public setCastShadow(value: boolean): this {
    this.sprite.castShadow = value;
    return this;
  }

  public setFrustumCulled(value: boolean): this {
    this.sprite.frustumCulled = value;
    return this;
  }

  public setRenderOrder(value: number): this {
    this.sprite.renderOrder = value;
    return this;
  }

  // 获取渲染相关属性
  public getCastShadow(): boolean {
    return this.sprite.castShadow;
  }

  public getReceiveShadow(): boolean {
    return this.sprite.receiveShadow;
  }

  public getFrustumCulled(): boolean {
    return this.sprite.frustumCulled;
  }

  public getRenderOrder(): number {
    return this.sprite.renderOrder;
  }

  // Sprite特有的便利方法
  public setSpriteSize(width: number, height: number): this {
    this.sprite.scale.set(width, height, 1);
    return this;
  }

  public getSpriteSize(): { width: number; height: number } {
    return {
      width: this.sprite.scale.x,
      height: this.sprite.scale.y
    };
  }

  // 设置透明度（通过材质）
  public setAlpha(alpha: number): this {
    if (this.sprite.material && 'opacity' in this.sprite.material) {
      (this.sprite.material as any).opacity = alpha;
      (this.sprite.material as any).transparent = alpha < 1;
      (this.sprite.material as any).needsUpdate = true;
    }
    return this;
  }

  // 获取透明度
  public getAlpha(): number {
    if (this.sprite.material && 'opacity' in this.sprite.material) {
      return (this.sprite.material as any).opacity || 1;
    }
    return 1;
  }

  // 设置颜色（通过材质）
  public setSpriteColor(color: string | number): this {
    if (this.sprite.material && 'color' in this.sprite.material) {
      (this.sprite.material as any).color.set(color);
      (this.sprite.material as any).needsUpdate = true;
    }
    return this;
  }

  // 设置纹理（通过材质）
  public setTexture(texture: any): this {
    if (this.sprite.material && 'map' in this.sprite.material) {
      (this.sprite.material as any).map = texture;
      (this.sprite.material as any).needsUpdate = true;
    }
    return this;
  }

  // 获取纹理
  public getTexture(): any {
    if (this.sprite.material && 'map' in this.sprite.material) {
      return (this.sprite.material as any).map;
    }
    return null;
  }

  // 设置旋转（Sprite的旋转只在Z轴有效）
  public setSpriteRotation(rotation: number): this {
    this.sprite.rotation.z = rotation;
    return this;
  }

  // 获取旋转
  public getSpriteRotation(): number {
    return this.sprite.rotation.z;
  }

  // 让Sprite始终面向相机（这是Sprite的默认行为，但可以手动控制）
  public lookAtCamera(camera: any): this {
    this.sprite.lookAt(camera.position);
    return this;
  }

  // 检查是否可见
  public isVisible(): boolean {
    return this.sprite.visible;
  }

  // 设置可见性
  public setVisible(visible: boolean): this {
    this.sprite.visible = visible;
    return this;
  }

  // 清理资源
  public dispose(): void {
    if (this.sprite.material) {
      // 清理材质
      this.sprite.material.dispose();
      
      // 如果有纹理，也清理纹理
      if ('map' in this.sprite.material && this.sprite.material.map) {
        this.sprite.material.map.dispose();
      }
    }

    this.remove(this.sprite);
  }

  // 克隆方法
  public override clone(recursive?: boolean): this {
    const cloned = new (this.constructor as any)(
      this.sprite.material?.clone(),
      {
        name: this.name + '_clone',
        pickedEnable: this.pickedEnable,
        bloom: this.bloomStatus,
        center: this.sprite.center.clone()
      }
    );

    // 复制变换
    cloned.position.copy(this.position);
    cloned.rotation.copy(this.rotation);
    cloned.scale.copy(this.scale);

    // 复制Sprite特有属性
    cloned.sprite.center.copy(this.sprite.center);
    cloned.sprite.scale.copy(this.sprite.scale);
    cloned.sprite.rotation.copy(this.sprite.rotation);

    return cloned;
  }
}