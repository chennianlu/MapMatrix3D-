import * as THREE from 'three';
import { toFixed, isFunction } from '../util';
import { loader } from '../tools/loader';
import { renderTool } from '../tools/renderTool';
import { LAYOUT_X, LAYOUT_Y, LAYOUT_Z } from '../constants';
import { ObjectEventType } from '../managers/eventManager/core/defines';

export type BaseInitOptions = {
  // parent?: BaseObject3D | THREE.Scene;
  pickedEnable?: boolean;
  bloom?: boolean;
  name?: string;
  url?: string;
  path?: string;
  position?: number[];
  scale?: number[];
  angle?: number[];
  parent?: any;
  layout?: {
    rule?: number[];
    offset?: number[];
  };
};

type LayoutCell = 1 | 2 | 3;
export type XYZLayout = [LayoutCell, LayoutCell, LayoutCell];

export interface Layout {
  rule: XYZLayout;
  offset?: [number, number, number];
}

interface ExMaterial extends THREE.MeshBasicMaterial {
  uniforms?: any;
  color: THREE.Color;
}
/**
 * @class BaseObject3D
 * @desc 3D物体基类
 * @date 2022-12-20
 */
export class BaseObject3D extends THREE.Object3D {
  public material: ExMaterial; // TODO 暂时不考虑多材质
  public override readonly type: string = 'Base';
  public url: string | undefined;
  public aabb: null | AABB;
  public loadStatus: boolean;
  public appKey: number | string | null; //用来绑定业务主键,默认用自身的uuid
  private _listeners: any;
  private _pickedEnable: boolean;
  public _model: THREE.Object3D; //绑定模型节点
  public bloomStatus: boolean;
  public overrideColor: string | null;
  public overrideOpacity: number;
  declare children: Array<BaseObject3D | THREE.Object3D>;
  public lockedStatus: boolean; // 物体在编辑模式下锁定状态

  constructor(options: BaseInitOptions = {}) {
    super();
    this._pickedEnable = true;
    this.loadStatus = false;
    this.lockedStatus = false;
    this.name = options?.name || 'default';
    this.appKey = this.id;
    this._model = null;
    this.overrideColor = null;
    this.overrideOpacity = 1;
    this.bloomStatus = false;
    const pickedEnable = options?.pickedEnable;
    if (pickedEnable !== undefined) {
      this.pickedEnable = pickedEnable;
    }
  }

  set pickedEnable(enable: boolean) {
    //@ts-ignore
    this.traverse(cur => (cur._pickedEnable = enable));
  }

  get pickedEnable() {
    return this._pickedEnable;
  }

  public async init(options: BaseInitOptions) {
    //初始化URL
    if (options.url) await this.loadURL(options);
    return this;
  }

  /**
   * 对物体进行模型加载
   * @param url
   */
  async loadURL(params: BaseInitOptions): Promise<any> {
    const { url, path } = params;
    return new Promise((resolve, reject) => {
      loader
        .loadGLTF(url, path)
        .then(model => {
          this.position.copy(model.position);
          // 挂在模型到自身node下面
          this.attach(model as THREE.Group);
          this._model = model;
        })
        .catch(error => {
          // 加载失败  dosomething
          console.log('模型加载失败' + path + url);
          reject();
        })
        .finally(() => {
          //初始化结束
          this.loadStatus = true;
          resolve(true);
        });
    });
  }

  /**
   * 设置物体位置的统一入口
   */
  public setPosition(pos: Array<number> | THREE.Vector3) {
    let vector = new THREE.Vector3(0, 0, 0);
    if (Array.isArray(pos)) {
      vector.set(pos[0], pos[1], pos[2]);
    } else if (pos.isVector3) {
      vector = pos.clone();
    }
    // if (this.parent) {
    //     vector = vector.addVectors(this.parent.position, vector);
    // }
    this.position.copy(vector);
    // this.parent && this.parent.updateMatrixWorld();
  }

  /**
   * 设置物体位置的统一入口
   */
  public setWorldPosition(pos: Array<number> | THREE.Vector3) {
    let vector = new THREE.Vector3(0, 0, 0);
    if (Array.isArray(pos)) {
      vector.set(pos[0], pos[1], pos[2]);
    } else if (pos.isVector3) {
      vector = pos.clone();
    }
    if (this.parent) vector = this.parent.worldToLocal(vector.clone());
    this.position.copy(vector);
    // this.parent && this.parent.updateMatrixWorld();
  }

  /**
   * 设置物体位置的统一入口
   */
  public _getWorldPosition(): number[] {
    const tem = this.getWorldPosition(new THREE.Vector3(0, 0, 0));
    return [tem.x, tem.y, tem.z];
  }

