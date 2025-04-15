import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { coreEvent } from '../../managers/eventManager';
import * as TWEEN from '@tweenjs/tween.js';
import { BaseObject3D } from '../../objects/BaseObject3D';
import { animationManager } from '../../managers/animationManager';

// 定义回调函数类型
type Func = () => void;

/**
 * TODO
 * 1、围绕物体旋转
 * 2、视角漫游
 * 3、飞向物体最佳视角（以实现）
 */

/**
 * 摄影机的工具类
 */
class CameraTool {
  public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  public center: THREE.Vector3 = new THREE.Vector3();
  private _perspectiveCamera: THREE.PerspectiveCamera;
  private _orthographicCamera: THREE.OrthographicCamera;
  private readonly _defaultParam: {
    canvasWidth: number;
    far: number;
    near: number;
    position: THREE.Vector3;
    fov: number;
    canvasHeight: number;
  };
  private _width: number;
  private _height: number;
  private delta: THREE.Vector3;
  private box: THREE.Box3;
  private sphere: THREE.Sphere;
  private vector3: THREE.Vector3;
  public orbitControl!: OrbitControls;
  private defaultOrbitPitch: number;
  private defaultOrbitYaw: number;
  private defaultOrbitRadiusFac: number;
  // 计算飞行视角的倍率
  public viewAngleCalRatio: THREE.Vector3;
  constructor() {
    this._defaultParam = {
      near: 0.1,
      far: 2000,
      fov: 30,
      canvasWidth: 2560,
      canvasHeight: 1280,
      position: new THREE.Vector3(-200, 45, 120),
    };
    this.viewAngleCalRatio = new THREE.Vector3(3, 2, 3);
    this.defaultOrbitPitch = 30;
    this.defaultOrbitYaw = 45;
    this.defaultOrbitRadiusFac = 1;

    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._perspectiveCamera = new THREE.PerspectiveCamera();
    this._orthographicCamera = new THREE.OrthographicCamera();
    this.camera = this._perspectiveCamera;
    //用于计算
    this.delta = new THREE.Vector3();
    //用于包围盒相关计算
    this.box = new THREE.Box3();
    this.sphere = new THREE.Sphere();
    this.vector3 = new THREE.Vector3();
    //摄影机相关事件注册
    this._initCameraEvent();
  }

  /**
   * 初始化摄影机
   * 同时创建正交相机和透视相机对象  默认返回透视相机
   * @param canvas 渲染画布
   */
  initCamera(canvas: HTMLCanvasElement) {
    // 创建透视相机
    const perspectiveCamera = new THREE.PerspectiveCamera(
      this._defaultParam.fov,
      canvas.width / canvas.height,
      this._defaultParam.near,
      this._defaultParam.far
    );

    perspectiveCamera.position.copy(this._defaultParam.position);
    perspectiveCamera.lookAt(new THREE.Vector3());
    this._perspectiveCamera = perspectiveCamera;

    // 创建正交相机
    const orthographicCamera = new THREE.OrthographicCamera(
      -canvas.width * 0.5,
      canvas.width * 0.5,
      canvas.height * 0.5,
      -canvas.height * 0.5,
      this._defaultParam.near,
      this._defaultParam.far
    );

    orthographicCamera.position.copy(this._defaultParam.position);
    orthographicCamera.lookAt(new THREE.Vector3());
    this._orthographicCamera = orthographicCamera;
    //default
    this.camera = perspectiveCamera;
    //更新尺寸信息
    this._width = canvas.width;
    this._height = canvas.height;

    return this.camera;
  }

  /**
   * 切换内置相机
   * @param type 'perspective' | 'orthographic'
   * @param orthographicCameraPos
   * @param center
   */
  switchCamera(
    type: 'perspective' | 'orthographic',
    center: THREE.Vector3,
    orthographicCameraPos?: THREE.Vector3
  ) {
    switch (type) {
      case 'perspective':
        if (this.camera !== this._perspectiveCamera) {
          this.camera = this._perspectiveCamera;
          this.syncFarPlane(this._orthographicCamera, this._perspectiveCamera, center);
        }
        break;
      case 'orthographic':
        if (this.camera !== this._orthographicCamera) {
          this.camera = this._orthographicCamera;
          this.handleCamera();
          //根据传入的位置信息设置位置
          if (orthographicCameraPos) this.setPosition(orthographicCameraPos);
          this.syncFarPlane(this._perspectiveCamera, this._orthographicCamera, center);
        }
        break;

      default:
        break;
    }
  }

