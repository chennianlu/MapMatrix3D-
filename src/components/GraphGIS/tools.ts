/**
 * @file 场景工具与初始化入口
 * @description 提供场景初始化、3D效果管理与更新控制的功能。
 * 该文件是3D场景的入口点，负责初始化场景、加载地图数据、
 * 管理各种视觉效果(流光线、光柱、粒子)并实现动画循环。
 */
import * as THREE from "three"
import { ProvinceData } from './types.ts';
import { Group3D, BaseObject3D, coreEvent, cameraTool } from '../../Model3D/core/index.ts';
import { MeshObject3D } from '../../Model3D/core/objects/MeshObject3D.ts';
import {createCountryFlatLine} from "./utils/mapLineUtils.ts"
import useMapMarkedLightPillar from "./utils/useMapMarkedLightPillar.ts"
import { Widget3D } from '../../Model3D/core/objects/Widget3D.ts';
import { WIDGET } from '../../Model3D/core/constants.ts';
import type { EnerV3DCore } from '../../Model3D/core/index.ts';

import { createGlowingShape } from './utils/glowingShape.ts';
import { transformGeoJSON, GeoJSONData } from './utils/geoDataUtils.ts';

/**
 * 动画状态接口定义
 */
interface AnimationState {
  targetY: number;
  velocity: number;
  damping: number;
  stiffness: number;
  initialY: number;
  isAnimating: boolean;
  isRising: boolean;
}


/**
 * 3D地图场景管理类
 * 负责管理地图的创建、动画效果和交互
 */
export class GeoGround {
  /**
   * 3D核心引擎实例
   */
  private core: EnerV3DCore;

  /**
   * 地图组，包含所有省份对象
   */
  private mapGroup: Group3D;

  /**
   * 时钟对象，用于控制动画时间
   */
  private clock: THREE.Clock;

  /**
   * 流光线条数组，用于存储地图边界的光效
   */
  private flowingLines: any[];

  /**
   * 粒子容器，用于存储粒子效果
   */
  private particleContainer: THREE.Group | null = null;

  /**
   * 光柱数组，用于存储每个省份的光柱效果
   */
  private lightPillars: THREE.Group[] = [];

  /**
   * 旋转光圈网格，用于创建地面旋转效果
   */
  private rotatingApertureMesh: THREE.Mesh | null = null;

  /**
   * 旋转点网格，用于创建地面旋转效果
   */
  private rotatingPointMesh: THREE.Mesh | null = null;

  /**
   * 地面组，包含所有地面效果
   */
  private groundGroup: THREE.Group | null = null;

  /**
   * 弹性动画映射表，用于存储每个省份的动画状态
   */
  private elasticAnimations: Map<BaseObject3D, AnimationState>;

  /**
   * 初始化标志，表示场景是否已经初始化
   */
  private isInitialized: boolean = false;

  /**
   * 动画帧ID，用于清理动画循环
   */
  private animationFrameId: number | null = null;

  /**
   * 光柱动画状态接口
   */
  private lightPillarAnimations: Map<THREE.Group, {
    scale: number;
    currentScale: number;
    targetScale: number;
    opacity: number;
    targetOpacity: number;
    isExpanding: boolean;
    startTime: number;
    duration: number;
  }> = new Map();

  /**
   * 地理层级关系枚举
   */
  private readonly GEO_LEVEL = {
    COUNTRY_PROVINCE: 'country_province',  // 国家-省级关系
    PROVINCE_CITY: 'province_city',        // 省-市级关系
    CITY_DISTRICT: 'city_district'         // 市-区级关系
  };

  /**
   * 当前地理层级
   */
  private currentGeoLevel: string = this.GEO_LEVEL.COUNTRY_PROVINCE;

  /**
   * 省份数据，包含地理信息和属性
   */
  private provinceData: ProvinceData | null = null;

  /**
   * 地理板块和边框线的高度设置
   */
  private geoHeight = {
    depth: 0.2      // 地理板块拉伸深度
  };

  /**
   * 文字标签的高度设置
   */
  private textHeight = {
    radioScale: 0.2  // 文字缩放比例
  };

  /**
   * 光柱的高度设置
   */
  private pillarHeight = {
    scale: 1,        // 光柱缩放比例
    height: 1        // 光柱高度
  };

  /**
   * 配置参数
   */
  private config?: any;

  /**
   * 构造函数
   * @param core 3D核心引擎实例
   */
  constructor(core: EnerV3DCore) {
    this.core = core;
    this.clock = new THREE.Clock();
    this.flowingLines = [];
    this.elasticAnimations = new Map();
    this.mapGroup = new Group3D();
  }

