import { EnerV3DCore, GeometryObject3D } from '@enerv-3d/core';

export interface ObjectEventLog {
  id: string;
  objectName: string;
  eventType: string;
  timestamp: number;
  description: string;
  color: string;
}

export interface GeometryInfo {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'cylinder';
  color: string;
  opacity: number;
  visible: boolean;
  object?: GeometryObject3D;
  eventHandlers?: any;
}

export type ObjectEventCallback = (log: ObjectEventLog) => void;

export class ObjectEventDemo3D {
  private core: EnerV3DCore | null = null;
  private geometries: Map<string, GeometryInfo> = new Map();
  private onEventLogCallback: ObjectEventCallback | null = null;
  private colors = ['#ff4d4f', '#52c41a', '#1890ff'];
  private objectNames = ['红色立方体', '绿色球体', '蓝色圆柱体'];

  constructor() {}

  /**
   * 设置事件日志回调
   */
  setEventLogCallback(callback: ObjectEventCallback): void {
    this.onEventLogCallback = callback;
  }

  /**
   * 添加事件日志
   */
  private addEventLog(objectName: string, eventType: string, description: string, color: string): void {
    if (this.onEventLogCallback) {
      const log: ObjectEventLog = {
        id: Date.now().toString(),
        objectName,
        eventType,
        timestamp: Date.now(),
        description,
        color
      };
      this.onEventLogCallback(log);
    }
  }

  /**
   * 初始化3D引擎和创建对象
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
          color: '#1a1a1a'
        });
      }

      // 添加坐标辅助器
      if (this.core._initAxisHelper) {
        const helper = this.core._initAxisHelper(30);
        this.core.scene.add(helper);
      }

      // 设置相机位置
      this.core.camera.position.set(40, 40, 40);
      this.core.camera.lookAt(0, 0, 0);

      // 创建三个几何体
      this.createDemoObjects();

      this.addEventLog('系统', 'INIT', '物体事件系统初始化完成', '#1890ff');

      return this.core;
    } catch (error) {
      console.error('初始化3D引擎失败:', error);
      throw new Error(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 创建演示对象
   */
  private createDemoObjects(): void {
    if (!this.core) return;

    // 创建立方体
    const box = new GeometryObject3D({
      geometryType: 'box',
      color: this.colors[0],
      opacity: 0.8,
      geometryParam: { width: 8, height: 8, depth: 8 }
    });
    box.position.set(-15, 0, 0);
    box.name = this.objectNames[0];

    // 创建球体
    const sphere = new GeometryObject3D({
      geometryType: 'sphere',
      color: this.colors[1],
      opacity: 0.8,
      geometryParam: { radius: 5, widthSegments: 32, heightSegments: 16 }
    });
    sphere.position.set(0, 0, 0);
    sphere.name = this.objectNames[1];

    // 创建圆柱体
    const cylinder = new GeometryObject3D({
      geometryType: 'cylinder',
      color: this.colors[2],
      opacity: 0.8,
      geometryParam: { radius: 4, height: 10, radialSegments: 32 }
    });
    cylinder.position.set(15, 0, 0);
    cylinder.name = this.objectNames[2];

    const objects = [box, sphere, cylinder];

    // 为每个物体添加事件监听器和存储信息
    objects.forEach((obj, index) => {
      const objectName = this.objectNames[index];
      const color = this.colors[index];
      const type = index === 0 ? 'box' : index === 1 ? 'sphere' : 'cylinder';

      // 注册事件监听器
      const eventHandlers = this.registerObjectEvents(obj, objectName, color);

      // 添加到场景
      this.core!.scene.add(obj);

      // 存储几何体信息
      const geometryInfo: GeometryInfo = {
        id: (index + 1).toString(),
        name: objectName,
        type,
        color,
        opacity: 0.8,
        visible: true,
        object: obj,
        eventHandlers
      };

      this.geometries.set(geometryInfo.id, geometryInfo);
    });
  }