  /**
   * 使用远截面大小一致的方式得到同步的图像
   * @param origin
   * @param target
   * @param center
   */
  syncFarPlane(
    origin: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    target: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    center: THREE.Vector3
  ) {
    if (origin instanceof THREE.PerspectiveCamera) {
      const distance = origin.position.distanceTo(center);
      const tanAlpha = Math.tan((Math.PI * origin.fov) / 360);
      const height = tanAlpha * distance * 2;
      if (target instanceof THREE.OrthographicCamera) {
        target.zoom = (target.top - target.bottom) / height;
      }
    } else if (origin instanceof THREE.OrthographicCamera && target instanceof THREE.PerspectiveCamera) {
      const tanAlpha = Math.tan((Math.PI * target.fov) / 360);
      const distance = origin.top / (origin.zoom * tanAlpha);
      const normalizedVec = target.position.clone().sub(center).normalize();
      const position = normalizedVec.multiplyScalar(distance);
      target.position.copy(position);
    }
    target.updateProjectionMatrix();
    target.updateMatrixWorld();
  }

  /**
   * 根据传入的长宽更新相机比例或尺寸
   * @param width
   * @param height
   */
  handleCamera = (width?: number, height?: number) => {
    if (!width) width = this._width;
    if (!height) height = this._height;
    if ((this.camera as THREE.PerspectiveCamera).isPerspectiveCamera)
      //透视
      (this.camera as THREE.PerspectiveCamera).aspect = width / height;
    else {
      const camera = this.camera as THREE.OrthographicCamera;
      //正交
      camera.left = ~(width >> 1) + 1;
      camera.right = width >> 1;
      camera.top = height >> 1;
      camera.bottom = ~(height >> 1) + 1;
    }
    this.camera.updateProjectionMatrix();
  };

  /**
   * 对摄影机位置进行复位
   */
  restore() {
    this.setPosition(this._defaultParam.position);
    this.camera.lookAt(new THREE.Vector3());
  }

  /**
   * 设置摄影机位置
   * @param pos
   */
  setPosition(pos: THREE.Vector3) {
    this.camera.position.copy(pos);
  }

  /**
   * 获取摄影机位置
   */
  getPosition(): THREE.Vector3 {
    return new THREE.Vector3().copy(this.camera.position);
  }

  /**
   * 设置摄影机看点信息
   * @param obj
   */
  lookAt(obj: THREE.Object3D) {
    this.camera.lookAt(obj.position);
  }

