import * as THREE from 'three';
import { coreEvent } from '../../managers/eventManager';
import { Object3DType } from '../../types';
import { BaseObject3D } from '../../objects/BaseObject3D';

interface Options {
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;   
  scene: THREE.Scene;
}

// 定义一个类型守卫函数
function isObject3DType(obj: any): obj is Object3DType {
  return obj instanceof BaseObject3D;
}

// 定义一个类型转换函数
function asObject3DType(obj: THREE.Object3D): Object3DType | null {
  return isObject3DType(obj) ? obj : null;
}

// todo  level控制放到接口层处理
class SelectionTools {
  private _camera!: THREE.Camera;
  private _scene!: THREE.Scene;
  private _canvas!: HTMLCanvasElement;
  private _mouse = new THREE.Vector2();
  private _raycaster = new THREE.Raycaster(undefined, undefined, 0, 6000);
  public raycasterObjs: (THREE.Object3D | Object3DType)[] = [];
  // 禁止层级切换
  public pauseLevelChange: boolean = false;
  // 禁止层级切换过程的飞行动画
  public pauseLevelChangeAnimation: boolean = false;
  // 禁止选中物体
  public pauseSelection: boolean = false;

  public selected: Object3DType | null = null;
  // 绑定场景根节点，用于控制场景层级切换
  private _sceneRoot!: Object3DType | THREE.Scene;

  public pickedPoints: THREE.Vector3[] = [];
  private _trashStorage: any[] = []; // 存储层级切换过程设置效果的容器

  static _instance: SelectionTools;
  private _detectPickevent: ((e: MouseEvent) => void) | null = null;

  constructor() {
    if (new.target !== SelectionTools) {
      return;
    }
    if (!SelectionTools._instance) {
      SelectionTools._instance = this;
      // 这里添加构造函数属性

      //记录当前鼠标的信息
      this._mouse = new THREE.Vector2();
      // 实例化一个射线
      this._raycaster = new THREE.Raycaster(undefined, undefined, 0, 6000);

      // 存储拾取到的坐标点位
      this.pickedPoints = [];
      this._trashStorage = [];

      SelectionTools._instance = this;
      this.pauseSelection = false;
      this.pauseLevelChange = false;
      this.pauseLevelChangeAnimation = false;
      this.selected = null;
    }
    return SelectionTools._instance;
  }

  set sceneRoot(node: Object3DType | THREE.Scene) {
    this._sceneRoot = node;
  }

  get sceneRoot(): Object3DType | THREE.Scene {
    return this._sceneRoot;
  }

  init(options: Options) {
    this._camera = options.camera;
    this._canvas = options.canvas;
    this._scene = options.scene;
    this._sceneRoot = this._scene;

    // 默认射线拾取范围
    this.raycasterObjs = [options.scene];
    //注册鼠标移动事件
    this._mouseMove();
    // 注册默认点击事件
    this._handleClick();
  }

  _transparentEffect(obj: Object3DType) {
    if (obj.parent === this._scene) return;
    // 设置当前节点兄弟节点半透明
    const sibilingObjs = obj.parent?.children;
    if (!Array.isArray(sibilingObjs)) return;
    for (let i = 0; i < sibilingObjs.length; i++) {
      const cur = sibilingObjs[i];
      if (cur === obj) continue;
      if (cur instanceof BaseObject3D) {
        cur.setOpacity(0.01, true);
        this._trashStorage.push(cur);
      }
    }
  }

  _transparentClear() {
    for (let i = 0; i < this._trashStorage.length; i++) {
      const cur = this._trashStorage[i];
      if (cur instanceof BaseObject3D) {
        cur.setOpacity(1, true);
      }
    }
    this._trashStorage = [];
  }
  /**
   * 注册鼠标滑动事件。
   */
  private _mouseMove() {
    const _this = this;
    const canvas = this._canvas;
    coreEvent.on(
      'POINT_MOVE',
      function (e: MouseEvent) {
        _this._mouse.set(
          (e.offsetX / canvas.offsetWidth) * 2 - 1,
          1 - (e.offsetY / canvas.offsetHeight) * 2
        );
      },
      {
        des: '更新鼠标信息',
        origin: 1,
      }
    );
  }

  private _handleClick() {
    const _this = this;
    coreEvent.on(
      'CLICK',
      function (e: MouseEvent) {
        _this._click(null);
      },
      {
        des: '单机物体效果',
        origin: 1,
      }
    );

    coreEvent.on(
      'DBCLICK',
      function (e: MouseEvent) {
        _this._dbClick(null);
      },
      {
        des: '双击物体飞入效果',
        origin: 1,
      }
    );

    coreEvent.on(
      'POINT_UP',
      function (e: MouseEvent) {
        if (e.button !== 2) return;
        _this._pointUp();
      },
      {
        des: '右键触发层级回退事件',
        origin: 1,
      }
    );
  }

  /**
   * 获取当前场景中的默认可拾取范围
   */
  getDefaultScope(obj?: Object3DType[]): Array<Object3DType> {
    const list = this._scene.children;
    const result: Object3DType[] = [];
    for (let i = 0; i < list.length; i++) {
      const child = list[i];
      if (isObject3DType(child)) {
        result.push(child);
      }
    }
    if (obj) result.push(...obj);
    this.raycasterObjs = result as unknown as (THREE.Object3D | Object3DType)[];
    return result;
  }