  /**
   * 为对象注册事件监听器
   */
  private registerObjectEvents(obj: GeometryObject3D, objectName: string, color: string): any {
    // 点击事件
    const clickHandler = (event: any) => {
      this.addEventLog(objectName, 'CLICK', `单击了 ${objectName}`, color);
    };

    // 双击事件
    const dblClickHandler = (event: any) => {
      this.addEventLog(objectName, 'DBCLICK', `双击了 ${objectName}`, color);
    };

    // 鼠标进入事件
    const mouseOverHandler = (event: any) => {
      this.addEventLog(objectName, 'POINT_OVER', `鼠标悬停在 ${objectName} 上`, color);
      // 高亮效果
      if (obj.material && 'opacity' in obj.material) {
        obj.material.opacity = 1.0;
      }
    };

    // 鼠标离开事件
    const mouseOutHandler = (event: any) => {
      this.addEventLog(objectName, 'POINT_OUT', `鼠标离开了 ${objectName}`, color);
      // 恢复正常
      if (obj.material && 'opacity' in obj.material) {
        obj.material.opacity = 0.8;
      }
    };

    // 鼠标按下事件
    const mouseDownHandler = (event: any) => {
      this.addEventLog(objectName, 'POINT_DOWN', `在 ${objectName} 上按下鼠标`, color);
    };

    // 鼠标抬起事件
    const mouseUpHandler = (event: any) => {
      this.addEventLog(objectName, 'POINT_UP', `在 ${objectName} 上抬起鼠标`, color);
    };

    // 注册事件监听器
    obj.on('CLICK', clickHandler);
    obj.on('DBCLICK', dblClickHandler);
    obj.on('POINT_OVER' as any, mouseOverHandler);
    obj.on('POINT_OUT' as any, mouseOutHandler);
    obj.on('POINT_DOWN' as any, mouseDownHandler);
    obj.on('POINT_UP' as any, mouseUpHandler);

    return {
      clickHandler,
      dblClickHandler,
      mouseOverHandler,
      mouseOutHandler,
      mouseDownHandler,
      mouseUpHandler
    };
  }

  /**
   * 手动触发对象事件
   */
  triggerObjectEvent(geometryId: string, eventType: string): void {
    const geometry = this.geometries.get(geometryId);
    if (geometry && geometry.object) {
      geometry.object.emit(eventType as any, {});
    }
  }

  /**
   * 移除对象的所有事件监听器
   */
  removeObjectEvents(geometryId: string): void {
    const geometry = this.geometries.get(geometryId);
    if (geometry && geometry.object && geometry.eventHandlers) {
      const { object, eventHandlers } = geometry;
             
       object.off('CLICK', eventHandlers.clickHandler);
       object.off('DBCLICK', eventHandlers.dblClickHandler);
       object.off('POINT_OVER' as any, eventHandlers.mouseOverHandler);
       object.off('POINT_OUT' as any, eventHandlers.mouseOutHandler);
       object.off('POINT_DOWN' as any, eventHandlers.mouseDownHandler);
       object.off('POINT_UP' as any, eventHandlers.mouseUpHandler);
    }
  }

  /**
   * 切换对象可见性
   */
  toggleObjectVisibility(geometryId: string): boolean {
    const geometry = this.geometries.get(geometryId);
    if (geometry && geometry.object) {
      geometry.object.visible = !geometry.object.visible;
      geometry.visible = geometry.object.visible;
      return geometry.visible;
    }
    return false;
  }

  /**
   * 获取所有几何体信息
   */
  getAllGeometries(): GeometryInfo[] {
    return Array.from(this.geometries.values());
  }

  /**
   * 获取支持的事件类型
   */
  getSupportedEvents(): string[] {
    return ['CLICK', 'DBCLICK', 'POINT_OVER', 'POINT_OUT', 'POINT_DOWN', 'POINT_UP'];
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理所有对象的事件监听器
    this.geometries.forEach((geometry, id) => {
      this.removeObjectEvents(id);
      
      if (geometry.object && this.core) {
        this.core.scene.remove(geometry.object);
        
        // 清理几何体和材质
        if (geometry.object.geometry) {
          geometry.object.geometry.dispose();
        }
        if (geometry.object.material) {
          if (Array.isArray(geometry.object.material)) {
            geometry.object.material.forEach(mat => mat.dispose());
          } else {
            geometry.object.material.dispose();
          }
        }
      }
    });

    this.geometries.clear();
    this.onEventLogCallback = null;
    this.core = null;
  }

  /**
   * 获取核心实例
   */
  getCore(): EnerV3DCore | null {
    return this.core;
  }
} 