  /**
   * 设置近截面
   * @param dis
   */
  setNear(dis: number) {
    this.camera.near = dis;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 设置相机的远距
   * @param dis
   */
  setFar(dis: number) {
    this.camera.far = dis;
    this.orbitControl.maxDistance = dis;
    this.orbitControl.maxZoom = dis;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 设置摄影机的缩放倍数
   * @param zoom
   */
  setZoom(zoom: number) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  /**
   * 更新相机视窗比
   * @param dom
   */
  updateAspectRatio(dom: HTMLElement) {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = dom.clientWidth / dom.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }
  initControl(domContainer: HTMLElement) {
    //实例化一个交互控件
    if (this.orbitControl) return;
    this.orbitControl = new OrbitControls(this.camera, domContainer);
    // an animation loop is required when either damping or auto-rotation are enabled
    this.orbitControl.enableDamping = true;
    this.orbitControl.dampingFactor = 0.05;

    this.orbitControl.screenSpacePanning = false;
    this.orbitControl.maxPolarAngle = Math.PI / 2;
    // this.orbitControl.autoRotate = true
  }

  /**
   * 根据摄影机信息飞行
   * @param info
   * @returns
   */
  flyWithCameraInfo(info: {
    position: number[];
    target: number[];
    time?: number;
    callback?: Func;
  }): void {
    const { position, target, time, callback } = info;

    if (!time) {
      this.camera.position.fromArray(position);
      // 更新控制器中心点
      this.orbitControl.target.fromArray(target);
      this.orbitControl.update();
      callback && callback();
      return;
    }
    const curPos = this.camera.position.toArray();
    const tween = animationManager.createTween({
      startValue: curPos,
      endValue: position,
      animationType: TWEEN.Easing.Quadratic.InOut,
      name: 'flyWithCameraInfo Animation',
      repeat: 0,
      time,
      callback: object => {
        this.camera.position.fromArray(object);
        // 更新控制器中心点
        this.orbitControl.target.fromArray(target);
        this.orbitControl.update();
      },
      completeCallback: callback,
    });
    tween.start();
  }

  /**
   * 获取当前摄影机信息
   * @returns
   */
  getCameraInfo(): {
    position: number[];
    target: number[];
  } {
    return {
      position: this.camera.position.toArray(),
      target: this.orbitControl.target.toArray(),
    };
  }

  /**
   * 摄影机飞到物体
   */
  flyTo(
    object: BaseObject3D,
    options: {
      time?: number;
      callback?: Func;
    } = {}
  ) {
    if (!object) return;
    const { time, callback } = options;
    const tarPos = this.calcBestVisualAngle(object);
    const aabb = object.getWorldAABB();

    this.flyWithCameraInfo({
      position: tarPos,
      target: aabb.center,
      time,
      callback,
    });
  }

  /**
   * 计算物体最佳视角
   * @param object
   * @param radius: 角度
   * @returns
   */
  calcBestVisualAngle(
    object: BaseObject3D,
    options: {
      radius?: number;
      scale?: number[];
    } = {}
  ) {
    const { radius, scale = [1, 1, 1] } = options;
    //计算和世界轴对齐的一个对象 Object3D （含其子对象）的包围盒
    this.box.makeEmpty();
    this.box.expandByObject(object);

    this.box.getCenter(this.center);
    const distance = this.box.getBoundingSphere(this.sphere).radius;

    // TODO 目标方向和缩放倍数通过参数传入
    if (radius) {
      this.delta.set(
        Math.cos((radius * Math.PI) / 180) * scale[0],
        scale[1],
        Math.sin((radius * Math.PI) / 180) * scale[2]
      );
      // console.log(this.delta);
    } else {
      this.delta.copy(this.viewAngleCalRatio);
    }
    //乘上相机的旋转矩阵（使用四元数效率更高）
    // this.delta.applyQuaternion(this.camera.quaternion);
    //摄影机距离物体包围球半径的位置
    this.delta.multiplyScalar(distance * this.defaultOrbitRadiusFac);
    const tarPos = this.center.add(this.delta).toArray();

    return tarPos;
  }

  /**
   *
   * @param object
   */
  flyAround(
    object: BaseObject3D | null,
    options: {
      speed: number;
      clockwise: boolean;
      scale: number[];
    }
  ) {
    if (!object) {
      animationManager.remove('Shield_Rotation_Animation');
      return;
    }
    const { speed, clockwise, scale = [1.5, 0.5, 1.5] } = options;
    // 判断是否接收物体对象  无物体则围绕场景中心
    const aabb = object.getWorldAABB();
    let angle = 0;
    const _this = this;
    const animation = (time: number) => {
      if (Math.abs(angle) >= 360) {
        angle = 0;
      }
      {
        clockwise ? (angle += speed) : (angle -= speed);
      }
      const tarPos = _this.calcBestVisualAngle(object, {
        radius: angle,
        scale,
      });
      this.camera.position.fromArray(tarPos);
      // 更新控制器中心点
      this.orbitControl.target.fromArray(aabb.center);
      this.orbitControl.update();
    };
    animationManager.create('Shield_Rotation_Animation', animation);
  }

  private _initCameraEvent() {
    coreEvent.on('CORE_LEVEL_CHANGE', (curLevel, preLevel, noFlight) => {
      if (noFlight) return;
      this.flyTo(curLevel, {
        time: 2000,
        callback: () => {
          // 飞行结束
        },
      });
    });
  }

  updatePosition(position: number[]) {
    this.camera.position.fromArray(position);
    this.orbitControl.update();
  }

  /**
   * viewAngleCalRatio
   * 设置最佳视角计算的默认缩放倍率
   * @param ratio
   */
  setViewAngleCalRatio(ratio: number[]) {
    this.viewAngleCalRatio.set(ratio[0], ratio[1], ratio[2]);
  }
}

export const cameraTool = new CameraTool();
