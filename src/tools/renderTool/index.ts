import * as THREE from 'three';
import { coreEvent } from '../../managers/eventManager';
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  OutlineEffect,
  SMAAEffect,
  SelectiveBloomEffect,
} from 'postprocessing';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { ViewHelper } from '../cameraTool/viewHelper';
import { cameraTool } from '../cameraTool';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { MeshObject3D } from '../../objects/MeshObject3D';
import { debugTool } from '../debugTool';

/**
 * 渲染器工具类
 * 控制场景渲染状态和渲染优先级
 */
class RendererTool {
  public renderer!: THREE.WebGLRenderer;
  public css3DRenderer!: CSS3DRenderer;
  private stats: Stats | null = null;

  private debugger: boolean = false;

  public camera!: THREE.Camera;
  public scene!: THREE.Scene;
  private composer!: EffectComposer;
  public outline!: OutlineEffect;
  public bloomEffect!: SelectiveBloomEffect;
  public drawCall: any = null;
  public scenePolycount: any = null;
  private _postprocessingStatus: boolean = false;
  public helperScene!: THREE.Scene;
  public viewHelper: ViewHelper | null = null;

  constructor() {
    // 后处理渲染状态 默认不开启
    this._postprocessingStatus = false;
    const data = {
      drawCall: 0,
      scenePolycount: 0,
    };
    const folder = debugTool.coreFolder;
    if (folder) {
      this.drawCall = folder.add(data, 'drawCall', 0, 1000, 1) as any;
      this.scenePolycount = folder.add(data, 'scenePolycount', 0, 1000000, 1) as any;
    }
  }

  initRenderer = (options: {
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    helperScene: THREE.Scene;
    camera: THREE.Camera;
  }) => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
      canvas: options.canvas,
      context: options.canvas.getContext('webgl2') as WebGLRenderingContext,
    });
    // THREEJS 已废弃outputEncoding
    // renderer.outputEncoding = THREE.sRGBEncoding;
    //关闭阴影
    renderer.shadowMap.enabled = false;
    // 线性控件映射
    renderer.toneMapping = THREE.LinearToneMapping;
    // 色调映射的曝光级别。默认是1
    renderer.toneMappingExposure = 1;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0);

    //CSS3D Renderer
    this.css3DRenderer = new CSS3DRenderer();
    this.css3DRenderer.domElement.id = 'render-css3d';
    this.css3DRenderer.domElement.style.position = 'absolute';
    this.css3DRenderer.domElement.style.top = 0;
    this.css3DRenderer.domElement.style.zIndex = 9;
    this.css3DRenderer.domElement.style.pointerEvents = 'none';

    this.renderer = renderer;
    this.camera = options.camera;
    this.scene = options.scene;
    this.helperScene = options.helperScene;
    this.initPostprocessing();
    this.setSize(options.canvas.clientWidth, options.canvas.clientHeight);
  };

  /**
   * 初始化后处理模块
   */
  initPostprocessing() {
    // postprocessing
    const composer = new EffectComposer(this.renderer);
    this.composer = composer;
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    // =================================outline=========================================
    this.outline = new OutlineEffect(this.scene, this.camera, {
      // blendFunction: BlendFunction.SCREEN,
      edgeStrength: 4,
      pulseSpeed: 0.4,
      visibleEdgeColor: 65280,
      hiddenEdgeColor: 0x22090a,
      height: 480,
      blur: true,
      xRay: true,
    });
    this.outline.blurPass.kernelSize = 1;
    this.outline.uniforms.get('edgeStrength').value = 4;

    this.outline.selection.set([]);
    composer.addPass(new EffectPass(this.camera, this.outline));
    // =================================bloom=========================================
    this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
      blendFunction: 0,
      mipmapBlur: true,
      luminanceThreshold: 0.4,
      luminanceSmoothing: 0.2,
      intensity: 2.0,
    });
    this.bloomEffect.selection.set([]);

    //是否默认设置全局发光
    // this.bloomEffect.inverted = true;
    composer.addPass(new EffectPass(this.camera, this.bloomEffect));

    const smaa = new EffectPass(this.camera, new SMAAEffect());

    composer.addPass(smaa);

    this._initEffectEvent();
  }

  /**
   * 设置后处理渲染状态
   */
  setPostprocessingStatus(status: boolean) {
    this._postprocessingStatus = status;
  }

  private _initEffectEvent() {
    coreEvent.on('CORE_OBJECT_SELECTED', (obj3d: THREE.Object3D | null) => {
      if (!this.outline?.selection) return;
      
      this.outline.selection.clear();
      const meshList: (THREE.Mesh | MeshObject3D)[] = [];
      if (obj3d) {
        obj3d.traverse((cur: THREE.Object3D) => {
          if (cur instanceof THREE.Mesh || cur instanceof MeshObject3D) {
            meshList.push(cur);
          }
        });
      }

      this.outline.selection.set(meshList);
    });
  }

  /**
   * 增加辉光物体
   * @param object
   */
  addBloomObject(object: THREE.Object3D) {
    this.outline.selection.add(object);
  }

  setSize(width: number, height: number) {
    (this.renderer as THREE.WebGLRenderer).setSize(width, height);
    this.composer.setSize(width, height);
    this.css3DRenderer.setSize(width, height);
  }

  setDebugger(state: boolean) {
    this.debugger = state;
    if (this.stats) {
      if (state === true) {
        this.stats.dom.style.display = 'block';
      } else if (state === false) {
        this.stats.dom.style.display = 'none';
      }
    }
  }
  /**
   * 创建帧率状态工具
   * @param container
   * @returns
   */
  initStats(container: HTMLElement) {
    if (this.stats) return;
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.display = 'none';
    container.appendChild(this.stats.dom);
  }

  /**
   * 创建帧率状态工具
   * @param container
   * @returns
   */
  initCameraHelper(container: HTMLElement) {
    if (this.viewHelper) return;
    const viewHelper = new ViewHelper(this.camera, container);
    this.viewHelper = viewHelper;
  }

  //开始渲染
  render = (time?: number) => {
    if (this.debugger && this.stats) {
      this.stats.update();
      this.renderer.info.autoReset = false;
      if (this.drawCall) {
        this.drawCall.setValue(this.renderer.info.render.calls);
      }
      if (this.scenePolycount) {
        this.scenePolycount.setValue(this.renderer.info.render.triangles);
      }
      this.renderer.info.reset();
    }

    if (this._postprocessingStatus) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 辅助场景同步渲染
    this.renderer.render(this.helperScene, this.camera);
    cameraTool.orbitControl && cameraTool.orbitControl.update();
    this.viewHelper && this.viewHelper.render(this.renderer);

    //渲染css3D
    this.css3DRenderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render);
  };
}
export const renderTool = new RendererTool();
