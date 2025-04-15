import * as THREE from 'three';
import { coreEvent } from '../../managers/eventManager';
import { Object3DType } from '../../types';
import { BaseObject3D } from '../../objects/BaseObject3D';

interface Options {
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
}

// todo  level控制放到接口层处理
class SelectionTools {
  private _camera: THREE.Camera;
  private _scene: THREE.Scene;
  private _canvas: HTMLCanvasElement;
  private _mouse: THREE.Vector2;
  private _raycaster: THREE.Raycaster;
  protected raycasterObjs: THREE.Object3D[];
  // 禁止层级切换
  public pauseLevelChange: boolean;
  // 禁止层级切换过程的飞行动画
  public pauseLevelChangeAnimation: boolean;
  // 禁止选中物体
  public pauseSelection: boolean;

  public selected: Object3DType | null;
  // 当前层级对象
  public curLevel: Object3DType | null;
  //  上一层级对象
  public preLevel: Object3DType | null;
  // 绑定场景根节点，用于控制场景层级切换
  private _sceneRoot: Object3DType | THREE.Scene;

  public pickedPoints: THREE.Vector3[];
  private _trashStorage: any[]; // 存储层级切换过程设置效果的容器

  static _instance: SelectionTools;
  private _detectPickevent: (e: MouseEvent) => void | null;

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
      this.curLevel = null;
      this.preLevel = null;
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
    //监听层级变化事件  设置射线拾取作用域空间为当前层级子节点
    coreEvent.on('CORE_LEVEL_CHANGE', (cur, pre) => {
      this.raycasterObjs = cur?.children || [];
      // this._transparentClear();
      // this._transparentEffect(this.curLevel);
    });
  }

  _transparentEffect(obj) {
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
      function (e) {
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
        //获取当前层级
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
  getDefaultScope(obj?: Array<any>): Array<THREE.Object3D> {
    const list = this._scene.children;
    let result = [];
    for (let i = 0; i < list.length; i++) {
      // let obj = list[i];
      // if (obj instanceof BaseObject3D) {
      //     result.push(obj);
      // }
    }
    if (obj) result = result.concat(obj);
    this.raycasterObjs = result;
    return result;
  }

  /**
   * 获取射线拾取信息
   * @param option 由于两个设定参数均为可选的，统一设定配置项
   * @returns 返回射线拾取全部对象
   */
  calculateSelection(option: { objects?: THREE.Object3D[] | null; selectObject?: THREE.Object3D }) {
    let { objects = this.raycasterObjs } = option;
    const { selectObject } = option;
    if (!Array.isArray(objects)) objects = [objects];
    this._raycaster.setFromCamera(this._mouse, this._camera);
    if (selectObject) {
      // 当前拾取范围内需要过滤的物体
      const objIndex = objects.indexOf(selectObject);
      if (objIndex !== -1) objects.splice(objIndex, 1);
    }
    const intersectObjects = this._raycaster.intersectObjects(objects, true);
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
  getPickedObject(objects = this.raycasterObjs): Object3DType {
    if (!Array.isArray(objects)) objects = [objects];
    let curSel = null;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    const intersectObjects = this._raycaster.intersectObjects(objects, true);

    //过滤掉所有不可见物体
    const filteredIntersectObjects = intersectObjects.filter(item => item.object.visible === true);

    if (!filteredIntersectObjects[0]) return null;
    const object = filteredIntersectObjects[0].object;

    const getPartObj = obj => {
      if (!obj.parent) return null;
      //从业务对象判断是否可以拾取 并且节点的父物体是根节点
      if (obj instanceof BaseObject3D) {
        if (obj.pickedEnable === true) {
          return obj;
        } else {
          return null;
        }
      } else {
        return getPartObj(obj.parent);
      }
    };
    curSel = getPartObj(object);

    return curSel;
  }

  /**
   * 设置射线远面
   * @param val {Number}
   */
  setRayCasterFar(val) {
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
    const target = this._getParentFromCurLevel(object);
    if (target) {
      // 触发物体级别事件
      target.emit('CLICK', target);
    }
    //判断当前是否为禁用鼠标状态
    if (this.pauseSelection) return;
    this.selected = target;
    coreEvent.dispatch('CORE_OBJECT_SELECTED', [target, 'single']);
  }

  /**
   * 鼠标右键单击效果
   * @returns void
   */
  private _pointUp(): void {
    if (!this.curLevel) return;
    // 限制层级回退根节点
    if (this.curLevel.parent === this._sceneRoot) return;
    //判断当前是否为禁用鼠标状态
    if (this.pauseLevelChange) return;
    this.selected = null;
    coreEvent.dispatch('CORE_OBJECT_SELECTED', [null, 'single']);

    const targetObj = this.curLevel.parent;
    if (targetObj) {
      // 触发层级变化事件
      this.preLevel = this.curLevel;
      this.curLevel = targetObj as Object3DType;
      coreEvent.dispatch('CORE_LEVEL_CHANGE', [
        this.curLevel,
        this.preLevel,
        this.pauseLevelChangeAnimation,
      ]);
    }
  }

  /**
   * 双击物体触发的层级切换效果效果
   * @date 2024/2/18 - 11:46:17
   *
   * @private
   * @param {(Object3DType | null)} object
   * @param {?boolean} [crossLevel] 是否为跨层级切换 默认获取当前层级父节点
   */
  private _dbClick(object: Object3DType | null, crossLevel?: boolean) {
    if (!object) object = this.getPickedObject();
    if (!object) return;
    // 触发物体级别事件
    object.emit('DBCLICK', object);
    //判断当前是否为禁用鼠标状态
    if (this.pauseLevelChange) return;
    //向上查找到当前根节点下的父节点
    let target;
    if (crossLevel) {
      target = object;
    } else {
      target = this._getParentFromCurLevel(object);
    }
    if (!target) return;
    this.preLevel = this.curLevel;
    this.curLevel = target;
    // 触发层级变化事件
    target.emit('CORE_LEVEL_CHANGE', target);
    coreEvent.dispatch('CORE_LEVEL_CHANGE', [
      this.curLevel,
      this.preLevel,
      this.pauseLevelChangeAnimation,
    ]);
  }

  _getParentFromCurLevel(object: Object3DType): Object3DType | null {
    let res;
    const loop = (obj: any) => {
      if (!obj || !obj.parent) return null;
      if (obj.parent === this.curLevel) {
        res = obj;
      } else {
        loop(obj.parent);
      }
    };
    loop(object);
    return res;
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
   * 设置当前选择层级
   * @date 2024/2/18 - 13:31:16
   *
   * @param {Object3DType} object
   * @param {?boolean} [crossLevel]
   * @returns {boolean}
   */
  setSceneLevel(object: Object3DType, crossLevel?: boolean) {
    if (!object || this.pauseSelection) return false;
    this._dbClick(object, crossLevel);
    return true;
  }

  /**
   * 获取当前场景层级
   * @returns
   */
  getSceneLevel(): Object3DType | null {
    return this.curLevel;
  }

  /**
   * 检测拾取坐标点位信息
   * @param state  开启状态  如果state为false会关闭时间并清空缓存点位
   * @param scope  限制拾取范围
   */
  detectPickPoints(state: boolean, scope: THREE.Object3D[] | null) {
    const _this = this;
    const func = (e: MouseEvent) => {
      const pickedMsg = _this.calculateSelection({ objects: scope });
      if (pickedMsg) {
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

  /**
   * 重置 释放引用内存地址
   */
  clear() {}
}

export const selectionTool = new SelectionTools();