  public convertWorldToLocalPosition(pos: THREE.Vector3 | Array<any>) {
    let vec;
    if (pos instanceof THREE.Vector3) {
      vec = pos.clone();
    } else {
      vec = new THREE.Vector3(pos[0], pos[1], pos[2]);
    }

    const resultPos = this.worldToLocal(vec);
    return [resultPos.x, resultPos.y, resultPos.z];
  }

  public convertLocalToWorldPosition(pos: THREE.Vector3 | Array<any>) {
    let vec;
    if (pos instanceof THREE.Vector3) {
      vec = pos.clone();
    } else {
      vec = new THREE.Vector3(pos[0], pos[1], pos[2]);
    }

    const resultPos = this.localToWorld(vec);
    return [resultPos.x, resultPos.y, resultPos.z];
  }

  /**
   * 设置相对父节点偏移坐标信息
   * 始终是相对包围盒设置偏移量而不是相对于父节点自身原点！！！
   * @param layout
   * @returns
   */
  setLayoutPosition(layout: Layout) {
    const pos = this._calcuteLayout(layout);
    this.setPosition(pos as number[]);
  }

  /**
   * 获取相对父节点偏移坐标信息
   * @param layout
   */
  getLayoutPosition(layout: Layout): number[] | void {
    return this._calcuteLayout(layout);
  }

  /**
   * 计算相对偏移量
   * 这里有一个概念：相对空间：自身坐标空间、相对父物体坐标空间  相对世界坐标空间
   * @param layout
   * @returns
   */
  _calcuteLayout(layout: Layout): number[] | void {
    if (this.parent instanceof THREE.Scene) {
      console.error('Parent node cannot be scene');
      return;
    }
    const parent = this.parent as BaseObject3D;
    if (!parent) return;
    const { rule, offset } = layout;
    // TODO  不合理  loader加一个表标识判断初始化状态 后续优化
    parent.remove(this);
    const { center, width, height, depth } = parent.aabb || parent.getSelfAABB();
    const sefAABB = this.aabb || this.getWorldAABB();
    parent.add(this);

    const resPos = [...center]; //世界坐标
    if (rule[0] === LAYOUT_X.LEFT) resPos[0] = center[0] - width / 2 - sefAABB.width / 2;
    if (rule[0] === LAYOUT_X.RIGHT) resPos[0] = center[0] + width / 2 + sefAABB.width / 2;
    if (offset && typeof offset[0] === 'number') resPos[0] += offset[0];

    if (rule[1] === LAYOUT_Y.TOP) resPos[1] = center[1] + height / 2 + sefAABB.height / 2;
    if (rule[1] === LAYOUT_Y.BOTTOM) resPos[1] = center[1] - height / 2 - sefAABB.height / 2;
    if (offset && typeof offset[1] === 'number') resPos[1] += offset[1];

    if (rule[2] === LAYOUT_Z.FRONT) resPos[2] = center[2] + depth / 2 + sefAABB.depth / 2;
    if (rule[2] === LAYOUT_Z.BACK) resPos[2] = center[2] - depth / 2 - sefAABB.depth / 2;
    if (offset && typeof offset[2] === 'number') resPos[2] += offset[2];
    const v3 = new THREE.Vector3(...resPos);
    //转化为相对父节点的坐标
    this.parent.worldToLocal(v3);
    return v3.toArray() as number[];
  }

  /**
   * 沿着指定位置平移
   * @param pos
   */
  translate(pos: Array<number>) {
    this.translateX(pos[0]);
    this.translateY(pos[1]);
    this.translateZ(pos[2]);
  }

  /**
   * 设置物体缩放的统一入口
   */
  public setScale(scale: Array<number> | THREE.Vector3) {
    let vector = new THREE.Vector3(0, 0, 0);
    if (Array.isArray(scale)) {
      vector.set(scale[0], scale[1], scale[2]);
    } else if (scale.isVector3) {
      vector = scale.clone();
    }
    this.scale.copy(vector);
  }

  /**
   * 设置物体尺寸
   * @param size 国际单位制米
   * @param axis 缩放的轴向
   * @returns
   */
  setSize(size: number, axis: 'x' | 'y' | 'z') {
    const obb = this.getOBB();
    let ratio = 0;
    const sourceScale = this.scale.toArray();

    switch (axis) {
      case 'x':
        ratio = size / obb.width;
        sourceScale[0] *= ratio;
        break;
      case 'y':
        ratio = size / obb.height;
        sourceScale[1] *= ratio;
        break;
      case 'z':
        ratio = size / obb.depth;
        sourceScale[2] *= ratio;
        break;

      default:
        break;
    }
    this.setScale(sourceScale);
  }