  /**
   * 查找对象中的发光形状网格
   * @param object 要查找的对象
   * @returns 发光形状网格数组
   */
  private findGlowingShapes(object: BaseObject3D): MeshObject3D[] {
    const glowingShapes: MeshObject3D[] = [];
    object.traverse((child) => {
      if (child instanceof MeshObject3D && child.userData.shape === 'glowingShape') {
        glowingShapes.push(child);
      }
    });
    return glowingShapes;
  }

  /**
   * 设置发光效果参数
   * @param shape 发光形状网格
   * @param isRising 是否在上升状态
   */
  private setGlowEffect(shape: MeshObject3D, isRising: boolean): void {
    const material = shape.material as any;
    const glowConfig = this.config?.light || {};
    
    if (isRising) {
      material.uniforms.glowColor.value.set(0xffa500);
      material.uniforms.glowWidth.value = 0.9;
      material.uniforms.glowIntensity.value = 0.7;
      material.uniforms.glowFalloff.value =  1.4;
    } else {
      material.uniforms.glowColor.value.set(glowConfig.glowColor || 0x00aaff);
      material.uniforms.glowWidth.value = glowConfig.glowWidth || 0.6;
      material.uniforms.glowIntensity.value = glowConfig.glowIntensity || 0.7;
      material.uniforms.glowFalloff.value = glowConfig.glowFalloff || 1.6;
    }
  }

  /**
   * 添加上升动画
   * @param object 要添加动画的对象
   */
  public addRiseAnimation(object: BaseObject3D): void {
    if (this.elasticAnimations.has(object) && this.elasticAnimations.get(object)!.isAnimating) {
      return;
    }

    const initialY = object.position.y;
    const targetY = initialY + 0.12;

    const glowingShapes = this.findGlowingShapes(object);
    glowingShapes.forEach(shape => {
      this.setGlowEffect(shape, true);
    });

    this.elasticAnimations.set(object, {
      targetY,
      velocity: 0,
      damping: 0.15,
      stiffness: 0.08,
      initialY,
      isAnimating: true,
      isRising: true
    });
  }

  /**
   * 添加下落动画
   * @param object 要添加动画的对象
   */
  public addFallAnimation(object: BaseObject3D): void {
    const animation = this.elasticAnimations.get(object);
    if (!animation) return;

    const glowingShapes = this.findGlowingShapes(object);
    glowingShapes.forEach(shape => {
      this.setGlowEffect(shape, false);
    });

    this.elasticAnimations.set(object, {
      targetY: animation.initialY,
      velocity: 0,
      damping: 0.2,
      stiffness: 0.08,
      initialY: animation.initialY,
      isAnimating: true,
      isRising: false
    });
  }

  /**
   * 创建光柱动画
   * @param group 光柱组
   * @param scale 初始缩放值
   */
  private createLightPillarAnimation(group: THREE.Group, scale: number): void {
    const lightHalo = group.children.find(child => child.name === 'createLightHalo') as THREE.Mesh;
    if (!lightHalo) return;

    const material = lightHalo.material as THREE.MeshBasicMaterial;

    // 确保材质初始状态正确
    material.opacity = 0;
    material.transparent = true;
    material.depthWrite = false;
    lightHalo.scale.set(scale, scale, scale);

    // 存储动画状态
    this.lightPillarAnimations.set(group, {
      scale,
      currentScale: scale,
      targetScale: scale * 1.2, // 减小缩放范围
      opacity: 0,
      targetOpacity: 1,
      isExpanding: true,
      startTime: Date.now(),
      duration: 2500 // 增加动画持续时间使效果更平滑
    });
  }

  /**
   * 创建文字标签
   * @param point 文字位置坐标
   * @param province 省份对象
   */
  private createTextLabel(point: number[], province: BaseObject3D): void {
    const textLength = province.userData.properties.name.length;
    const calculatedWidth = textLength * this.textHeight.radioScale;
    const textWidget = new Widget3D({
      type: WIDGET.TEXT_2D,
      width: calculatedWidth,
      height: this.textHeight.radioScale,
      textParam: {
        text: province.userData.properties.name,
        fontSize: 32,
        color: '#ffffff'
      }
    });
    textWidget.pickedEnable = false;
    textWidget.init().then(widget => {
      // 文字位置设置在板块顶部上方
      //widget.position.set(point[0] + this.textHeight.radioScale * 1.5, point[1], this.geoHeight.depth / 2 + this.textHeight.radioScale*1.5 );
      widget.position.set(point[0], point[1], this.geoHeight.depth / 2 + this.textHeight.radioScale );

      province.add(widget);
      province.name = province.userData.properties.name;
      // 文字渲染队列拉满
      widget.children[0].renderOrder = 1000;
    });
  }

