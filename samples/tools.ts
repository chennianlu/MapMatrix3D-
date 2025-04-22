/**
 * @file 场景工具与初始化入口
 * @description 提供场景初始化、3D效果管理与更新控制的功能。
 * 该文件是3D场景的入口点，负责初始化场景、加载地图数据、
 * 管理各种视觉效果(流光线、光柱、粒子)并实现动画循环。
 */
import * as THREE from "three"
import { ProvinceData } from './types';
import TWEEN from '@tweenjs/tween.js';
import { Group3D, BaseObject3D } from '../src/index';
import { MeshObject3D } from '../src/objects/MeshObject3D';
import useConversionStandardData from "./hooks/useConversionStandardData"
import useCountry from "./hooks/useCountry.ts"
import useMapMarkedLightPillar from "./hooks/map/useMapMarkedLightPillar.ts"
import useSequenceFrameAnimate from "./hooks/useSequenceFrameAnimate"
import { Widget3D } from '../src/objects/Widget3D';
import { WIDGET } from '../src/constants';
import type { EnerV3DCore } from '../src/APP';

import { createGlowingShape } from './utils/glowingShape';
import { initParticles, updateParticles, SequenceFrameMesh } from './utils/particleEffects';
import { updateLightPillars as updateLightPillarEffects } from './utils/lightPillarEffects';
import { transformGeoJSON } from './utils/geoDataUtils';

// 全局时钟
const clock = new THREE.Clock();
// 全局引用
let flowingLines: any[] = [];
// 粒子数组
let particleArr: SequenceFrameMesh[] = [];
// 光柱数组
let lightPillars: THREE.Group[] = [];

// 修改弹性动画相关的变量
const elasticAnimations = new Map<BaseObject3D, {
  targetY: number;
  velocity: number;
  damping: number;
  stiffness: number;
  initialY: number;
  isAnimating: boolean;
  isRising: boolean;
  originalGlowColor?: THREE.Color;
}>();

/**
 * 查找发光形状网格
 * @param object 要查找的对象
 * @returns 发光形状网格数组
 */
const findGlowingShapes = (object: BaseObject3D): MeshObject3D[] => {
  const glowingShapes: MeshObject3D[] = [];
  object.traverse((child) => {
    if (child instanceof MeshObject3D && child.userData.shape === 'glowingShape') {
      glowingShapes.push(child);
    }
  });
  return glowingShapes;
};

/**
 * 设置发光效果参数
 * @param shape 发光形状网格
 * @param isRising 是否在上升状态
 */
const setGlowEffect = (shape: MeshObject3D, isRising: boolean) => {
  const material = shape.material as THREE.ShaderMaterial;
  if (isRising) {
    // 上升时设置更强烈的发光效果
    material.uniforms.glowColor.value.set(0xffa500); // 改为橙黄色
    material.uniforms.glowWidth.value = 0.8; // 增加发光宽度
    material.uniforms.glowIntensity.value = 0.6; // 发光强度
    material.uniforms.glowFalloff.value = 1.5; // 减小衰减，使发光更均匀
  } else {
    // 恢复原始发光效果
    material.uniforms.glowColor.value.set(0x00aaff); // 恢复为蓝色
    material.uniforms.glowWidth.value = 0.5; // 恢复原始宽度
    material.uniforms.glowIntensity.value = 0.6; // 恢复原始强度
    material.uniforms.glowFalloff.value = 1.8; // 恢复原始衰减
  }
};

/**
 * 更新流光动画效果
 * 需要在渲染循环中调用此函数
 */
export const updateFlowingLines = () => {
  const time = clock.getElapsedTime();
  flowingLines.forEach(line => {
    if (line && line.updateAnimation) {
      line.updateAnimation(time);
    }
  });
};

/**
 * 添加要更新的流光线
 * @param line 带有updateAnimation方法的线条对象
 */
export const addFlowingLine = (line: any) => {
  if (line) {
    flowingLines.push(line);
  }
};

/**
 * 添加光柱到管理数组
 * @param lightPillar 光柱对象
 */
