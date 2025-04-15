import * as THREE from 'three';

/**
 * 灯光方法类
 * @date 2024/1/9 - 09:55:28
 *
 * @class LightTool
 * @typedef {LightTool}
 */
class LightTool {
  public defaultOptions = {
    ambientColor: 0xffffff,
    directColor: 0xffffff,
    ambientIntensity: 0.5,
    directIntensity: 1,
  };
  public lightMap: {
    [type: string]: {
      [uuid: string]: THREE.Light;
    };
  } = {};

  public defaultAmbientLight: THREE.AmbientLight;
  public defaultHemisphereLight: THREE.HemisphereLight;
  public directionalLight1: THREE.DirectionalLight;
  public directionalLight2: THREE.DirectionalLight;
  public directionalLight3: THREE.DirectionalLight;

  private limit: number;
  private recoverShadowTimer: any;
  private shadowStatus: boolean;
  public scene: THREE.Scene | null;

  constructor() {
    this.limit = 20;
    this.shadowStatus = true;
    this._registEvent();
  }

  _registEvent() {}

  /**
   * 初始化灯光
   * @date 2024/1/9 - 09:55:52
   *
   * @param {THREE.Scene} scene
   */
  init(scene: THREE.Scene) {
    this.scene = scene;
    const { ambientColor, ambientIntensity } = this.defaultOptions;

    // 环境光
    this.defaultAmbientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    this.defaultAmbientLight.name = 'defaultAmbientLight';
    this.addLight(this.defaultAmbientLight);

    //半球光
    this.defaultHemisphereLight = new THREE.HemisphereLight('#FFFFFF', '#222222', 0.5);
    this.addLight(this.defaultHemisphereLight);

    //斜上方
    this.directionalLight1 = this.createDirectionalLight({
      name: 'directionLight1',
      position: [this.limit, this.limit, this.limit],
      allowShadow: false,
      bright: 0.5,
      color: '#FFFFFF',
    });
    this.addLight(this.directionalLight1);

    //后方
    this.directionalLight2 = this.createDirectionalLight({
      name: 'directionLight1',
      position: [0, this.limit, -this.limit],
      allowShadow: false,
      bright: 0.2,
      color: '#FFFFFF',
    });
    this.addLight(this.directionalLight2);
    //正前
    this.directionalLight3 = this.createDirectionalLight({
      name: 'directionLight1',
      position: [0, 0, this.limit],
      allowShadow: false,
      bright: 0.1,
      color: '#FFFFFF',
    });
    this.addLight(this.directionalLight1);
  }

  /**
   * 动态添加光源
   * @date 2024/1/9 - 09:56:55
   */
  addLight = (...light: Array<THREE.Light>) => {
    light.forEach(light => {
      this.scene.add(light);
      if (this.lightMap[light.type]) this.lightMap[light.type][light.uuid] = light;
      else {
        this.lightMap[light.type] = {};
        this.lightMap[light.type][light.uuid] = light;
      }
    });
  };

  /**
   * 调整平行光的阴影开闭
   * @date 2024/1/9 - 09:57:47
   */
  setLightCastShadow = (
    needCastShadow: boolean,
    light?: Array<string | THREE.DirectionalLight> | null,
    isRecover?: boolean
  ) => {
    const _this = this;
    const uuidMap = this.lightMap['DirectionalLight'];
    if (light && Array.isArray(light)) {
      light.forEach(lightSymbol => {
        if (typeof lightSymbol === 'string') uuidMap[lightSymbol].castShadow = needCastShadow;
        else lightSymbol.castShadow = needCastShadow;
      });
    } else {
      for (const uuid in uuidMap) {
        uuidMap[uuid].castShadow = needCastShadow;
      }
    }
    this.shadowStatus = needCastShadow;
    if (!isRecover) return;
    if (this.recoverShadowTimer) clearTimeout(this.recoverShadowTimer);
    this.recoverShadowTimer = setTimeout(() => {
      _this.setLightCastShadow(!_this.shadowStatus);
    }, 200);
  };

  /**
   * 更新shadow Map
   */
  updateShadow() {
    const uuidMap = this.lightMap.DirectionalLight;
    if (!uuidMap) return;
    for (const uuid in uuidMap) {
      const light = uuidMap[uuid];
      if (light.castShadow) light.shadow.needsUpdate = true;
    }
  }

  /**
   * 创建平行光的通用方法
   * @date 2024/1/9 - 09:54:38
   *
   * @param {{
   *         bright: number,
   *         position: number[],
   *         name: string,
   *         color: string,
   *         allowShadow
   *     }} options
   * @returns {*}
   */
  createDirectionalLight(options: {
    bright: number;
    position: number[];
    name: string;
    color: string;
    allowShadow;
  }) {
    const { bright, position, name, color, allowShadow = false } = options;

    const DirectionalLight = new THREE.DirectionalLight(color, bright);
    DirectionalLight.position.fromArray(position);

    // 如果该灯光允许产生阴影，则初始化shadow map相关属性，否则该相机永远不允许产生阴影
    if (allowShadow) {
      //光线保持来自x，y，z正方向，与xoz平面成40°角
      DirectionalLight.shadow.camera.left = -this.limit * Math.sqrt(2);
      DirectionalLight.shadow.camera.right = this.limit * Math.sqrt(2);
      DirectionalLight.shadow.camera.top = this.limit * Math.sqrt(2);
      DirectionalLight.shadow.camera.bottom = -this.limit * Math.sqrt(2);
      DirectionalLight.shadow.camera.far = this.limit * 2;
      DirectionalLight.shadow.camera.near = this.limit / 2;
      DirectionalLight.shadow.camera.updateProjectionMatrix();

      DirectionalLight.shadow.mapSize.width = 1024 * 4;
      DirectionalLight.shadow.mapSize.height = 1024 * 4;
      DirectionalLight.shadow.bias = -0.001;
      // DirectionalLight.shadow.normalBias = -0.0001;
      // DirectionalLight.shadow.radius = 1.5;//PCFSoftShadowMap这个参数无用

      DirectionalLight.shadow.autoUpdate = true;
      DirectionalLight.castShadow = allowShadow;
      DirectionalLight.userData.allowShadow = allowShadow;
    }
    // const helper = new THREE.DirectionalLightHelper(DirectionalLight, 5);
    // this.scene.add(helper);
    DirectionalLight.name = name;

    return DirectionalLight;
  }