  /**
   * 根据不同表达类型设置物体旋转
   * @param type radians | degrees | quaternion
   * @param value {Array<number>}
   */
  public setRotation(
    value: number[] | THREE.Quaternion,
    type: 'radians' | 'degrees' | 'quaternion' = 'radians'
  ) {
    let euler;
    switch (type) {
      case 'radians':
        //弧度
        euler = new THREE.Euler(...value);
        // this.quaternion.copy(new THREE.Quaternion().setFromEuler(euler));
        this.rotation.copy(euler);
        break;
      case 'degrees':
        //角度
        if (Array.isArray(value)) {
          euler = new THREE.Euler(
            THREE.MathUtils.degToRad(value[0]),
            THREE.MathUtils.degToRad(value[1]),
            THREE.MathUtils.degToRad(value[2])
          );
          // this.quaternion.setFromEuler(euler)
          this.rotation.copy(euler);
        }
        break;
      case 'quaternion':
        if (value instanceof THREE.Quaternion) {
          this.quaternion.copy(value);
        }
        break;
    }
  }

  /**
   * 获取旋转角度信息
   * @return {[number, number, number]} 0-360
   */
  public getRotation() {
    const rotationArr = this.rotation.toArray();
    rotationArr.pop();
    rotationArr.map((val, index, arr) => {
      arr[index] = THREE.MathUtils.radToDeg(val as number);
    });
    return rotationArr;
  }

