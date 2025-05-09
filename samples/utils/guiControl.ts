/**
 * @file GUI控制工具
 * @description 提供通过lil-gui控制3D场景效果的功能
 * 该文件用于调试和调整场景中的各种视觉效果参数
 */

import GUI from 'lil-gui';
import * as THREE from 'three';
import { GeoGround } from '../tools';

/**
 * GUI控制类
 * 用于创建和管理场景参数的GUI控制面板
 */
export class GUIControl {
  private gui: GUI;
  private geoGround: GeoGround;
  private config: any = {};

  constructor(geoGround: GeoGround, initialConfig?: any) {
    this.gui = new GUI();
    this.geoGround = geoGround;
    this.config = initialConfig || {};
    this.initControls();
  }

  /**
   * 获取当前所有配置
   */
  public getConfig() {
    return this.config;
  }

  /**
   * 初始化GUI控制面板
   */
  private initControls() {
    // 创建主文件夹
    const mainFolder = this.gui.addFolder('场景控制');
    
    // 添加背景色控制
    const backgroundParams = {
      backgroundColor: this.config.background?.backgroundColor || '#ffffff'
    };
    this.config.background = backgroundParams;
    
    mainFolder.addColor(backgroundParams, 'backgroundColor').name('背景颜色').onChange((value: string) => {
      const sceneEffectTool = this.geoGround.getSceneEffectTool();
      sceneEffectTool.setBackground({
        type: 'color',
        color: value
      });
    });

    // 添加雾效控制
    const fogFolder = mainFolder.addFolder('雾效');
    const fogParams = {
      enabled: this.config.fog?.enabled || false,
      type: this.config.fog?.type || 'linear',
      color: this.config.fog?.color || '#ffffff',
      near: this.config.fog?.near || 1,
      far: this.config.fog?.far || 100,
      density: this.config.fog?.density || 0.1
    };
    this.config.fog = fogParams;

    fogFolder.add(fogParams, 'enabled').name('启用雾效').onChange((value: boolean) => {
      const sceneEffectTool = this.geoGround.getSceneEffectTool();
      if (value) {
        sceneEffectTool.setFog({
          type: fogParams.type,
          color: fogParams.color,
          near: fogParams.near,
          far: fogParams.far,
          density: fogParams.density
        });
      } else {
        sceneEffectTool.clearFog();
      }
    });

    fogFolder.add(fogParams, 'type', ['linear', 'exponential', 'exponential2']).name('雾效类型').onChange((value: 'linear' | 'exponential' | 'exponential2') => {
      fogParams.type = value;
      if (fogParams.enabled) {
        const sceneEffectTool = this.geoGround.getSceneEffectTool();
        sceneEffectTool.setFog({
          type: value,
          color: fogParams.color,
          near: fogParams.near,
          far: fogParams.far,
          density: fogParams.density
        });
      }
    });

    fogFolder.addColor(fogParams, 'color').name('雾效颜色').onChange((value: string) => {
      fogParams.color = value;
      if (fogParams.enabled) {
        const sceneEffectTool = this.geoGround.getSceneEffectTool();
        sceneEffectTool.setFog({
          type: fogParams.type,
          color: value,
          near: fogParams.near,
          far: fogParams.far,
          density: fogParams.density
        });
      }
    });

    fogFolder.add(fogParams, 'near', 0, 100).name('近端距离').onChange((value: number) => {
      fogParams.near = value;
      if (fogParams.enabled) {
        const sceneEffectTool = this.geoGround.getSceneEffectTool();
        sceneEffectTool.setFog({
          type: fogParams.type,
          color: fogParams.color,
          near: value,
          far: fogParams.far,
          density: fogParams.density
        });
      }
    });

    fogFolder.add(fogParams, 'far', 0, 1000).name('远端距离').onChange((value: number) => {
      fogParams.far = value;
      if (fogParams.enabled) {
        const sceneEffectTool = this.geoGround.getSceneEffectTool();
        sceneEffectTool.setFog({
          type: fogParams.type,
          color: fogParams.color,
          near: fogParams.near,
          far: value,
          density: fogParams.density
        });
      }
    });

    fogFolder.add(fogParams, 'density', 0, 1).name('雾效密度').onChange((value: number) => {
      fogParams.density = value;
      if (fogParams.enabled) {
        const sceneEffectTool = this.geoGround.getSceneEffectTool();
        sceneEffectTool.setFog({
          type: fogParams.type,
          color: fogParams.color,
          near: fogParams.near,
          far: fogParams.far,
          density: value
        });
      }
    });

    // 添加地面效果控制
    const groundParams = {
      groundColor: this.config.ground?.groundColor || '#ffffff',
      markColor: this.config.ground?.markColor || '#ffffff',
      groundOpacity: this.config.ground?.groundOpacity || 0.8
    };
    this.config.ground = groundParams;

    const groundFolder = mainFolder.addFolder('地面效果');
    groundFolder.addColor(groundParams, 'groundColor').name('地面颜色').onChange((value: string) => {
      this.geoGround.updateGroundEffect({
        groundColor: value,
        markColor: groundParams.markColor,
        groundOpacity: groundParams.groundOpacity
      });
    });

    groundFolder.addColor(groundParams, 'markColor').name('标记颜色').onChange((value: string) => {
      this.geoGround.updateGroundEffect({
        groundColor: groundParams.groundColor,
        markColor: value,
        groundOpacity: groundParams.groundOpacity
      });
    });

    groundFolder.add(groundParams, 'groundOpacity', 0, 1, 0.1).name('地面透明度').onChange((value: number) => {
      this.geoGround.updateGroundEffect({
        groundColor: groundParams.groundColor,
        markColor: groundParams.markColor,
        groundOpacity: value
      });
    });

    // 添加材质控制
    const materialParams = {
      topFaceColor: this.config.material?.topFaceColor || '#123024',
      topFaceOpacity: this.config.material?.topFaceOpacity || 0,
      sideFaceColor: this.config.material?.sideFaceColor || '#123024',
      sideFaceOpacity: this.config.material?.sideFaceOpacity || 0.9
    };
    this.config.material = materialParams;

    const materialFolder = mainFolder.addFolder('材质控制');
    materialFolder.addColor(materialParams, 'topFaceColor').name('顶部颜色').onChange((value: string) => {
      this.geoGround.setMaterialParams({
        topFaceColor: value,
        topFaceOpacity: materialParams.topFaceOpacity,
        sideFaceColor: materialParams.sideFaceColor,
        sideFaceOpacity: materialParams.sideFaceOpacity
      });
    });

    materialFolder.add(materialParams, 'topFaceOpacity', 0, 1, 0.1).name('顶部透明度').onChange((value: number) => {
      this.geoGround.setMaterialParams({
        topFaceColor: materialParams.topFaceColor,
        topFaceOpacity: value,
        sideFaceColor: materialParams.sideFaceColor,
        sideFaceOpacity: materialParams.sideFaceOpacity
      });
    });

    materialFolder.addColor(materialParams, 'sideFaceColor').name('侧面颜色').onChange((value: string) => {
      this.geoGround.setMaterialParams({
        topFaceColor: materialParams.topFaceColor,
        topFaceOpacity: materialParams.topFaceOpacity,
        sideFaceColor: value,
        sideFaceOpacity: materialParams.sideFaceOpacity
      });
    });

    materialFolder.add(materialParams, 'sideFaceOpacity', 0, 1, 0.1).name('侧面透明度').onChange((value: number) => {
      this.geoGround.setMaterialParams({
        topFaceColor: materialParams.topFaceColor,
        topFaceOpacity: materialParams.topFaceOpacity,
        sideFaceColor: materialParams.sideFaceColor,
        sideFaceOpacity: value
      });
    });

    // 添加光效控制
    const lightFolder = mainFolder.addFolder('光效控制');
    const lightParams = {
      glowColor: this.config.light?.glowColor || '#00aaff',
      glowWidth: this.config.light?.glowWidth || 0.6,
      glowIntensity: this.config.light?.glowIntensity || 0.7,
      glowFalloff: this.config.light?.glowFalloff || 1.6,
      showLightPillars: this.config.light?.showLightPillars || true
    };
    this.config.light = lightParams;

    lightFolder.add(lightParams, 'showLightPillars').name('显示光柱').onChange((value: boolean) => {
      this.geoGround.setLightPillarsVisible(value);
    });

    lightFolder.addColor(lightParams, 'glowColor').name('发光颜色').onChange((value: string) => {
      const color = new THREE.Color(value);
      this.geoGround.updateGlowEffect(
        color,
        lightParams.glowWidth,
        lightParams.glowIntensity,
        lightParams.glowFalloff
      );
    });

    lightFolder.add(lightParams, 'glowWidth', 0.1, 2, 0.1).name('发光宽度').onChange((value: number) => {
      this.geoGround.updateGlowEffect(
        new THREE.Color(lightParams.glowColor),
        value,
        lightParams.glowIntensity,
        lightParams.glowFalloff
      );
    });

    lightFolder.add(lightParams, 'glowIntensity', 0.1, 1, 0.1).name('发光强度').onChange((value: number) => {
      this.geoGround.updateGlowEffect(
        new THREE.Color(lightParams.glowColor),
        lightParams.glowWidth,
        value,
        lightParams.glowFalloff
      );
    });

    lightFolder.add(lightParams, 'glowFalloff', 0.1, 3, 0.1).name('发光衰减').onChange((value: number) => {
      this.geoGround.updateGlowEffect(
        new THREE.Color(lightParams.glowColor),
        lightParams.glowWidth,
        lightParams.glowIntensity,
        value
      );
    });

    // 添加线条控制
    const lineFolder = mainFolder.addFolder('线条控制');
    
    // 上边框控制
    const topLineFolder = lineFolder.addFolder('上边框');
    const topLineParams = {
      lineColor: this.config.topLine?.lineColor || '#00ffff',
      lineOpacity: this.config.topLine?.lineOpacity || 0.2,
      glowColor: this.config.topLine?.glowColor || '#00aaff',
      glowOpacity: this.config.topLine?.glowOpacity || 2.0,
      glowSpeed: this.config.topLine?.glowSpeed || 1.0,
      speedFactor1: this.config.topLine?.speedFactor1 || 1.8,
      speedFactor2: this.config.topLine?.speedFactor2 || 1.0,
      speedFactor3: this.config.topLine?.speedFactor3 || -1.2
    };
    this.config.topLine = topLineParams;

    // 上边框线条颜色控制
    topLineFolder.addColor(topLineParams, 'lineColor').name('线条颜色').onChange((value: string) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 上边框线条透明度控制
    topLineFolder.add(topLineParams, 'lineOpacity', 0, 1, 0.1).name('线条透明度').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 上边框发光颜色控制
    topLineFolder.addColor(topLineParams, 'glowColor').name('发光颜色').onChange((value: string) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 上边框发光透明度控制
    topLineFolder.add(topLineParams, 'glowOpacity', 0, 3, 0.1).name('发光透明度').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 上边框发光速度控制
    topLineFolder.add(topLineParams, 'glowSpeed', 0, 2, 0.1).name('发光速度').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 上边框速度因子控制
    topLineFolder.add(topLineParams, 'speedFactor1', -2, 2, 0.1).name('速度因子1').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });
    topLineFolder.add(topLineParams, 'speedFactor2', -2, 2, 0.1).name('速度因子2').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });
    topLineFolder.add(topLineParams, 'speedFactor3', -2, 2, 0.1).name('速度因子3').onChange((value: number) => {
      this.updateTopLineEffect(topLineParams);
    });

    // 下边框控制
    const bottomLineFolder = lineFolder.addFolder('下边框');
    const bottomLineParams = {
      lineColor: this.config.bottomLine?.lineColor || '#61fbfd',
      lineOpacity: this.config.bottomLine?.lineOpacity || 1,
      glowColor: this.config.bottomLine?.glowColor || '#00ffff',
      glowOpacity: this.config.bottomLine?.glowOpacity || 1,
      glowSpeed: this.config.bottomLine?.glowSpeed || 0,
      speedFactor1: this.config.bottomLine?.speedFactor1 || 1.5,
      speedFactor2: this.config.bottomLine?.speedFactor2 || 0.7,
      speedFactor3: this.config.bottomLine?.speedFactor3 || -1.0
    };
    this.config.bottomLine = bottomLineParams;

    // 下边框线条颜色控制
    bottomLineFolder.addColor(bottomLineParams, 'lineColor').name('线条颜色').onChange((value: string) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 下边框线条透明度控制
    bottomLineFolder.add(bottomLineParams, 'lineOpacity', 0, 1, 0.1).name('线条透明度').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 下边框发光颜色控制
    bottomLineFolder.addColor(bottomLineParams, 'glowColor').name('发光颜色').onChange((value: string) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 下边框发光透明度控制
    bottomLineFolder.add(bottomLineParams, 'glowOpacity', 0, 3, 0.1).name('发光透明度').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 下边框发光速度控制
    bottomLineFolder.add(bottomLineParams, 'glowSpeed', 0, 2, 0.1).name('发光速度').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 下边框速度因子控制
    bottomLineFolder.add(bottomLineParams, 'speedFactor1', -2, 2, 0.1).name('速度因子1').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });
    bottomLineFolder.add(bottomLineParams, 'speedFactor2', -2, 2, 0.1).name('速度因子2').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });
    bottomLineFolder.add(bottomLineParams, 'speedFactor3', -2, 2, 0.1).name('速度因子3').onChange((value: number) => {
      this.updateBottomLineEffect(bottomLineParams);
    });

    // 添加导出按钮
    const exportFolder = this.gui.addFolder('配置导出');
    exportFolder.add({
      export: () => {
        console.log('当前配置:', JSON.stringify(this.config, null, 2));
      }
    }, 'export').name('导出配置');
  }

  /**
   * 更新上边框线条效果
   * @param params 线条参数
   */
  private updateTopLineEffect(params: any) {
    console.log('Updating top line effect with params:', params);
    this.geoGround.updateLineEffect(
      new THREE.Color(params.lineColor),
      params.lineOpacity,
      new THREE.Color(params.glowColor),
      params.glowOpacity,
      params.glowSpeed,
      [params.speedFactor1, params.speedFactor2, params.speedFactor3],
      true
    );
  }

  /**
   * 更新下边框线条效果
   * @param params 线条参数
   */
  private updateBottomLineEffect(params: any) {
    console.log('Updating bottom line effect with params:', params);
    this.geoGround.updateLineEffect(
      new THREE.Color(params.lineColor),
      params.lineOpacity,
      new THREE.Color(params.glowColor),
      params.glowOpacity,
      params.glowSpeed,
      [params.speedFactor1, params.speedFactor2, params.speedFactor3],
      false
    );
  }

  /**
   * 销毁GUI控制面板
   */
  public dispose() {
    this.gui.destroy();
  }
} 