  /**
   * 初始化事件监听
   * 处理鼠标拾取省份的动画效果
   */
  private initEvent(): void {
    let lastPickedProvince: BaseObject3D | null = null;

    coreEvent.on('POINT_MOVE', () => {
      const currentObject = this.core.selectionTool.getPickedObject() as BaseObject3D;

      /**
       * 递归查找省份对象
       * @param obj 当前对象
       * @returns 找到的省份对象，如果未找到则返回null
       */
      const findProvince = (obj: BaseObject3D | null): BaseObject3D | null => {
        // 如果对象不存在或是场景，返回null
        if (!obj || obj.type === 'Scene') {
          return null;
        }

        // 如果当前对象是省份，直接返回
        if (obj.userData.type === 'GeoGround') {
          return obj;
        }

        // 如果对象有父节点，继续向上查找
        if (obj.parent) {
          return findProvince(obj.parent as BaseObject3D);
        }

        return null;
      };

      // 查找当前拾取的省份
      const currentProvince = findProvince(currentObject);
      // 如果当前拾取的不是省份 
      if (!currentProvince) {
        document.body.style.cursor = 'default';
        // 如果上一次有拾取的省份，触发下落动画
        if (lastPickedProvince) {
          this.addFallAnimation(lastPickedProvince);
          lastPickedProvince = null;
        }
        
        return;
      }

      // 如果当前拾取的是新的省份
      if (currentProvince !== lastPickedProvince) {
        // 如果上一次有拾取的省份，先触发下落动画
        if (lastPickedProvince) {
          this.addFallAnimation(lastPickedProvince);
        }

        // 记录新的省份并触发上升动画
        lastPickedProvince = currentProvince;
        this.addRiseAnimation(currentProvince);
        document.body.style.cursor = 'pointer';
      }
    });

    coreEvent.on('CORE_OBJECT_SELECTED', (object: any) => {
      if (object && object.userData.type === 'GeoGround') {
        console.log('CORE_OBJECT_SELECTED', object);
      }
    });
  }

  /**
   * 根据地理层级设置高度参数
   */
  private setHeightByLevel(): void {
    switch (this.currentGeoLevel) {
      case this.GEO_LEVEL.COUNTRY_PROVINCE:
        this.geoHeight = {
          depth: 1      // 省级深度最大
        };
        this.textHeight = {
          radioScale: 1.2  // 省级文字最大
        };
        this.pillarHeight = {
          scale: 7,
          height: 1.2
        };
        break;
      case this.GEO_LEVEL.PROVINCE_CITY:
        this.geoHeight = {
          depth: 0.2    // 市级深度中等
        };
        this.textHeight = {
          radioScale: 0.2  // 市级文字中等
        };
        this.pillarHeight = {
          scale: 1.5,
          height: 0.4
        };
        break;
      case this.GEO_LEVEL.CITY_DISTRICT:
        this.geoHeight = {
          depth: 0.2    // 市级深度中等
        };
        this.textHeight = {
          radioScale: 0.16  // 市级文字中等
        };
        this.pillarHeight = {
          scale: 1.5,
          height: 0.4
        };
        break;
    }
  }

  /**
   * 创建省份对象
   * @param coordinates 省份坐标数据
   * @param properties 省份属性
   * @param topFaceMaterial 顶部材质
   * @param sideMaterial 侧面材质
   * @returns 创建的省份对象
   */
  private createProvince(coordinates: number[][][][], properties: any, topFaceMaterial: THREE.Material, sideMaterial: THREE.Material): BaseObject3D {
    const province = new BaseObject3D();
    province.userData.properties = properties;
    province.userData.type = 'GeoGround';
    coordinates.forEach((multiPolygon: number[][][]) => {
      multiPolygon.forEach((polygon: number[][]) => {
        const shape = new THREE.Shape();
        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = polygon[i];
          if (i === 0) {
            shape.moveTo(x, y);
          }
          shape.lineTo(x, y);
        }

        const extrudeSettings = {
          depth: this.geoHeight.depth,
          bevelEnabled: true,
          bevelSegments: 1,
          bevelThickness: 0.1,
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, [topFaceMaterial, sideMaterial]);
        mesh.updateMatrixWorld(true);

        const glowingShape = createGlowingShape(shape, {
          parentObject: mesh,
          glowColor: new THREE.Color(0x00aaff),
          glowWidth: 1,
          glowIntensity: 0.6,
          glowFalloff: 1.6,
          glowType: 'center'
        });
        glowingShape.position.z = -this.geoHeight.depth;
        province.add(mesh);
      });
    });

