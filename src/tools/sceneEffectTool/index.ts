import * as THREE from 'three';
import { loader } from '../loader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type BackgroundType = 'color' | 'image' | '360Image' | 'skyBox';

/**
 * 对场景效果修改操作
 * 设置背景、雾化等
 */
class SceneEffectTools {
  private _scene: THREE.Scene;
  private _renderer: THREE.WebGLRenderer;
  private _pmremGenerator: THREE.PMREMGenerator;
  constructor() {
    if (new.target !== SceneEffectTools) {
      return;
    }
    if (!SceneEffectTools._instance) {
      SceneEffectTools._instance = this;
      // 这里添加构造函数属性
    }
    return SceneEffectTools._instance;
  }

  static _instance: SceneEffectTools;

  init(system: { scene: THREE.Scene; renderer: THREE.WebGLRenderer }) {
    this._scene = system.scene;
    this._renderer = system.renderer;
  }

  initDefaultEnv() {
    //辐射环境贴图(PMREM) 允许根据材料粗糙度快速访问不同级别的模糊
    //https://threejs.org/docs/index.html#api/zh/extras/PMREMGenerator
    this._pmremGenerator = new THREE.PMREMGenerator(this._renderer);
    this._pmremGenerator.compileEquirectangularShader();
    const envTexture = this._pmremGenerator.fromScene(new RoomEnvironment()).texture;
    this._scene.environment = envTexture;
  }

  /**
   * 设置场景背景效果
   * @param type
   * @param resources
   * 全景图(hdri) 与 立方体贴图(cubemap) 互转
   * 在线地址：https://matheowis.github.io/HDRI-to-CubeMap/
   * 项目源码：https://github.com/aunyks/hdri-to-cubemap
   */
  setBackground(options: {
    type: BackgroundType;
    color?: string | number;
    url?: string;
    isEnv?: boolean;
    isBackground?: boolean;
  }) {
    const { type, color, url, isEnv, isBackground = true } = options;
    let map;
    switch (type) {
      case 'color':
        map = new THREE.Color(color);
        if (isBackground) this._scene.background = map;
        break;

      case 'image':
        loader.loadTexture(url).then(res => {
          if (isBackground) this._scene.background = res;
        });
        break;

      case '360Image':
        loader.loadHDRTexture(url).then(texture => {
          const crt = new THREE.WebGLCubeRenderTarget(texture.image.height);
          crt.fromEquirectangularTexture(this._renderer, texture);
          if (isBackground) this._scene.background = crt.texture;
          if (isEnv) this._scene.environment = crt.texture;
        });
        break;

      case 'skyBox':
        loader.loadCubeTexture(url).then(skyboxCubemap => {
          if (isBackground) this._scene.background = skyboxCubemap;
          if (isEnv) this._scene.environment = skyboxCubemap;
        });

        break;

      default:
        break;
    }
  }
  /**
   * 设置场景环境贴图
   * @param resources 只支持hdr
   */
  setEnvironment(options: { url?: string }) {
    const { url } = options;
    if (url.indexOf('.hdr') !== -1) {
      loader.loadHDRTexture(url).then(texture => {
        const crt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        crt.fromEquirectangularTexture(this._renderer, texture);
        this._scene.environment = crt.texture;
      });
    }
  }

  /**
   * 设置场景雾化效果
   * @param options 雾化参数
   */
  setFog(options: {
    type: 'linear' | 'exponential' | 'exponential2';
    color?: string | number;
    near?: number;
    far?: number;
    density?: number;
  }) {
    const { type, color = '#ffffff', near = 1, far = 1000, density = 0.00025 } = options;

    switch (type) {
      case 'linear':
        this._scene.fog = new THREE.Fog(color, near, far);
        break;
      case 'exponential':
        this._scene.fog = new THREE.FogExp2(color, density);
        break;
      case 'exponential2':
        this._scene.fog = new THREE.FogExp2(color, density);
        break;
      default:
        break;
    }
  }

  /**
   * 清除场景雾化效果
   */
  clearFog() {
    this._scene.fog = null;
  }
}

export const sceneEffectTool = new SceneEffectTools();
