import {
  coreEvent,
  EnerV3DCore,
  sceneEffectTool,
  preloadModelToBrowserCache,
  debugTool,
  renderTool,
} from '@enerv-3d/core';
import { Camera } from "./output/Camera";
import { SceneLoader } from "./output/SceneLoader";
import { Selector } from "./output/Selector";
import { TopologyLoader } from "./output/TopologyLoader";
import "./output/_event";
import type { ObjectManagerOnType, ObjectType } from "./object";
import { QuerySelector, QueryParam } from "./output/QueryFilter";
import { event } from "./event";
import { factory } from "./object/factory";

interface SystemAPPInit {
  container?: HTMLElement
}

export class SystemAPP {
  private _core: EnerV3DCore;
  public selector: Selector;
  public sceneLoader: SceneLoader;
  public topologyLoader: TopologyLoader;
  public camera: Camera;
  public event: typeof event;
  public root: null | ObjectType;
  public query: (filter: string | QueryParam) => ObjectType;
  public sceneEffect: typeof sceneEffectTool

  constructor(options?: SystemAPPInit) {
    if (new.target !== SystemAPP) {
      return;
    }
    if (!SystemAPP._instance) {
      SystemAPP._instance = this;

      /**
       * 初始化APP依赖的系统模块
       */
      this._core = new EnerV3DCore();

      /**
       * 对外暴露系统接口实例
       */

      //事件管理器
      this.event = event;

      // 场景加载器
      this.sceneLoader = new SceneLoader(this._core);

      //选择器
      this.selector = new Selector(this.sceneLoader.sceneRoot);

      // 场景加载器
      this.topologyLoader = new TopologyLoader(this.sceneLoader.sceneRoot);
      //摄影机控制器
      this.camera = new Camera(this.sceneLoader.sceneRoot)
      // 物体选择器,只暴露一个查询接口
      this.query = QuerySelector.query;

      this.root = this.sceneLoader.sceneRoot;

      this.sceneEffect = this._core.sceneEffectTool;
      this.sceneEffect.initDefaultEnv();
      if (options?.container) this.setContainer(options.container)
    }
    return SystemAPP._instance;
  }

  static _instance;

  /**
 * 将渲染画布添加到外部dom容器，默认初始化APP会检测是否传container自动调用
 * @param dom
 */
  setContainer(dom: HTMLElement) {
    dom.appendChild(this._core.domContainer);
    dom.appendChild(this._core.renderTool.css3DRenderer.domElement);
    this._core.domContainer.style.width = dom.offsetWidth + 'px';
    this._core.domContainer.style.height = dom.offsetHeight + 'px';
  }

  /**
   * 重置app
   */
  reset() {
    this.clear();
    this._core.scene.add(this.sceneLoader.sceneRoot.node);
    factory.add(this.sceneLoader.sceneRoot);
    this.selector.curLevel = this.sceneLoader.sceneRoot;
    this._core.selectionTool.curLevel = this.sceneLoader.sceneRoot.node;
    this.resize();
  }

  /**
   * 创建物体 type: ObjType
   */
  async create(...[type, params]: ObjectManagerOnType): Promise<ObjectType> {
    const obj = await this.sceneLoader._create(...[type, params] as ObjectManagerOnType)
    return obj;
  }

  /**
   * 
   */
  async preload(model: Parameters<typeof preloadModelToBrowserCache>[0]) {
    const result = await preloadModelToBrowserCache(model);
    return result;
  }

  /**
   * 创建编辑网格
   */
  createStage() {

  }

  removeStage() {
  }

  debugger(bool: boolean) {
    this._core.setDebugger(bool);
  }

  resize() {
    coreEvent.dispatch("CORE_CANVAS_RESIZE", []);
  }

  /**
   * 开启关闭后处理效果
   * @param state 
   */
  enablePostprocessing(state: boolean) {
    renderTool.setPostprocessingStatus(state);
  }

  /**
 * 对当前画布渲染生成截图
 * @param compress 压缩后的尺寸 以宽度优先，成比例输出 默认输出原图
 * @return {Promise<*>}
 */
  async exportBase64Image(compress?: number): Promise<{
    image: string,
    blob: Blob
  }> {
    const res = await this._core.exportBase64Image(compress);
    return res;
  }

  /**
  * 直接将当前画面输出为截图
  */
  async downLoadImage() {
    await this._core.downLoadImage();
  }


  /**
   * 重置场景
   */
  clear() {
    this.sceneLoader.clear();
    debugTool.clear();
    factory.clear();

  }
}