  /**
   * @Description: 根据相机的阴影有效范围以及新的target位置，更改相机的位置与视锥大小，灯光的位置随视锥大小与相机控件中心变动
   * @param light {THREE.DirectionalLight}
   * @param limit {number} 相机视域的大小参数
   * @param target {THREE.Vector3} 相机的target的位置，为空表示zoom操作，无需改动target
   */
  setPositionAndShadowFrustum(light: THREE.DirectionalLight, limit: number, target: THREE.Vector3) {
    if (typeof limit !== 'number') return;
    if (light.type !== 'DirectionalLight') return;
    this.limit = limit;
    if (target) {
      //存在target,代表中键平移，改变了center与limit
      target.y = 0; //center必然在xoz平面上
      //修改目标位置，来保持光源方向
      light.target.position.copy(target);
      light.target.updateWorldMatrix(false, false); //如果target被加到了场景里，就不需要手动去updateWorldMatrix
    } else {
      //中键滚动，将target作为计算光源位置的相对中心
      target = new THREE.Vector3().copy(light.target.position);
    }
    //计算新的光源位置：光线方向固定(与xoz成45°角，来自xyz正方向)，在targetPos的基础上，加上根据limit算出
    light.position.set(limit / 2 + target.x, (Math.sqrt(2) * limit) / 2, limit / 2 + target.z);
    //修改视锥
    light.shadow.camera.left = -this.limit * Math.sqrt(2);
    light.shadow.camera.right = this.limit * Math.sqrt(2);
    light.shadow.camera.top = this.limit * Math.sqrt(2);
    light.shadow.camera.bottom = -this.limit * Math.sqrt(2);
    light.shadow.camera.far = this.limit * 2;
    light.shadow.camera.near = this.limit / 2;
    light.shadow.camera.updateProjectionMatrix();
  }

  /**
   * @Description: 根据相机参数调整灯光的位置
   */
  setShadowLimit() {
    // const center = cameraTool.center.clone();
    // const distance = cameraTool.center.distanceTo(cameraTool.camera.position);
    // //num即为相机中心与相机位置的distance，双击物体为20，初始视角为60，滚轮最大为4000，在滚轮最大下中键平移为4400,num范围60-4000对应limit为160-2000
    // if (typeof distance !== 'number') return;
    // const newLimit = distance / 2 + 32;  //根据上述对应关系计算limit,因为改小了map size，这个也缩小一倍 增强阴影效果 不过边缘区域的阴影丢失也会强一倍
    // const map = this.lightMap.DirectionalLight;
    // for (const cur in map) {
    //     const light = map[cur];
    //     if (light.userData.allowShadow) this.setPositionAndShadowFrustum(light as THREE.DirectionalLight, newLimit, center);
    // }
  }

  /**
   * 显示灯光辅助工具
   * @date 2024/1/9 - 09:39:09
   *
   * @param {THREE.Light} light
   * @returns {THREE.DirectionalLightHelper | THREE.HemisphereLightHelper | null}
   */
  showHelper(light: THREE.Light) {
    let helper = null;
    if (light.userData.helper) {
      this.scene.add(light.userData.helper);
    } else {
      if (light instanceof THREE.DirectionalLight) {
        helper = light.userData.helper = new THREE.DirectionalLightHelper(light, 5);
      }
      if (light instanceof THREE.HemisphereLight) {
        helper = light.userData.helper = new THREE.HemisphereLightHelper(light, 5);
      }
      helper && this.scene.add(helper);
    }
    return helper;
  }

  /**
   * 隐藏灯光辅助工具
   * @date 2024/1/9 - 09:39:09
   *
   * @param {THREE.Light} light
   */
  hideHelper(light: THREE.Light) {
    if (!light.userData.helper) return;
    this.scene.remove(light.userData.helper);
  }

  /**
   * 根据当前物体适配平行光位置
   * @date 2024/1/9 - 13:30:39
   *
   * @param {THREE.Object3D} object
   */
  autoFitPosition(object: THREE.Object3D) {
    const box3 = new THREE.Box3().setFromObject(object || this.scene); //新的包围盒逻辑
    const center = box3.getCenter(new THREE.Vector3());

    const size = box3.getSize(new THREE.Vector3());
    const radius = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2)) / 2;
    if (radius > this.limit) {
      this.directionalLight1.position.set(radius, radius, radius);
      this.directionalLight2.position.set(0, radius, -radius);
      this.directionalLight3.position.set(0, 0, radius);
    }
    this.directionalLight1.target.position.copy(center);
    this.directionalLight2.target.position.copy(center);
    this.directionalLight3.target.position.copy(center);
  }
}

export const lightTool = new LightTool();
