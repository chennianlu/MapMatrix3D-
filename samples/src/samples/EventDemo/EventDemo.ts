import { EnerV3DCore, coreEvent } from '@enerv-3d/core';

export interface EventLog {
  id: string;
  type: string;
  timestamp: number;
  description: string;
  category: 'SYSTEM' | 'OBJECT';
}

export type EventCallback = (log: EventLog) => void;

export class EventDemo3D {
  private core: EnerV3DCore | null = null;
  private eventHandlers: Record<string, any> = {};
  private onEventLogCallback: EventCallback | null = null;

  constructor() {}

  /**
   * 设置事件日志回调
   */
  setEventLogCallback(callback: EventCallback): void {
    this.onEventLogCallback = callback;
  }

  /**
   * 添加事件日志
   */
  private addEventLog(type: string, description: string, category: 'SYSTEM' | 'OBJECT'): void {
    if (this.onEventLogCallback) {
      const log: EventLog = {
        id: Date.now().toString(),
        type,
        timestamp: Date.now(),
        description,
        category
      };
      this.onEventLogCallback(log);
    }
  }

  /**
   * 初始化3D引擎和事件系统
   */
  async initialize(container: HTMLElement): Promise<EnerV3DCore> {
    try {
      // 创建3D核心实例
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

      // 设置相机位置
      this.core.camera.position.set(20, 20, 20);
      this.core.camera.lookAt(0, 0, 0);

      // 注册所有事件监听器
      this.registerEventHandlers();

      // 初始化画布事件绑定
      if (this.core.domContainer.querySelector('canvas')) {
        const canvas = this.core.domContainer.querySelector('canvas') as HTMLCanvasElement;
        coreEvent.initEventNative(canvas);
      }

      this.addEventLog('SYSTEM_INIT', '事件系统初始化完成', 'SYSTEM');

      return this.core;
    } catch (error) {
      console.error('初始化3D引擎失败:', error);
      throw new Error(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 注册事件处理器
   */
  private registerEventHandlers(): void {
    // 系统事件处理器
    this.eventHandlers.canvasResizeHandler = () => {
      this.addEventLog('CORE_CANVAS_RESIZE', '画布大小发生变化', 'SYSTEM');
    };
    
    this.eventHandlers.objectSelectedHandler = (object: any, type: any) => {
      this.addEventLog('CORE_OBJECT_SELECTED', `物体选择事件: ${object?.name || '无'} (${type || '单选'})`, 'SYSTEM');
    };
    
    this.eventHandlers.levelChangeHandler = (cur: any, pre?: any, noFlight?: boolean) => {
      this.addEventLog('CORE_LEVEL_CHANGE', `场景层级发生变化: ${cur?.name || '未知'} → ${pre?.name || '无'}`, 'SYSTEM');
    };

    // 物体事件处理器
    this.eventHandlers.clickHandler = (event: MouseEvent) => {
      this.addEventLog('CLICK', `鼠标单击: (${event.clientX}, ${event.clientY})`, 'OBJECT');
    };
    
    this.eventHandlers.dbclickHandler = (event: MouseEvent) => {
      this.addEventLog('DBCLICK', `鼠标双击: (${event.clientX}, ${event.clientY})`, 'OBJECT');
    };
    
    this.eventHandlers.pointUpHandler = (event: MouseEvent) => {
      this.addEventLog('POINT_UP', `鼠标抬起: (${event.clientX}, ${event.clientY})`, 'OBJECT');
    };
    
    this.eventHandlers.pointDownHandler = (event: MouseEvent) => {
      this.addEventLog('POINT_DOWN', `鼠标按下: (${event.clientX}, ${event.clientY})`, 'OBJECT');
    };
    
    this.eventHandlers.pointMoveHandler = (event: MouseEvent) => {
      this.addEventLog('POINT_MOVE', `鼠标移动: (${event.clientX}, ${event.clientY})`, 'OBJECT');
    };
    
    this.eventHandlers.pointOutHandler = (event: MouseEvent) => {
      this.addEventLog('POINT_OUT', '鼠标离开悬停范围', 'OBJECT');
    };
    
    this.eventHandlers.pointOverHandler = () => {
      this.addEventLog('POINT_OVER', '鼠标进入元素边界', 'OBJECT');
    };
    
    this.eventHandlers.wheelHandler = () => {
      this.addEventLog('WHEEL', '鼠标滚轮事件', 'OBJECT');
    };
    
    this.eventHandlers.keyDownHandler = (event: KeyboardEvent) => {
      this.addEventLog('KEY_DOWN', `键盘按下: ${event.key}`, 'OBJECT');
    };
    
    this.eventHandlers.keyUpHandler = (event: KeyboardEvent) => {
      this.addEventLog('KEY_UP', `键盘抬起: ${event.key}`, 'OBJECT');
    };

    // 注册所有事件监听器
    coreEvent.on('CORE_CANVAS_RESIZE', this.eventHandlers.canvasResizeHandler);
    coreEvent.on('CORE_OBJECT_SELECTED', this.eventHandlers.objectSelectedHandler);
    coreEvent.on('CORE_LEVEL_CHANGE', this.eventHandlers.levelChangeHandler);
    coreEvent.on('CLICK', this.eventHandlers.clickHandler);
    coreEvent.on('DBCLICK', this.eventHandlers.dbclickHandler);
    coreEvent.on('POINT_UP', this.eventHandlers.pointUpHandler);
    coreEvent.on('POINT_DOWN', this.eventHandlers.pointDownHandler);
    coreEvent.on('POINT_MOVE', this.eventHandlers.pointMoveHandler);
    coreEvent.on('POINT_OUT', this.eventHandlers.pointOutHandler);
    coreEvent.on('POINT_OVER', this.eventHandlers.pointOverHandler);
    coreEvent.on('WHEEL', this.eventHandlers.wheelHandler);
    coreEvent.on('KEY_DOWN', this.eventHandlers.keyDownHandler);
    coreEvent.on('KEY_UP', this.eventHandlers.keyUpHandler);
  }

  /**
   * 手动触发系统事件
   */
  triggerSystemEvent(eventType: string): void {
    switch (eventType) {
      case 'CORE_CANVAS_RESIZE':
        coreEvent.dispatch('CORE_CANVAS_RESIZE', []);
        break;
      case 'CORE_OBJECT_SELECTED':
        coreEvent.dispatch('CORE_OBJECT_SELECTED', [null, 'single']);
        break;
      case 'CORE_LEVEL_CHANGE':
        this.addEventLog('CORE_LEVEL_CHANGE', `手动触发场景层级变化事件`, 'SYSTEM');
        break;
      default:
        this.addEventLog(eventType, `手动触发 ${eventType} 事件`, 'SYSTEM');
    }
  }

  /**
   * 手动触发物体事件
   */
  triggerObjectEvent(eventType: string): void {
    const mockEvent = new MouseEvent('click', {
      clientX: Math.floor(Math.random() * 400),
      clientY: Math.floor(Math.random() * 300)
    });

    switch (eventType) {
      case 'CLICK':
        coreEvent.dispatch('CLICK', [mockEvent]);
        break;
      case 'DBCLICK':
        coreEvent.dispatch('DBCLICK', [mockEvent]);
        break;
      case 'POINT_UP':
        coreEvent.dispatch('POINT_UP', [mockEvent]);
        break;
      case 'POINT_DOWN':
        coreEvent.dispatch('POINT_DOWN', [mockEvent]);
        break;
      case 'POINT_MOVE':
        coreEvent.dispatch('POINT_MOVE', [mockEvent]);
        break;
      case 'POINT_OUT':
        coreEvent.dispatch('POINT_OUT', [mockEvent]);
        break;
      case 'POINT_OVER':
        coreEvent.dispatch('POINT_OVER', []);
        break;
      case 'WHEEL':
        coreEvent.dispatch('WHEEL', []);
        break;
      case 'KEY_DOWN':
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Space' });
        coreEvent.dispatch('KEY_DOWN', [keyDownEvent]);
        break;
      case 'KEY_UP':
        const keyUpEvent = new KeyboardEvent('keyup', { key: 'Space' });
        coreEvent.dispatch('KEY_UP', [keyUpEvent]);
        break;
      default:
        this.addEventLog(eventType, `手动触发 ${eventType} 事件`, 'OBJECT');
    }
  }

  /**
   * 获取系统事件列表
   */
  getSystemEvents(): string[] {
    return ['CORE_CANVAS_RESIZE', 'CORE_OBJECT_SELECTED', 'CORE_LEVEL_CHANGE'];
  }

  /**
   * 获取物体事件列表
   */
  getObjectEvents(): string[] {
    return ['CLICK', 'DBCLICK', 'POINT_UP', 'POINT_DOWN', 'POINT_MOVE', 'POINT_OUT', 'POINT_OVER', 'WHEEL', 'KEY_DOWN', 'KEY_UP'];
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 移除所有事件监听器
    Object.entries(this.eventHandlers).forEach(([key, handler]) => {
      if (key.includes('canvasResize')) {
        coreEvent.off('CORE_CANVAS_RESIZE', handler);
      } else if (key.includes('objectSelected')) {
        coreEvent.off('CORE_OBJECT_SELECTED', handler);
      } else if (key.includes('levelChange')) {
        coreEvent.off('CORE_LEVEL_CHANGE', handler);
      } else if (key.includes('click')) {
        coreEvent.off('CLICK', handler);
      } else if (key.includes('dbclick')) {
        coreEvent.off('DBCLICK', handler);
      } else if (key.includes('pointUp')) {
        coreEvent.off('POINT_UP', handler);
      } else if (key.includes('pointDown')) {
        coreEvent.off('POINT_DOWN', handler);
      } else if (key.includes('pointMove')) {
        coreEvent.off('POINT_MOVE', handler);
      } else if (key.includes('pointOut')) {
        coreEvent.off('POINT_OUT', handler);
      } else if (key.includes('pointOver')) {
        coreEvent.off('POINT_OVER', handler);
      } else if (key.includes('wheel')) {
        coreEvent.off('WHEEL', handler);
      } else if (key.includes('keyDown')) {
        coreEvent.off('KEY_DOWN', handler);
      } else if (key.includes('keyUp')) {
        coreEvent.off('KEY_UP', handler);
      }
    });

    this.eventHandlers = {};
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