export const addLightPillar = (lightPillar: THREE.Group) => {
  if (lightPillar) {
    lightPillars.push(lightPillar);
    initLightPillarDiffusion(lightPillar);
  }
};

/**
 * 初始化光柱扩散效果
 * @param lightPillar 光柱对象
 */
const initLightPillarDiffusion = (lightPillar: THREE.Group) => {
  const lightHalo = lightPillar.children.find(child => child.name === 'createLightHalo');
  if (!lightHalo) return;

  const initialScale = lightHalo.scale.x;
  const maxScale = initialScale * 2.5;

  lightHalo.userData = {
    initialScale: initialScale,
    maxScale: maxScale,
    currentScale: initialScale,
    speed: 0.001
  };
};

/**
 * 更新光柱扩散效果
 */
export const updateLightPillars = () => {
  // 对于每个内部需要自定义更新的光柱进行处理
  lightPillars.forEach(lightPillar => {
    const lightHalo = lightPillar.children.find(child => child.name === 'createLightHalo');
    if (!lightHalo || !lightHalo.userData) return;

    const { initialScale, maxScale, speed } = lightHalo.userData;
    lightHalo.userData.currentScale += speed;

    if (lightHalo.userData.currentScale >= maxScale) {
      lightHalo.userData.currentScale = initialScale;
    }

    const scale = lightHalo.userData.currentScale;
    const scaleRange = maxScale - initialScale;
    const scaleProgress = (scale - initialScale) / scaleRange;
    const opacity = 1 - scaleProgress;

    lightHalo.scale.set(scale, scale, scale);
    ((lightHalo as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = opacity;
  });
  
  // 使用新工具模块来更新动态光柱效果
  updateLightPillarEffects(lightPillars as any);
};

// 定义省份相关类型
interface Feature {
  geometry: {
    coordinates: number[][][][];
  };
  properties: {
    name: string;
    centroid?: [number, number];
    center?: [number, number];
  };
}

let provinceData: ProvinceData
const { transfromGeoJSON } = useConversionStandardData()
const { createLightPillar: createMapLightPillar } = useMapMarkedLightPillar({
  scaleFactor: 1.2,
})
const { createCountryFlatLine } = useCountry()
const { createSequenceFrame } = useSequenceFrameAnimate()

/**
 * 加载地图数据
 * @param loader 加载器实例
 * @returns 加载的地图数据或null
 */
const loadMapData = async (loader: EnerV3DCore["loader"]) => {
  try {
    const data = await loader.requestData("./data/map/四川省.json");
    console.log("四川省地图数据:", data);
    return data;
  } catch (error) {
    console.error("加载四川省地图数据失败", error);
    return null;
  }
};

/**
 * 创建地图边框线
 * @param provinceData 省份数据
 * @param renderOrder 渲染顺序，值越大越后渲染
 * @returns 包含上下边框的组
 */
const createBorderLines = (provinceData: ProvinceData, renderOrder: number = 0) => {
  // 创建上边框 - 流光线
  const lineTop = createCountryFlatLine(
    provinceData,
    {
      lineColor: 0x00ffff,    // 青色基础线，增加科幻感
      lineOpacity: 0.2,       // 基础线透明度
      glowColor: 0x00aaff,    // 更深的蓝色光斑
      glowOpacity: 2.0,       // 进一步提高光斑透明度
      glowSpeed: 1.0,         // 进一步提高流动速度
      speedFactors: [1.8, 1.0, -1.2]  // 调整速度因子，使流光更加分散
    },
    "LineLoop",
    2  // 设置较高的渲染顺序
  );
  lineTop.position.z += 0.2;

  const lineBottom = createCountryFlatLine(
    provinceData,
    {
      lineColor: 0x61fbfd,    // 青色基础线
      lineOpacity: 0.5,       // 基础线透明度
      glowColor: 0x00ffff,    // 亮青色光斑
      glowOpacity: 0.01,       // 光斑透明度
      glowSpeed: 0,         // 关闭流动效果
      speedFactors: [1.5, 0.7, -1.0]  // 速度因子
    },
    "LineLoop",
    -1  // 设置较低的渲染顺序
  );
  lineBottom.position.z -= 0.2;

  // 创建边框组
  const borderGroup = new Group3D();
  borderGroup.add(lineTop);
  borderGroup.add(lineBottom);

  // 添加到全局流光线数组中
  addFlowingLine(lineTop);
  addFlowingLine(lineBottom);
  borderGroup.pickedEnable = false;
  return borderGroup;
};

/**
 * 创建文字标签
 * @param properties 省份属性
 * @param province 省份对象，作为文字标签的父节点
 */
const createTextLabel = (properties: any, province: BaseObject3D) => {
  if (properties.centroid || properties.center) {
    const point = properties.centroid || properties.center;
    if (point && properties.name) {
      // 计算适当的宽度，基于文本长度
      const textLength = properties.name.length;
      const radioScale = 0.2;
      const calculatedWidth = textLength * radioScale;
      // 确保最小宽度
      const width = Math.max(calculatedWidth, radioScale);

      // 创建文字标签
      const textWidget = new Widget3D({
        type: WIDGET.TEXT_2D,
        width: width,
        height: radioScale,
        textParam: {
          text: properties.name,
          fontSize: 32,
          color: '#ffffff'
        }
      });
      textWidget.pickedEnable = false;
      textWidget.init().then(widget => {
        // 设置位置
        widget.position.set(point[0] + radioScale, point[1] + radioScale, 0.5);
        // 添加到省份节点
        province.add(widget);
        province.name = properties.name;
      });
    }
  }
};

/**
 * 添加上升动画
 * @param object 要添加动画的对象
 */
export const addRiseAnimation = (object: BaseObject3D) => {
  // 如果已经在上升动画中，直接返回
  if (elasticAnimations.has(object) && elasticAnimations.get(object)!.isAnimating) {
    return;
  }

  // 记录初始位置
  const initialY = object.position.y;
  const targetY = initialY + 0.15; // 上升高度
  
  // 查找所有发光形状并设置发光效果
  const glowingShapes = findGlowingShapes(object);
  glowingShapes.forEach(shape => {
    setGlowEffect(shape, true);
  });
  
  // 添加新的动画
  elasticAnimations.set(object, {
    targetY,
    velocity: 0,
    damping: 0.1,  // 较小的阻尼，使上升缓慢
    stiffness: 0.05, // 较小的弹性，使上升平滑
    initialY,
    isAnimating: true,
    isRising: true
  });
};

/**
 * 添加下落动画
 * @param object 要添加动画的对象
 */
export const addFallAnimation = (object: BaseObject3D) => {
  const animation = elasticAnimations.get(object);
  if (!animation) return;

  // 查找所有发光形状并恢复原始发光效果
  const glowingShapes = findGlowingShapes(object);
  glowingShapes.forEach(shape => {
    setGlowEffect(shape, false);
  });

  // 设置下落动画
  elasticAnimations.set(object, {
    targetY: animation.initialY,
    velocity: 0,
    damping: 0.2,  // 较大的阻尼，使下落快速
    stiffness: 0.05,
    initialY: animation.initialY,
    isAnimating: true,
    isRising: false
  });
};

/**
 * 创建省份对象
 * @param coordinates 省份坐标数据
 * @param properties 省份属性
 * @param topFaceMaterial 顶部材质
 * @param sideMaterial 侧面材质
 * @returns 创建的省份对象
 */
const createProvince = (
  coordinates: number[][][][],
  properties: any,
  topFaceMaterial: THREE.Material,
  sideMaterial: THREE.Material
): BaseObject3D => {
  // 创建省份对象
  const province = new BaseObject3D();
  
  // 循环坐标
  coordinates.forEach((multiPolygon: number[][][]) => {
    multiPolygon.forEach((polygon: number[][]) => {
      const shape = new THREE.Shape();
      // 绘制shape
      for (let i = 0; i < polygon.length; i++) {
        const [x, y] = polygon[i];
        if (i === 0) {
          shape.moveTo(x, y);
        }
        shape.lineTo(x, y);
      }
      
      // 拉伸设置
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelThickness: 0.1,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new MeshObject3D(geometry, [topFaceMaterial, sideMaterial]);

      // 更新网格的世界矩阵以确保包围盒计算正确
      mesh.updateMatrixWorld(true);
      
      // 中心发光效果示例 - 从中心向外渐变
      createGlowingShape(shape, {
        parentObject: mesh,
        glowColor: new THREE.Color(0x00aaff), // 青色发光
        glowWidth: 0.5,    // 发光区域宽度较大，覆盖更多区域
        glowIntensity: 0.6, // 发光强度适中
        glowFalloff: 1.8,  // 较平缓的衰减，使过渡更平滑
        glowType: 'center' // 中心发光效果
      });
      
      province.add(mesh);
    });
  });

  // 创建光柱
  if (properties.centroid || properties.center) {
    const point = properties.centroid || properties.center;
    if (point) {
      let heightScaleFactor = 1 + Math.random() * 1;
      const light = createMapLightPillar(point[0], point[1], heightScaleFactor);
      light.position.z = 0.31;
      province.add(light);
      // 添加到光柱管理数组
      addLightPillar(light);
    }
  }

  // 创建文字标签
  createTextLabel(properties, province);

  // 设置省份类型
  province.userData.type = 'province';

  // 添加鼠标事件
  province.addEventListener('mouseenter', () => {
    // 鼠标进入时向上弹起
    addRiseAnimation(province);
  });

  province.addEventListener('mouseleave', () => {
    // 鼠标离开时恢复原状
    addFallAnimation(province);
  });

  return province;
};

/**
 * 初始化3D模型
 * @param param 初始化参数
 */
const initModel = async (param: {
  topFaceMaterial: THREE.Material,
  sideMaterial: THREE.Material,
  scene: THREE.Scene,
}) => {
  const { topFaceMaterial, sideMaterial, scene } = param;
  console.log('CurrentMap3d: 开始初始化模型...');
  const mapGroup = new Group3D();
  // 创建包围盒用于跟踪所有地图几何体
  const boundingBox = new THREE.Box3();
  
  provinceData.features.forEach((elem: Feature) => {
    // 使用封装的函数创建省份
    const province = createProvince(
      elem.geometry.coordinates,
      elem.properties,
      topFaceMaterial,
      sideMaterial
    );
    
    // 计算当前省份的包围盒并扩展总包围盒
    boundingBox.expandByObject(province);
    mapGroup.add(province);
  });
  
  console.log('CurrentMap3d: 创建边框...');
  // 创建边框线，设置较高的渲染顺序
  const borderGroup = createBorderLines(provinceData, 100);
  mapGroup.add(borderGroup);

  // 先进行旋转
  mapGroup.rotation.x = THREE.MathUtils.degToRad(-90);

  // 更新世界矩阵，确保旋转生效
  mapGroup.updateMatrixWorld(true);

  // 旋转后重新计算包围盒
  const rotatedBoundingBox = new THREE.Box3().setFromObject(mapGroup);
  const center = rotatedBoundingBox.getCenter(new THREE.Vector3());

  // 将mapGroup向相反方向偏移，使包围盒中心与原点对齐
  mapGroup.position.set(-center.x, -center.y, -center.z);

  // 将组添加到场景中
  scene.add(mapGroup);

  // 创建粒子效果
  console.log('创建粒子效果...');
  // 计算场景边界用于粒子位置
  const mapBounds = new THREE.Box3().setFromObject(mapGroup);
  const mapSize = mapBounds.getSize(new THREE.Vector3());
  const mapCenter = mapBounds.getCenter(new THREE.Vector3());

  // 使用封装的初始化粒子函数
  particleArr = initParticles(scene, {
    center: mapCenter,
    size: mapSize
  }, createSequenceFrame);

  return mapGroup;
};

/**
 * 初始化场景
 * @param core 核心引擎实例
 * @returns 返回地图组对象
 */
export const initScene = async (core: EnerV3DCore): Promise<Group3D> => {
  // 获取场景实例
  const scene = core.scene;

  // // 1. 添加坐标轴辅助
  // const axesHelper = new THREE.AxesHelper(10);
  // scene.add(axesHelper);
  
  // 设置摄像机位置，朝向测试平面
  core.camera.position.set(0, -30, 20);
  core.camera.lookAt(0, 0, 20);
  console.log('摄像机已指向测试平面位置');

  const texture = core.loader.textureLoader
  texture.setPath("/data/map/");
  const textureMap = texture.load("gz-map.jpg")
  const texturefxMap = texture.load("gz-map-fx.jpg")

  textureMap.wrapS = texturefxMap.wrapS = THREE.RepeatWrapping
  textureMap.wrapT = texturefxMap.wrapT = THREE.RepeatWrapping
  textureMap.flipY = texturefxMap.flipY = false
  textureMap.rotation = texturefxMap.rotation = THREE.MathUtils.degToRad(45)
  const scale = 0.128
  textureMap.repeat.set(scale, scale)
  texturefxMap.repeat.set(scale, scale)

  const topFaceMaterial: THREE.Material = new THREE.MeshLambertMaterial({
    color: 0x123024,
    transparent: true,
    opacity: 0, // todo
  });

  const sideMaterial = new THREE.MeshLambertMaterial({
    color: 0x123024,
    transparent: true,
    opacity: 0.9, // todo
  });

  // 加载数据
  const data = await loadMapData(core.loader)
  console.log('地图数据加载完成，开始转换...');
  if (!data) {
    console.error("无法加载地图数据");
    return new Group3D();
  }

  // 转换数据结构，统一格式
  const convertedData = transformGeoJSON(data);
  if (!convertedData) {
    console.error("地图数据转换失败");
    return new Group3D();
  }

  // 使用类型断言确保TypeScript知道这是正确的类型
  provinceData = convertedData as ProvinceData;
  console.log('地图数据转换成功，包含省份数量:', provinceData.features?.length);

  if (!provinceData.features || !Array.isArray(provinceData.features)) {
    console.error("地图数据格式不正确");
    return new Group3D();
  }

  // 准备创建地图
  console.log("准备创建地图");
  const mapGroup = await initModel({
    topFaceMaterial,
    sideMaterial,
    scene,
  });

  // 设置动画循环
  function animate() {
    requestAnimationFrame(animate);

    // 获取时间，确保流光效果能随时间变化
    const time = clock.getElapsedTime();

    // 更新弹性动画
    elasticAnimations.forEach((animation, object) => {
      const { targetY, velocity, damping, stiffness, initialY, isAnimating, isRising } = animation;
      
      // 计算弹性力
      const force = -stiffness * (object.position.y - targetY);
      
      // 更新速度（考虑阻尼）
      animation.velocity += force;
      animation.velocity *= (1 - damping);
      
      // 更新位置
      object.position.y += animation.velocity;
      
      // 如果动画已经稳定
      if (Math.abs(animation.velocity) < 0.001 && Math.abs(object.position.y - targetY) < 0.001) {
        // 强制设置到目标位置
        object.position.y = targetY;
        
        // 如果是下落动画且到达目标位置，则完全移除动画
        if (!isRising && Math.abs(targetY - initialY) < 0.001) {
          // 确保位置完全准确
          object.position.y = initialY;
          elasticAnimations.delete(object);
        } else {
          // 否则标记动画结束
          animation.isAnimating = false;
        }
      }
    });

    // 在每帧更新流光效果
    updateFlowingLines();

    // 更新粒子动画
    updateParticles(particleArr, time);

    // 更新光柱扩散效果
    updateLightPillars();

    // 更新TWEEN动画
    TWEEN.update();
  }

  // 确保立即启动动画循环
  animate();

  return mapGroup;
};

//