  /**
   * 获取射线拾取信息
   * @param option 由于两个设定参数均为可选的，统一设定配置项
   * @returns 返回射线拾取全部对象
   */
  calculateSelection(option: { objects?: (THREE.Object3D | Object3DType)[] | null; selectObject?: Object3DType }) {
    let { objects = this.raycasterObjs } = option;
    const { selectObject } = option;
    if (!Array.isArray(objects)) objects = objects ? [objects] : [];
    this._raycaster.setFromCamera(this._mouse, this._camera);
    if (selectObject) {
      // 当前拾取范围内需要过滤的物体
      const objIndex = objects.indexOf(selectObject);
      if (objIndex !== -1) objects.splice(objIndex, 1);
    }
    const intersectObjects = this._raycaster.intersectObjects(objects as THREE.Object3D[], true);
    if (intersectObjects?.length > 0) {
      return intersectObjects[0];
    } else {
      return false;
    }
  }

  /**
   * 返用于获取鼠标拾取物体
   * @params objects 控制射线的拾取范围  TODO 后续可以通过动态改变优化射线性能
   * @returns 返回当前射线拾取物体
   */
  getPickedObject(): Object3DType | null {
    if (!Array.isArray(this.raycasterObjs)) this.raycasterObjs = [this.raycasterObjs];
    let curSel: Object3DType | null = null;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    const intersectObjects = this._raycaster.intersectObjects(this.raycasterObjs as THREE.Object3D[], true);

    //过滤掉所有不可见物体
    const filteredIntersectObjects = intersectObjects.filter(item => item.object.visible === true);

    if (!filteredIntersectObjects[0]) return null;
    const object = filteredIntersectObjects[0].object;

    const getPartObj = (obj: THREE.Object3D): Object3DType | null => {
      if (!obj) return null;
      const converted = asObject3DType(obj);
      if (converted && converted.pickedEnable === true) {
        return converted;
      }
      if (obj.parent) {
        const parentObj = obj.parent;
        if (parentObj instanceof BaseObject3D) {
          if (parentObj.pickedEnable === true) {
            return parentObj;
          }
        }
        if (parentObj instanceof THREE.Object3D) {
          const parentResult = getPartObj(parentObj);
          if (parentResult && parentResult instanceof BaseObject3D && parentResult.pickedEnable === true) {
            return parentResult;
          }
        }
      }
      return null;
    };

    try {
      const result = getPartObj(object);
      if (result && result instanceof BaseObject3D && result.pickedEnable === true) {
        curSel = result;
      }
    } catch (error) {
      console.error('Error in getPickedObject:', error);
      curSel = null;
    }
    return curSel;
  }

  /**
   * 设置射线远面
   * @param val {Number}
   */
  setRayCasterFar(val: number) {
    if (typeof val !== 'number') return;
    this._raycaster.far = val;
  }

  /**
   * 单机物体效果
   * TODO 双击操作也触发了  后面排查
   * @returns void
   */
  private _click(object?: Object3DType | null): void {
    if (!object) object = this.getPickedObject();
    if (object) {
      // 触发物体级别事件
      object.emit('CLICK', object);
    }
    //判断当前是否为禁用鼠标状态
    if (this.pauseSelection) return;
    this.selected = object;
    coreEvent.dispatch('CORE_OBJECT_SELECTED', [object, 'single']);
  }

  /**
   * 鼠标右键单击效果
   * @returns void
   */
  private _pointUp(): void {
    //判断当前是否为禁用鼠标状态
    if (this.pauseLevelChange) return;
    this.selected = null;
    coreEvent.dispatch('CORE_OBJECT_SELECTED', [null, 'single']);
  }

  /**
   * 双击物体触发的层级切换效果效果
   * @date 2024/2/18 - 11:46:17
   *
   * @private
   * @param {(Object3DType | null)} object
   */
  private _dbClick(object: Object3DType | null) {
    if (!object) {
      const picked = this.getPickedObject();
      if (!picked) return;
      object = picked;
    }
    // 触发物体级别事件
    object.emit('DBCLICK', object);
    //判断当前是否为禁用鼠标状态
    if (this.pauseLevelChange) return;
  }

  /**
   * 设置当前选择选中物体
   * @date 2024/2/18 - 13:24:00
   *
   * @param {(Object3DType | null)} object
   * @returns {boolean} 返回布尔值代表设置是否成功
   */
  setSelection(object: Object3DType | null) {
    if (this.pauseSelection) return false;
    if (object) {
      this._click(object);
    } else {
      this.selected = null;
    }
    return true;
  }

  /**
   * 获取当前场景中选中的物体,如果是框选对象，则返回其子对象数组
   * @return {ObjectType | null}
   */
  getSelection(): Object3DType | null {
    return this.selected;
  }

  /**
   * 检测拾取坐标点位信息
   * @param state  开启状态  如果state为false会关闭时间并清空缓存点位
   * @param scope  限制拾取范围
   */
  detectPickPoints(state: boolean, scope: Object3DType[] | null) {
    const _this = this;
    const func = (e: MouseEvent) => {
      const pickedMsg = _this.calculateSelection({ objects: scope });
      if (pickedMsg && pickedMsg.point instanceof THREE.Vector3) {
        _this.pickedPoints.push(pickedMsg.point);
      }
      console.log('拾取点位列表：', this.pickedPoints);
    };
    if (!this._detectPickevent) this._detectPickevent = func;
    if (state) {
      coreEvent.on('CLICK', this._detectPickevent, {
        des: '鼠标单击获取点位',
        origin: 1,
      });
    } else {
      _this.pickedPoints = [];
      coreEvent.off('CLICK', this._detectPickevent, {
        des: '鼠标单击获取点位',
        origin: 1,
      });
    }
  }

  public setPickableObjects(objects: THREE.Object3D[]): void {
    this.raycasterObjs = objects;
  }

  /**
   * 重置 释放引用内存地址
   */
  clear() {}
}

export const selectionTool = new SelectionTools();
