import * as THREE from 'three';
import { REVISION } from 'three';
import { coreEvent } from './managers/eventManager';
import { cameraTool } from './tools/cameraTool';
import { renderTool } from './tools/renderTool';
import { snapshot } from './tools/renderTool/Snapshot';

import { lightTool } from './tools/lightTool';
import { sceneEffectTool } from './tools/sceneEffectTool';
import { selectionTool } from './tools/selectionTool';
import { loader } from './tools/loader';
import geometryManager from './managers/geometryManager';
import { debugTool } from './tools/debugTool';

export const version = parseInt(REVISION.replace(/\D+/g, ''));

/**
 * 核心模块设计初衷就是初始化一个能让3D各个系统在其上运行并赋能的基础环境
 * 对外暴露结构
 * -API(目前是对THREE的扩展)
 *     -画布canvas(承载所有webgl上下文的DOM元素)
 *     -场景
 *     -相机
 * 以上信息也作为应用层的一块统一访问地址。
 */

export class EnerV3DCore {
  // dom容器
  public domContainer!: HTMLElement;

  // 最终暴露出的canvas画布
  public canvas!: HTMLCanvasElement;
  
  // 场景
  public scene!: THREE.Scene;
  public helperScene!: THREE.Scene;
  
  //渲染器
  public renderTool!: typeof renderTool;

  // 选择器
  public selectionTool!: typeof selectionTool;

  // 灯光工具
  public lightTool!: typeof lightTool;

  // 摄影机工具
  public cameraTool!: typeof cameraTool;

  // 场景效果工具
  public sceneEffectTool!: typeof sceneEffectTool;

  // loader
  public loader!: typeof loader;

  // 坐标辅助
  public axesHelper!: THREE.AxesHelper;

  /**
   * @param canvas 画布
   */
  constructor(domContainer: HTMLElement) {
    // 初始化 DOM 容器
    this.initDom(domContainer);

    // 初始化场景
    this.scene = new THREE.Scene();
    this.helperScene = new THREE.Scene();

    // 初始化灯光
    this.lightTool = lightTool;
    this.lightTool.init(this.scene);
    this.loader = loader;

    // 初始化相机
    this.cameraTool = cameraTool;
    this.cameraTool.initCamera(this.canvas);
    
    // 初始化控制器
    this.cameraTool.initControl(this.canvas);

    // 初始化渲染器
    this.renderTool = renderTool;
    this.renderTool.initRenderer({
      canvas: this.canvas,
      camera: this.camera,
      scene: this.scene,
      helperScene: this.helperScene,
    });
    this.renderTool.render();
    this.domContainer.appendChild(this.renderTool.css3DRenderer.domElement);

    // 初始化场景效果
    this.sceneEffectTool = sceneEffectTool;
    this.sceneEffectTool.init({
      scene: this.scene,
      renderer: this.renderTool.renderer,
    });

    // 初始化选择器
    this.selectionTool = selectionTool;
    this.selectionTool.init({
      camera: this.camera,
      canvas: this.canvas,
      scene: this.scene,
    });

    this.initEvent();
  }

  /**
   * 初始化dom容器和渲染画布
   */
  initDom(domContainer: HTMLElement) {
    this.domContainer = document.createElement('div');
    this.domContainer.style.width = '100%';
    this.domContainer.style.height = '100%';
    this.domContainer.style.background = 'transparent';
    
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'mainCanvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = '1';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.background = 'transparent';
    
    domContainer.appendChild(this.domContainer);
    this.domContainer.appendChild(this.canvas);
  }

  /**
   * 注册事件
   */
  initEvent() {
    const _this = this;
    //给渲染画布注册dom事件管理
    coreEvent.initEventNative(this.canvas);
    coreEvent.on('CORE_CANVAS_RESIZE', () => {
      if (!this.domContainer.parentElement) return;
      const width = this.domContainer.parentElement.clientWidth;
      const height = this.domContainer.parentElement.clientHeight;
      _this.renderTool.setSize(width, height);
      _this.cameraTool.updateAspectRatio(this.canvas);
    });
    coreEvent.dispatch('CORE_CANVAS_RESIZE', []);
    // _this.cameraTool.initControl(_this.canvas);
    _this.cameraTool.updateAspectRatio(this.canvas);
    _this.renderTool.initStats(this.domContainer);
  }

  setDebugger(state: boolean) {
    const axisHelper = this._initAxisHelper();
    this.axesHelper = axisHelper;
    this.renderTool.setDebugger(state);
    debugTool.setDebugger(state);
    if (state === true) {
      this.scene.add(this.axesHelper);
    } else if (state === false) {
      this.scene.remove(this.axesHelper);
    }
  }

  /**
   * 初始化坐标辅助工具
   */
  _initAxisHelper(size = 500) {
    // 辅助类对象要不要放到另一个scene？？？
    return new THREE.AxesHelper(size);
  }

  get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this.cameraTool.camera;
  }

  set camera(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    //todo 调用cameraTools接口替换
    this.cameraTool.camera = camera;
  }
  /**
   * 对当前画布渲染生成截图
   * @param compress 压缩后的尺寸 以宽度优先，成比例输出 默认输出原图
   * @return {Promise<*>}
   */
  async exportBase64Image(compress?: number): Promise<{
    image: string;
    blob: Blob;
  }> {
    let image = await snapshot.toImage();
    if (compress) {
      // @ts-ignore
      image = await snapshot.compressBase64Image(image, compress);
    }
    let byteCharacters = atob(image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
    let byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    let byteArray = new Uint8Array(byteNumbers);
    return {
      image: image,
      blob: new Blob([byteArray], {
        type: undefined,
      }),
    };
  }

  /**
   * 直接将当前画面输出为截图
   */
  async downLoadImage() {
    const res = await this.exportBase64Image();
    const a = document.createElement('a');
    // a.setAttribute("href", res.image)
    a.setAttribute('download', 'image.png');
    a.href = URL.createObjectURL(res.blob);
    a.setAttribute('target', '_blank');
    a.click();
  }
}
