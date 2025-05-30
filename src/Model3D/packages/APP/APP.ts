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
  public core: EnerV3DCore;
  public selector: Selector;
  public sceneLoader: SceneLoader;
  public topologyLoader: TopologyLoader;
  public camera: Camera;
  public event: typeof event;
  public root: null | ObjectType;
  public query: (filter: string | QueryParam) => ObjectType | null;
  public sceneEffect: typeof sceneEffectTool

  constructor(options?: SystemAPPInit) {
    const {container} = options || {};

    // 初始化核心
    this.core = new EnerV3DCore(container);

    // 初始化场景加载器
    this.sceneLoader = new SceneLoader(this.core);

    // 初始化选择器
    this.selector = new Selector(this.sceneLoader.sceneRoot);

    // 初始化拓扑加载器
    this.topologyLoader = new TopologyLoader(this.sceneLoader.sceneRoot);

    // 初始化相机控制器
    this.camera = new Camera(this.sceneLoader.sceneRoot);

    // 初始化其他属性
    this.event = event;
    this.query = (filter: string | QueryParam) => QuerySelector.query(filter);
    this.root = this.sceneLoader.sceneRoot;
    this.sceneEffect = this.core.sceneEffectTool;
    this.sceneEffect.initDefaultEnv();

    // 设置容器
    if (container) {
      this.setContainer(container);
    }
  }

  /**
 * 将渲染画布添加到外部dom容器，默认初始化APP会检测是否传container自动调用
 * @param dom
 */
  setContainer(dom: HTMLElement) {
    dom.appendChild(this.core.domContainer);
    dom.appendChild(this.core.renderTool.css3DRenderer.domElement);
    this.core.domContainer.style.width = dom.offsetWidth + 'px';
    this.core.domContainer.style.height = dom.offsetHeight + 'px';
  }

  /**
   * 重置app
   */
  reset() {
    this.clear();
    this.core.scene.add(this.sceneLoader.sceneRoot.node);
    factory.add(this.sceneLoader.sceneRoot);
    this.selector.curLevel = this.sceneLoader.sceneRoot;
    this.resize();
  }

  /**
   * 创建物体
   * @param type 物体类型
   * @param params 物体参数
   * @returns 创建的物体
   */
  async create(...[type, params]: ObjectManagerOnType): Promise<ObjectType> {
    try {
      const obj = await this.sceneLoader._create(type, params);
      if (!obj) {
        throw new Error(`Failed to create object of type ${type}`);
      }
      return obj;
    } catch (error) {
      console.error('Error creating object:', error);
      throw error;
    }
  }

  /**
   * 预加载模型
   */
  async preload(model: Parameters<typeof preloadModelToBrowserCache>[0]) {
    const result = await preloadModelToBrowserCache(model);
    return result;
  }

  /**
   * 创建编辑网格
   */
  createStage() {
    // TODO: 实现编辑网格创建逻辑
  }

  removeStage() {
    // TODO: 实现编辑网格移除逻辑
  }

  debugger(bool: boolean) {
    this.core.setDebugger(bool);
  }

  resize() {
    coreEvent.dispatch("CORE_CANVAS_RESIZE", []);
  }

  /**
   * 开启/关闭后处理效果
   * @param state 是否启用后处理效果
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
    const res = await this.core.exportBase64Image(compress);
    return res;
  }

  /**
   * 直接将当前画面输出为截图
   */
  async downLoadImage() {
    await this.core.downLoadImage();
  }

  /**
   * 重置场景
   */
  clear() {
    if (this.sceneLoader) {
      this.sceneLoader.clear();
    }
    debugTool.clear();
    factory.clear();
  }
}
