import { EnerV3DCore, GeometryObject3D } from '@enerv-3d/core';

export interface GeometryInfo {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'cylinder';
  color: string;
  opacity: number;
  visible: boolean;
  object?: GeometryObject3D;
}

export class CoreGeometryDemo3D {
  private core: EnerV3DCore | null = null;
  private geometries: Map<string, GeometryObject3D> = new Map();
  private colors = ['#ff4d4f', '#52c41a', '#1890ff', '#faad14', '#722ed1', '#13c2c2'];
  private geometryCounter = 0;

  constructor() {}

  /**
   * 初始化3D引擎
   */
  async initialize(container: HTMLElement): Promise<EnerV3DCore> {
    try {
      // 初始化核心引擎
      this.core = new EnerV3DCore(container);
      
      // 设置DOM容器
      if (this.core.domContainer) {
        container.appendChild(this.core.domContainer);
        this.core.domContainer.style.width = '100%';
        this.core.domContainer.style.height = '100%';
      }

      // 设置场景背景
      if (this.core.sceneEffectTool) {
        this.core.sceneEffectTool.setBackground({
          type: 'color',
          color: '#000000'
        });
      }

      // 添加坐标辅助器
      if (this.core._initAxisHelper) {
        const helper = this.core._initAxisHelper(50);
        this.core.scene.add(helper);
      }

      // 设置相机位置
      this.core.camera.position.set(30, 30, 30);
      this.core.camera.lookAt(0, 0, 0);

      // 创建初始示例几何体
      this.createInitialGeometries();

      return this.core;
    } catch (error) {
      console.error('无法初始化 EnerV3DCore:', error);
      throw new Error(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建初始几何体
   */
  private createInitialGeometries(): GeometryInfo[] {
    const initialGeometries: GeometryInfo[] = [];

    // 创建盒子
    const box = this.createGeometry('box', { width: 10, height: 10, depth: 10 });
    if (box) {
      box.object!.position.set(-15, 0, 0);
      initialGeometries.push(box);
    }

    // 创建球体
    const sphere = this.createGeometry('sphere', { radius: 6, widthSegments: 32, heightSegments: 16 });
    if (sphere) {
      sphere.object!.position.set(0, 0, 0);
      initialGeometries.push(sphere);
    }

    // 创建圆柱体
    const cylinder = this.createGeometry('cylinder', { radius: 5, height: 12, radialSegments: 32 });
    if (cylinder) {
      cylinder.object!.position.set(15, 0, 0);
      initialGeometries.push(cylinder);
    }

    return initialGeometries;
  }

  /**
   * 创建几何体
   */
  createGeometry(type: 'box' | 'sphere' | 'cylinder', geometryParam: any): GeometryInfo | null {
    if (!this.core) return null;

    const id = (++this.geometryCounter).toString();
    const color = this.colors[this.geometryCounter % this.colors.length];
    const name = `${this.getGeometryTypeName(type)}_${id}`;

    try {
      const object = new GeometryObject3D({
        geometryType: type,
        color,
        opacity: 0.8,
        geometryParam
      });

      // 添加到场景
      this.core.scene.add(object);
      
      // 存储引用
      this.geometries.set(id, object);

      const geometryInfo: GeometryInfo = {
        id,
        name,
        type,
        color,
        opacity: 0.8,
        visible: true,
        object
      };

      return geometryInfo;
    } catch (error) {
      console.error('创建几何体失败:', error);
      return null;
    }
  }

  /**
   * 删除几何体
   */
  removeGeometry(id: string): boolean {
    const object = this.geometries.get(id);
    if (object && this.core) {
      // 从场景中移除
      this.core.scene.remove(object);
      
      // 清理资源
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }

      // 从映射中删除
      this.geometries.delete(id);
      return true;
    }
    return false;
  }

  /**
   * 切换几何体可见性
   */
  toggleGeometryVisibility(id: string): boolean {
    const object = this.geometries.get(id);
    if (object) {
      object.visible = !object.visible;
      return object.visible;
    }
    return false;
  }

  /**
   * 更新几何体颜色
   */
  updateGeometryColor(id: string, color: string): boolean {
    const object = this.geometries.get(id);
    if (object && object.material) {
      if ('color' in object.material) {
        object.material.color.setStyle(color);
        return true;
      }
    }
    return false;
  }

  /**
   * 更新几何体透明度
   */
  updateGeometryOpacity(id: string, opacity: number): boolean {
    const object = this.geometries.get(id);
    if (object && object.material) {
      if ('opacity' in object.material) {
        object.material.opacity = opacity;
        object.material.transparent = opacity < 1;
        return true;
      }
    }
    return false;
  }

  /**
   * 获取所有几何体信息
   */
  getAllGeometries(): GeometryInfo[] {
    const result: GeometryInfo[] = [];
    this.geometries.forEach((object, id) => {
      result.push({
        id,
        name: object.name || `Geometry_${id}`,
        type: this.getObjectType(object),
        color: this.getObjectColor(object),
        opacity: this.getObjectOpacity(object),
        visible: object.visible,
        object
      });
    });
    return result;
  }

  /**
   * 获取几何体类型名称
   */
  private getGeometryTypeName(type: string): string {
    const names: Record<string, string> = {
      box: 'Box',
      sphere: 'Sphere',
      cylinder: 'Cylinder'
    };
    return names[type] || 'Geometry';
  }

  /**
   * 获取对象类型
   */
  private getObjectType(object: GeometryObject3D): 'box' | 'sphere' | 'cylinder' {
    // 这里需要根据实际的GeometryObject3D实现来判断类型
    // 暂时返回默认值
    return 'box';
  }

  /**
   * 获取对象颜色
   */
  private getObjectColor(object: GeometryObject3D): string {
    if (object.material && 'color' in object.material) {
      return `#${object.material.color.getHexString()}`;
    }
    return '#ffffff';
  }

  /**
   * 获取对象透明度
   */
  private getObjectOpacity(object: GeometryObject3D): number {
    if (object.material && 'opacity' in object.material) {
      return object.material.opacity;
    }
    return 1;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理所有几何体
    this.geometries.forEach((object) => {
      if (this.core) {
        this.core.scene.remove(object);
      }
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.geometries.clear();
    this.core = null;
  }

  /**
   * 获取核心实例
   */
  getCore(): EnerV3DCore | null {
    return this.core;
  }
} 