  private _parseBoundingBox2AABB(box3: THREE.Box3) {
    const center = box3.getCenter(new THREE.Vector3());
    if (!center.x && !center.y && !center.z) {
      center.x = 0;
      center.y = 0;
      center.z = 0;
    }
    const size = box3.getSize(new THREE.Vector3());
    return {
      center: [center.x, center.y, center.z],
      radius: Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2)) / 2,
      width: toFixed(size.x, 2),
      height: toFixed(size.y, 2),
      depth: toFixed(size.z, 2),
    };
  }

  // TODO 计算包围盒的时候选择忽略子节点
  public getWorldAABB() {
    const box3 = new THREE.Box3().setFromObject(this); //新的包围盒逻辑
    return this._parseBoundingBox2AABB(box3);
  }

  /**
   * 获取相对自身包围盒AABB
   * @returns
   */
  public getSelfAABB() {
    const calNode = this._model;
    // const tmpRotation = this.rotation.clone();
    // this.rotation.fromArray([0, 0, 0, 'XYZ']);
    const box3 = new THREE.Box3().setFromObject(calNode); //新的包围盒逻辑
    // this.rotation.copy(tmpRotation);
    return this._parseBoundingBox2AABB(box3);
  }

  /**
   * 有向包围盒OBB
   * @returns
   */
  public getOBB() {
    const calNode = this._model;
    const tmpRotation = this.rotation.clone();
    this.rotation.fromArray([0, 0, 0, 'XYZ']);
    const box3 = new THREE.Box3().setFromObject(this); //新的包围盒逻辑
    this.rotation.copy(tmpRotation);
    return this._parseBoundingBox2AABB(box3);
  }

  /**
   * 设置物体偏航角Y
   * @param degree
   */
  yaw(degree) {
    let radians = degree / 180;
    radians = radians * Math.PI;
    this.rotateY(radians);
  }

  /**
   * 设置物体俯仰角Z
   * @param degree
   */
  pitch(degree) {
    let radians = degree / 180;
    radians = radians * Math.PI;
    this.rotateZ(radians);
  }

  /**
   * 设置物体横滚角X
   * @param degree
   */
  roll(degree) {
    let radians = degree / 180;
    radians = radians * Math.PI;
    this.rotateX(radians);
  }

  /**
   * 设置物体朝向
   * @param v
   * @param type
   */
  setDirection(v: number[], type: number) {
    const up = new THREE.Vector3(v[0], v[1], v[2]);

    if (type == 2) {
      //转换成世界的direction
      const orgin = new THREE.Vector3();
      this.getWorldDirection(orgin);

      orgin.set(0, 0, 1);

      const dir = this.worldToLocal(up);
      const o = this.worldToLocal(new THREE.Vector3(0, 0, 0));
      const r = dir.sub(o);
      r.normalize();
      const quaternion = new THREE.Quaternion();

      quaternion.setFromUnitVectors(orgin, r);
      quaternion.normalize();

      this.setRotationFromQuaternion(quaternion);
      //
    } else {
      this.localToWorld(up);
      // up.applyMatrix4(this.matrix);
      // this.parent.worldToLocal(up);
      this.lookAt(up);
    }
  }

  /**
   * 设置物体辉光
   * @param bool
   */
  setBloomEffect(bool) {
    if (bool) {
      this.traverse((cur: any) => {
        if (cur.type === 'Mesh' || cur.type === 'MeshObject3D') {
          renderTool.bloomEffect.selection.add(cur);
        }
      });
    } else {
      this.traverse((cur: any) => {
        if (cur.type === 'Mesh' || cur.type === 'MeshObject3D') {
          renderTool.bloomEffect.selection.delete(cur);
        }
      });
    }
    this.bloomStatus = bool;
  }

  /**
   * proxy `addEventListener` function
   *
   * @param {String} type event type, evnet name
   * @param {Function} fn callback
   * @return {this} this
   */
  on(eventType: ObjectEventType, func: Func): BaseObject3D {
    if (!isFunction(func)) return this;
    this.pickedEnable = true;
    this.addEventListener(eventType, func);
    return this;
  }

  /**
   * proxy `removeEventListener` function
   *
   * @param {String} type event type, evnet name
   * @param {Function} fn callback, which you had bind before
   * @return {this} this
   */
  off(eventType: ObjectEventType, func: Func): BaseObject3D {
    this.removeEventListener(eventType, func);
    return this;
  }

  /**
   * binding a once event, just emit once time
   *
   * @param {String} type event type, evnet name
   * @param {Function} fn callback
   * @return {this} this
   */
  once(eventType: ObjectEventType, func: Func): BaseObject3D {
    if (!isFunction(func)) return this;
    const cb = ev => {
      func(ev);
      this.off(eventType, cb);
    };
    this.on(eventType, cb);
    return this;
  }

  /**
   * emit a event
   *
   * @param {String} type event type, evnet name
   * @return {this} this
   */
  emit(eventType: ObjectEventType, ...argument) {
    if (!this._listeners || !this._listeners[eventType]) return this;
    const cbs = this._listeners[eventType] || [];
    const cache = cbs.slice(0);

    for (let i = 0; i < cache.length; i++) {
      cache[i].apply(this, argument);
    }
    return this;
  }

  /**
   * 设置物体显示，默认递归子节点
   * @param visible
   */
  show(deep: boolean = true) {
    if (this._model) {
      this._model.traverse(cur => (cur.visible = true));
    }
    if (deep) {
      this.visible = true;
      this.traverse(cur => (cur.visible = true));
    }
  }

  /**
   * 设置物体隐藏，默认递归子节点
   * @param visible
   */
  hide(deep: boolean = true) {
    if (this._model) {
      this._model.traverse(cur => (cur.visible = false));
    }
    if (deep) {
      this.visible = true;
      this.traverse(cur => (cur.visible = false));
    }
  }

  /**
   * 设置物体颜色
   * @param color
   */
  setColor(color: string | null, deep?: boolean) {
    let resolveNode = this._model;
    if (deep) resolveNode = this;
    if (!resolveNode) return;
    resolveNode.traverse(cur => {
      if ((cur as BaseObject3D).material) {
        if (color) {
          (cur as BaseObject3D).material.color = new THREE.Color(color);
        } else {
          (cur as BaseObject3D).material.color = new THREE.Color();
        }
      }
    });
    this.overrideColor = color;
  }

  /**
   * 设置物体透明度
   * @param opacity
   * @param deep
   */
  setOpacity(opacity: number, deep?: boolean) {
    let resolveNode = this._model;
    if (deep) resolveNode = this;
    if (!resolveNode) return;
    resolveNode.traverse(cur => {
      if ((cur as BaseObject3D).material) {
        const cloneMat = (cur as BaseObject3D).material.clone();
        cloneMat.opacity = opacity;
        if (opacity === 1) {
          // (cur as BaseObject3D).material.transparent = false;
          cloneMat.depthWrite = true;
        } else {
          cloneMat.transparent = true;
          cloneMat.depthWrite = false;
        }
        //对于精灵深度检测始终关闭
        if (cur.type === 'Sprite') {
          cloneMat.depthWrite = false;
        }
        (cur as BaseObject3D).material = cloneMat;
        cloneMat.needsUpdate = true;
      }
    });

    this.overrideOpacity = opacity;
  }

  /**
   * 设置物体线框显示隐藏
   * @date 2024/1/31 - 09:27:48
   *
   * @param {boolean} isShow
   */
  setWireframeVisible(isShow: boolean) {
    this.traverse(cur => {
      if ((cur as BaseObject3D).material) {
        (cur as BaseObject3D).material.wireframe = isShow;
        (cur as BaseObject3D).material.needsUpdate = true;
      }
    });
  }

  /**
   * 获取物体的三角面和顶点信息
   * @date 2024/2/4 - 12:27:32
   *
   * @returns {{ triangles: number; vertices: number; }}
   */
  getTriangleInfo() {
    const info = {
      triangles: 0,
      vertices: 0,
    };

    this.traverse(cur => {
      if ((cur as THREE.Mesh).geometry) {
        info.triangles += (cur as THREE.Mesh).geometry.attributes.position?.count || 0;
        info.vertices += (cur as THREE.Mesh).geometry.index?.count / 3 || 0;
      }
    });

    return info;
  }
}