    if (properties.centroid || properties.center) {
      const point = properties.center;
      if (point) {
        // this.createLightPillar(point, province, 0x00aaff, 0x00ffff, this.pillarHeight.scale * 0.6);
        this.createTextLabel(point, province);
      }
    } 

    return province;
  }
  /**
   * 创建边框线
   * @param provinceData 省份数据
   * @param renderOrder 渲染顺序
   * @returns 包含上下边框的组
   */
  private createBorderLines(provinceData: ProvinceData): Group3D {
    const lineTop = createCountryFlatLine(
      provinceData,
      {
        lineColor: 0x00ffff,
        lineOpacity: 0.2,
        glowColor: 0x00aaff,
        glowOpacity: 2.0,
        glowSpeed: 1.0,
        speedFactors: [1.8, 1.0, -1.2]
      },
      "LineLoop",
      2
    );
    lineTop.name = 'topBorderLine';
    lineTop.position.z += this.geoHeight.depth;

    const lineBottom = createCountryFlatLine(
      provinceData,
      {
        lineColor: 0x61fbfd,
        lineOpacity: 1,
        glowColor: 0x00ffff,
        glowOpacity: 1,
        glowSpeed: 0,
        speedFactors: [1.5, 0.7, -1.0]
      },
      "LineLoop",
      -1
    );
    lineBottom.name = 'bottomBorderLine';
    lineBottom.position.z -= this.geoHeight.depth;

    const borderGroup = new Group3D();
    borderGroup.add(lineTop);
    borderGroup.add(lineBottom);

    // 清空并重新添加线条
    this.flowingLines = [];
    this.flowingLines.push(lineTop);
    this.flowingLines.push(lineBottom);
    
    borderGroup.pickedEnable = false;
    return borderGroup;
  }

  /**
   * 加载场景地面
   * 创建并添加旋转光圈、旋转点、背景和原点等效果
   */
  private async loadSceneGround(): Promise<void> {
    const texture = this.core.loader.textureLoader;
    texture.setPath("/data/map/");
    const rotatingApertureTexture = texture.load("rotatingAperture.png");
    const rotatingPointTexture = texture.load("rotating-point2.png");
    const circlePoint = texture.load("circle-point.png");
    const sceneBg = texture.load("scene-bg2.png");

    const box = new THREE.Box3().setFromObject(this.mapGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const width = Math.max(size.x, size.y);
    const bottomZ = -this.geoHeight.depth;

    this.groundGroup = new THREE.Group();

    const initRotatingAperture = (width: number): void => {
      let plane = new THREE.PlaneGeometry(width, width);
      let material = new THREE.MeshBasicMaterial({
        map: rotatingApertureTexture,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });
      this.rotatingApertureMesh = new THREE.Mesh(plane, material);
      this.rotatingApertureMesh.position.set(0, 0, bottomZ - 0.1);
      this.rotatingApertureMesh.scale.set(1.1, 1.1, 1.1);
      if (this.groundGroup) {
        this.groundGroup.add(this.rotatingApertureMesh);
      }
    };

    const initRotatingPoint = (width: number): void => {
      let plane = new THREE.PlaneGeometry(width, width);
      let material = new THREE.MeshBasicMaterial({
        map: rotatingPointTexture,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });
      this.rotatingPointMesh = new THREE.Mesh(plane, material);
      this.rotatingPointMesh.position.set(0, 0, bottomZ - 0.02);
      this.rotatingPointMesh.scale.set(1.1, 1.1, 1.1);
      if (this.groundGroup) {
        this.groundGroup.add(this.rotatingPointMesh);
      }
    };

    const initSceneBg = (width: number): void => {
      let plane = new THREE.PlaneGeometry(width * 4, width * 4);
      let material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: sceneBg,
        transparent: true,
        opacity: 1,
        depthTest: true,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(center.x, center.y, bottomZ - 0.2);
      if (this.groundGroup) {
        this.groundGroup.add(mesh);
      }
    };

    const initCirclePoint = (width: number): void => {
      let plane = new THREE.PlaneGeometry(width, width);
      let material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        map: circlePoint,
        transparent: true,
        opacity: 1,
      });
      let mesh = new THREE.Mesh(plane, material);
      mesh.position.set(center.x, center.y, bottomZ - 0.1);
      if (this.groundGroup) {
        this.groundGroup.add(mesh);
      }
    };

    // 初始化所有地面效果
    initRotatingAperture(width * 1.4);
    initRotatingPoint(width * 1.2);
    initSceneBg(width);
    initCirclePoint(width);

    if (this.groundGroup) {
      this.groundGroup.rotation.x = THREE.MathUtils.degToRad(-90);
      this.core.scene.add(this.groundGroup);
    }
  }

  /**
   * 动画更新函数
   * 处理所有动画效果，包括弹性动画、旋转动画、流光效果等
   */
  private animate(): void {
    if (!this.isInitialized) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();
    const currentTime = Date.now();

    // 更新弹性动画
    this.elasticAnimations.forEach((animation, object) => {
      const { targetY, velocity, damping, stiffness, initialY, isAnimating, isRising } = animation;

      const force = -stiffness * (object.position.y - targetY);
      animation.velocity += force;
      animation.velocity *= (1 - damping);
      object.position.y += animation.velocity;

      if (Math.abs(animation.velocity) < 0.001 && Math.abs(object.position.y - targetY) < 0.001) {
        object.position.y = targetY;

        if (!isRising && Math.abs(targetY - initialY) < 0.001) {
          object.position.y = initialY;
          this.elasticAnimations.delete(object);
        } else {
          animation.isAnimating = false;
        }
      }
    });

    // 更新旋转动画
    if (this.rotatingApertureMesh) {
      this.rotatingApertureMesh.rotation.z += 0.0005;
    }
    if (this.rotatingPointMesh) {
      this.rotatingPointMesh.rotation.z -= 0.0005;
    }

    // 更新流光效果
    this.flowingLines.forEach(line => {
      if (line && line.updateAnimation) {
        line.updateAnimation(time);
      }
    });

    // 更新光柱动画
    this.lightPillars.forEach(light => {
      if (!this.lightPillarAnimations.has(light)) {
        const scale = 0.3 * this.pillarHeight.scale;
        this.createLightPillarAnimation(light, scale);
      }
    });

    // 更新光柱动画状态
    this.lightPillarAnimations.forEach((animation, group) => {
      const lightHalo = group.children.find(child => child.name === 'createLightHalo') as THREE.Mesh;
      if (!lightHalo) return;

      const material = lightHalo.material as THREE.MeshBasicMaterial;
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (animation.isExpanding) {
        // 扩大阶段
        const scale = animation.scale + (animation.targetScale - animation.scale) * progress;
        const opacity = progress;

        lightHalo.scale.set(scale, scale, scale);
        material.opacity = opacity;

        if (progress >= 1) {
          // 切换到收缩阶段
          animation.isExpanding = false;
          animation.startTime = currentTime;
          animation.targetScale = animation.scale * 1.4; // 减小缩放范围
        }
      } else {
        // 收缩阶段
        const scale = animation.targetScale - (animation.targetScale - animation.scale) * progress;
        const opacity = 1 - progress;

        lightHalo.scale.set(scale, scale, scale);
        material.opacity = opacity;

        if (progress >= 1) {
          // 重新开始扩大阶段
          animation.isExpanding = true;
          animation.startTime = currentTime;
          animation.targetScale = animation.scale * 1.2; // 减小缩放范围
        }
      }
    });
  }

  /**
   * 根据地理层级设置高度参数
   */
  private determineGeoLevel(data: GeoJSONData): void {
    if (!data || !data.features || data.features.length === 0) {
      console.warn('无法确定地理层级：数据为空');
      return;
    }

    // 获取第一个特征的level字段
    const firstFeature = data.features[0];
    const level = firstFeature.properties?.level;

    console.log('数据中的level字段：', level);

    // 根据level字段判断层级
    switch (level) {
      case 'province':
        this.currentGeoLevel = this.GEO_LEVEL.COUNTRY_PROVINCE;
        console.log('当前地理层级：国家-省级关系');
        break;
      case 'city':
        this.currentGeoLevel = this.GEO_LEVEL.PROVINCE_CITY;
        console.log('当前地理层级：省-市级关系');
        break;
      case 'district':
        this.currentGeoLevel = this.GEO_LEVEL.CITY_DISTRICT;
        console.log('当前地理层级：市-区级关系');
        break;
      default:
        console.warn('未知的level类型：', level);
        // 默认设置为国家-省级关系
        this.currentGeoLevel = this.GEO_LEVEL.COUNTRY_PROVINCE;
        console.log('默认设置为国家-省级关系');
    }

    // 确定地理层级并设置高度参数
    this.setHeightByLevel();
  }

  /**
   * 创建光柱效果
   * @param point 光柱位置坐标
   * @param province 省份对象
   * @param pillarColor 光柱颜色，默认为0x00aaff
   * @param haloColor 光圈颜色，默认为0x00ffff
   */
  private createLightPillar(
    point: number[], 
    province: BaseObject3D,
    pillarColor: number = 0x00aaff,
    haloColor: number = 0x00ffff,
    height: number
  ): void {
    const light = useMapMarkedLightPillar({ 
      scaleFactor: height,
      pillarColor,
      haloColor,
      pointTextureUrl: './assets/texture/标注.png',
      lightHaloTextureUrl: './assets/texture/标注光圈.png',
      lightPillarUrl: './assets/texture/光柱.png'
    }).createLightPillar(
      point[0],
      point[1],
      height
    );
    light.name = `lightPillar_${province.userData.properties.name}`;
    light.position.z += this.pillarHeight.height;
    province.add(light);
    this.lightPillars.push(light);

    // 创建光柱动画
    const scale = 0.3 * this.pillarHeight.scale;
    this.createLightPillarAnimation(light, scale);
  }

  /**
   * 获取默认配置
   */
  public static getDefaultConfig() {
    return {
      background: {
        backgroundColor: '#ffffff'
      },
      fog: {
        enabled: false,
        type: 'linear',
        color: '#ffffff',
        near: 1,
        far: 100,
        density: 0.1
      },
      ground: {
        groundColor: '#ffffff',
        markColor: '#ffffff',
        groundOpacity: 0.8
      },
      material: {
        topFaceColor: '#123024',
        topFaceOpacity: 0,
        sideFaceColor: '#123024',
        sideFaceOpacity: 0.9
      },
      light: {
        glowColor: '#00aaff',
        glowWidth: 0.6,
        glowIntensity: 0.7,
        glowFalloff: 1.6,
        showLightPillars: true
      },
      topLine: {
        lineColor: '#00ffff',
        lineOpacity: 0.2,
        glowColor: '#00aaff',
        glowOpacity: 2.0,
        glowSpeed: 1.0,
        speedFactor1: 1.8,
        speedFactor2: 1.0,
        speedFactor3: -1.2
      },
      bottomLine: {
        lineColor: '#61fbfd',
        lineOpacity: 1,
        glowColor: '#00ffff',
        glowOpacity: 1,
        glowSpeed: 0,
        speedFactor1: 1.5,
        speedFactor2: 0.7,
        speedFactor3: -1.0
      }
    };
  }

  /**
   * 初始化场景
   * @param jsonPath 地图数据JSON文件路径
   * @param config 配置参数
   * @returns 地图组对象
   */
  public async init(jsonPath: string, config?: any): Promise<Group3D> {
    if (this.isInitialized) {
      console.warn("GeoGround已经初始化过");
      return this.mapGroup;
    }

    try {
      this.config = config;
      // 合并配置
      const mergedConfig = {
        ...GeoGround.getDefaultConfig(),
        ...config
      };

      // 创建材质
      const topMaterial = new THREE.MeshLambertMaterial({
        color: mergedConfig.material.topFaceColor,
        transparent: true,
        opacity: mergedConfig.material.topFaceOpacity,
      });

      const sideMaterial = new THREE.MeshLambertMaterial({
        color: mergedConfig.material.sideFaceColor,
        transparent: true,
        opacity: mergedConfig.material.sideFaceOpacity,
      });

      // 设置背景色
      this.core.sceneEffectTool.setBackground({
        type: 'color',
        color: mergedConfig.background.backgroundColor
      });

      // 设置雾效
      if (mergedConfig.fog.enabled) {
        this.core.sceneEffectTool.setFog({
          type: mergedConfig.fog.type,
          color: mergedConfig.fog.color,
          near: mergedConfig.fog.near,
          far: mergedConfig.fog.far,
          density: mergedConfig.fog.density
        });
      }

      // 加载地图数据
      const data = await this.core.loader.requestData(jsonPath);
      if (!data) {
        throw new Error("无法加载地图数据");
      }
      // 确定地理层级并设置高度参数
      this.determineGeoLevel(data);
      // 转换数据结构
      const scaleFactor = this.currentGeoLevel === this.GEO_LEVEL.CITY_DISTRICT ? 6 : 1;
      const convertedData = transformGeoJSON(data, scaleFactor);
      if (!convertedData) {
        throw new Error("地图数据转换失败");
      }

      this.provinceData = convertedData as ProvinceData;
      
      // 创建省份/市/区
      const boundingBox = new THREE.Box3();
      this.provinceData.features.forEach((feature: any) => {
        const province = this.createProvince(
          feature.geometry.coordinates,
          feature.properties,
          topMaterial,
          sideMaterial
        );
        boundingBox.expandByObject(province);
        this.mapGroup.add(province);
      });

      // 创建边框
      const borderGroup = this.createBorderLines(this.provinceData);
      this.mapGroup.add(borderGroup);

      // 旋转地图
      this.mapGroup.rotation.x = THREE.MathUtils.degToRad(-90);
      this.mapGroup.updateMatrixWorld(true);

      // 计算中心点并调整位置
      const rotatedBoundingBox = new THREE.Box3().setFromObject(this.mapGroup);
      const center = rotatedBoundingBox.getCenter(new THREE.Vector3());
      this.mapGroup.position.set(-center.x, this.geoHeight.depth * 0.5, -center.z);
      // 添加到场景
      this.core.scene.add(this.mapGroup);

      // 加载场景地面
      // await this.loadSceneGround();

      // 初始化事件监听
      this.initEvent();

      // 标记为已初始化
      this.isInitialized = true;

      // 启动动画
      this.animate();

      // 设置地面效果
      this.updateGroundEffect({
        groundColor: mergedConfig.ground.groundColor,
        markColor: mergedConfig.ground.markColor,
        groundOpacity: mergedConfig.ground.groundOpacity
      });

      // 设置光效
      this.updateGlowEffect(
        new THREE.Color(mergedConfig.light.glowColor),
        mergedConfig.light.glowWidth,
        mergedConfig.light.glowIntensity,
        mergedConfig.light.glowFalloff
      );

      // 设置光柱显示状态
      this.setLightPillarsVisible(mergedConfig.light.showLightPillars);

      // 设置上边框效果
      this.updateLineEffect(
        new THREE.Color(mergedConfig.topLine.lineColor),
        mergedConfig.topLine.lineOpacity,
        new THREE.Color(mergedConfig.topLine.glowColor),
        mergedConfig.topLine.glowOpacity,
        mergedConfig.topLine.glowSpeed,
        [
          mergedConfig.topLine.speedFactor1,
          mergedConfig.topLine.speedFactor2,
          mergedConfig.topLine.speedFactor3
        ],
        true
      );

      // 设置下边框效果
      this.updateLineEffect(
        new THREE.Color(mergedConfig.bottomLine.lineColor),
        mergedConfig.bottomLine.lineOpacity,
        new THREE.Color(mergedConfig.bottomLine.glowColor),
        mergedConfig.bottomLine.glowOpacity,
        mergedConfig.bottomLine.glowSpeed,
        [
          mergedConfig.bottomLine.speedFactor1,
          mergedConfig.bottomLine.speedFactor2,
          mergedConfig.bottomLine.speedFactor3
        ],
        false
      );

      return this.mapGroup;
    } catch (error) {
      console.error("初始化GeoGround失败:", error);
      return new Group3D();
    }
  }

  /**
   * 清理资源
   * 停止动画并清理所有创建的对象
   */
  public dispose(): void {
    if (!this.isInitialized) return;

    // 停止动画循环
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 停止时钟
    this.clock.stop();

    // 停止所有光柱动画
    this.lightPillarAnimations.clear();

    // 停止动画
    this.isInitialized = false;

    // 清理场景
    this.core.scene.remove(this.mapGroup);
    this.mapGroup.clear();

    // 清理地面组
    if (this.groundGroup) {
      this.core.scene.remove(this.groundGroup);
      this.groundGroup.clear();
      this.groundGroup = null;
    }

    // 清理粒子容器
    if (this.particleContainer) {
      this.core.scene.remove(this.particleContainer);
      this.particleContainer.clear();
      this.particleContainer = null;
    }

    this.flowingLines = [];
    this.lightPillars = [];
    this.elasticAnimations.clear();
    this.rotatingApertureMesh = null;
    this.rotatingPointMesh = null;
    this.provinceData = null;

    // 移除事件监听器
    coreEvent.off('POINT_MOVE', () => {});
    coreEvent.off('CORE_OBJECT_SELECTED', () => {});
  }

  public getParticleContainer(): THREE.Group | null {
    return this.particleContainer;
  }

  /**
   * 获取当前地理层级
   */
  public get geoLevel(): string {
    return this.currentGeoLevel;
  }

  /**
   * 设置当前地理层级
   */
  public set geoLevel(value: string) {
    this.currentGeoLevel = value;
    this.setHeightByLevel();
  }

  /**
   * 获取初始化状态
   */
  public get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 更新发光效果参数
   * @param color 发光颜色
   * @param width 发光宽度
   * @param intensity 发光强度
   * @param falloff 发光衰减
   */
  public updateGlowEffect(color: THREE.Color, width: number, intensity: number, falloff: number): void {
    this.mapGroup.traverse((child) => {
      if (child instanceof MeshObject3D && child.userData.shape === 'glowingShape') {
        const material = child.material as any;
        if (material.uniforms) {
          material.uniforms.glowColor.value.copy(color);
          material.uniforms.glowWidth.value = width;
          material.uniforms.glowIntensity.value = intensity;
          material.uniforms.glowFalloff.value = falloff;
          material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * 设置动画速度
   * @param speed 动画速度因子
   */
  public setAnimationSpeed(speed: number): void {
    // 这里可以添加设置动画速度的逻辑
  }

  /**
   * 启用/禁用动画
   * @param enabled 是否启用动画
   */
  public setAnimationEnabled(enabled: boolean): void {
    // 这里可以添加控制动画启用/禁用的逻辑
  }

  /**
   * 更新线条效果
   * @param lineColor 线条颜色
   * @param lineOpacity 线条透明度
   * @param glowColor 发光颜色
   * @param glowOpacity 发光透明度
   * @param glowSpeed 发光速度
   * @param speedFactors 速度因子数组
   * @param isTop 是否为上边框
   */
  public updateLineEffect(
    lineColor: THREE.Color,
    lineOpacity: number,
    glowColor: THREE.Color,
    glowOpacity: number,
    glowSpeed: number,
    speedFactors: number[],
    isTop: boolean
  ): void {    
    // 根据 isTop 参数选择要更新的线条
    const line = isTop ? this.flowingLines[0] : this.flowingLines[1];
    if (!line) {
      console.error('Line not found:', isTop ? 'top' : 'bottom');
      return;
    }


    // 更新基础线条材质
    line.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Line || child instanceof THREE.LineLoop || child instanceof THREE.LineSegments) {
        if (child.name === 'countryBaseLine') {
          if (child.material) {
            const material = child.material as THREE.ShaderMaterial;
            if (material.uniforms) {
              material.uniforms.color.value = new THREE.Color(lineColor);
              material.uniforms.opacity.value = lineOpacity;
              material.needsUpdate = true;
            }
          }
        } else if (child.name.startsWith('countrySpotLine')) {
          if (child.material) {
            const material = child.material as THREE.ShaderMaterial;
            if (material.uniforms) {
              const index = parseInt(child.name.replace('countrySpotLine', ''));
              material.uniforms.color.value = new THREE.Color(glowColor);
              material.uniforms.opacity.value = glowOpacity;
              material.uniforms.speed.value = glowSpeed * (speedFactors[index] || 1);
              material.needsUpdate = true;
            }
          }
        }
      }
    });
  }

  /**
   * 设置场景背景色
   * @param color 背景颜色，支持十六进制颜色值
   */
  public setBackgroundColor(color: string): void {
    this.core.sceneEffectTool.setBackground({
      type: 'color',
      color: color
    });
  }

  /**
   * 获取场景效果工具
   */
  public getSceneEffectTool() {
    return this.core.sceneEffectTool;
  }

  /**
   * 更新地面效果
   * @param params 地面效果参数
   */
  public updateGroundEffect(params: { groundColor?: string; markColor?: string; groundOpacity?: number }): void {
    this.mapGroup.traverse((child) => {
      if (child instanceof MeshObject3D && child.userData.type === 'EffectGround') {
        const material = child.material as unknown as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.color.value = new THREE.Color(params.markColor || '#000000');
          material.uniforms.flowColor.value = new THREE.Color(params.groundColor || '#000000');
          material.uniforms.alpha.value = params.groundOpacity || 1;
          material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * 设置光柱显示状态
   * @param visible 是否显示光柱
   */
  public setLightPillarsVisible(visible: boolean): void {
    this.lightPillars.forEach(light => {
      light.visible = visible;
    });
  }

  /**
   * 获取光柱显示状态
   */
  public getLightPillarsVisible(): boolean {
    return this.lightPillars.length > 0 ? this.lightPillars[0].visible : false;
  }

  /**
   * 设置材质参数
   * @param params 材质参数
   */
  public setMaterialParams(params: {
    topFaceColor?: string;
    topFaceOpacity?: number;
    sideFaceColor?: string;
    sideFaceOpacity?: number;
  }): void {
    this.mapGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = child.material;
        if (Array.isArray(materials)) {
          // 更新顶部材质
          const topMaterial = materials[0];
          if (topMaterial instanceof THREE.MeshLambertMaterial) {
            if (params.topFaceColor) {
              topMaterial.color.set(params.topFaceColor);
            }
            if (params.topFaceOpacity !== undefined) {
              topMaterial.opacity = params.topFaceOpacity;
              topMaterial.transparent = params.topFaceOpacity < 1;
            }
            topMaterial.needsUpdate = true;
          }
          // 更新侧面材质
          const sideMaterial = materials[1];
          if (sideMaterial instanceof THREE.MeshLambertMaterial) {
            if (params.sideFaceColor) {
              sideMaterial.color.set(params.sideFaceColor);
            }
            if (params.sideFaceOpacity !== undefined) {
              sideMaterial.opacity = params.sideFaceOpacity;
              sideMaterial.transparent = params.sideFaceOpacity < 1;
            }
            sideMaterial.needsUpdate = true;
          }
        }
      }
    });
  }
}

export default GeoGround;