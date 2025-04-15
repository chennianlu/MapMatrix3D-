import * as THREE from "three"
import { ProvinceData } from './types';
import TWEEN from '@tweenjs/tween.js';
import { Group3D, BaseObject3D } from '../src/index';
import useConversionStandardData from "./hooks/useConversionStandardData"
// 使用TypeScript版本的useCountry
import useCountry from "./hooks/useCountry.ts"
import useMapMarkedLightPillar from "./hooks/map/useMapMarkedLightPillar.ts"
import useSequenceFrameAnimate from "./hooks/useSequenceFrameAnimate"
import { Widget3D } from '../src/objects/Widget3D';
import { WIDGET } from '../src/constants';

import type { EnerV3DCore } from '../src/APP';

// 随机数生成函数
const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// 全局时钟
const clock = new THREE.Clock();
// 全局引用
let flowingLines: any[] = [];
// 粒子数组
let particleArr: SequenceFrameMesh[] = [];
// 光柱数组
let lightPillars: THREE.Group[] = [];

// 添加新的动画更新函数
/**
 * 更新流光动画效果
 * 需要在渲染循环中调用此函数
 */
export const updateFlowingLines = () => {
  // 获取当前时间
  const time = clock.getElapsedTime();

  // 遍历所有流光线并更新
  flowingLines.forEach(line => {
    if (line && line.updateAnimation) {
      // 传递当前时间给updateAnimation方法
      line.updateAnimation(time);
    }
  });
};

/**
 * 添加要更新的流光线
 * @param {Object} line 带有updateAnimation方法的线条对象
 */
export const addFlowingLine = (line: any) => {
  if (line) {
    flowingLines.push(line);
  }
};

/**
 * 添加光柱到管理数组
 * @param {THREE.Group} lightPillar 光柱对象
 */
export const addLightPillar = (lightPillar: THREE.Group) => {
  if (lightPillar) {
    lightPillars.push(lightPillar);
    // 为光柱添加扩散动画属性
    initLightPillarDiffusion(lightPillar);
  }
};

/**
 * 初始化光柱扩散效果
 * @param {THREE.Group} lightPillar 光柱对象
 */
const initLightPillarDiffusion = (lightPillar: THREE.Group) => {
  // 查找光柱组中的光圈对象
  const lightHalo = lightPillar.children.find(child => child.name === 'createLightHalo');

  if (!lightHalo) return;

  // 初始化光圈的基本属性
  const initialScale = lightHalo.scale.x;
  const maxScale = initialScale * 2.5;

  // 添加扩散动画属性
  lightHalo.userData = {
    initialScale: initialScale,
    maxScale: maxScale,
    currentScale: initialScale,
    speed: 0.001 // 随机速度使得各个光圈的扩散效果不同步
  };
};

/**
 * 更新光柱扩散效果
 */
export const updateLightPillars = () => {
  lightPillars.forEach(lightPillar => {
    // 查找光柱组中的光圈对象
    const lightHalo = lightPillar.children.find(child => child.name === 'createLightHalo');

    if (!lightHalo || !lightHalo.userData) return;

    const { initialScale, maxScale, speed } = lightHalo.userData;

    // 光圈持续扩大
    lightHalo.userData.currentScale += speed;

    // 达到最大值时，立即重置为初始大小
    if (lightHalo.userData.currentScale >= maxScale) {
      lightHalo.userData.currentScale = initialScale;
    }

    // 应用缩放和透明度
    const scale = lightHalo.userData.currentScale;

    // 计算透明度 - 随着scale增大而减小，达到maxScale时为0
    const scaleRange = maxScale - initialScale;
    const scaleProgress = (scale - initialScale) / scaleRange;
    const opacity = 1 - scaleProgress; // 线性减小透明度

    lightHalo.scale.set(scale, scale, scale);
    ((lightHalo as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = opacity;
  });
};

// 定义带有updateSequenceFrame方法的接口
interface SequenceFrameMesh extends THREE.Mesh {
  updateSequenceFrame: (time: number) => void;
  speed?: number; // 上升速度
  lifecycle?: number; // 生命周期
  maxLifecycle?: number; // 最大生命周期
  startY?: number; // 初始Y位置
  startX?: number; // 初始X位置
}

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
const { createLightPillar } = useMapMarkedLightPillar({
  scaleFactor: 1.2,
})
const { createCountryFlatLine } = useCountry()
const { createSequenceFrame } = useSequenceFrameAnimate()

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

// 初始化粒子
const initParticle = (scene: THREE.Scene, bound: { center: THREE.Vector3, size: THREE.Vector3 }): SequenceFrameMesh[] => {
  // 获取中心点和中间地图大小
  let { center, size } = bound;
  // 构建范围，中间地图的2倍
  let minX = center.x - size.x;
  let maxX = center.x + size.x;
  let minY = center.y - size.y;
  let maxY = center.y + size.y;
  let minZ = -6;
  let maxZ = 6;

  let particles: SequenceFrameMesh[] = [];
  for (let i = 0; i < 16; i++) {
    const particle = createSequenceFrame({
      image: "./data/map/上升粒子1.png",
      width: 180,
      height: 189,
      frame: 9,
      column: 9,
      row: 1,
      speed: 0.5,
    });

    let particleScale = random(5, 10) / 1000;
    particle.scale.set(particleScale, particleScale, particleScale);
    particle.rotation.y = Math.PI / 2;

    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let z = random(minZ, maxZ);

    particle.position.set(x, y, z);

    // 添加粒子上升动画的属性
    particle.speed = random(0.002, 0.01);  // 上升速度
    particle.lifecycle = 0;  // 当前生命周期
    particle.maxLifecycle = random(100, 200);  // 最大生命周期
    particle.startY = y;  // 初始Y位置
    particle.startX = x;  // 初始X位置

    scene.add(particle);
    particles.push(particle);
  }

  return particles;
}

const initModel = async (param: {
  topFaceMaterial: THREE.MeshPhongMaterial,
  sideMaterial: THREE.MeshLambertMaterial,
  scene: THREE.Scene,
}) => {
  const { topFaceMaterial, sideMaterial, scene } = param;
  console.log('CurrentMap3d: 开始初始化模型...');
  const mapGroup = new Group3D();

  // 创建包围盒用于跟踪所有地图几何体
  const boundingBox = new THREE.Box3();

  provinceData.features.forEach((elem: Feature) => {
    // 定一个省份对象
    const province = new BaseObject3D();
    // 坐标
    const coordinates = elem.geometry.coordinates;
    // city 属性
    const properties = elem.properties;

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
        const mesh = new THREE.Mesh(geometry, [topFaceMaterial, sideMaterial]);

        // 更新网格的世界矩阵以确保包围盒计算正确
        mesh.updateMatrixWorld(true);

        // 计算当前mesh的包围盒并扩展总包围盒
        boundingBox.expandByObject(mesh);
        province.add(mesh);
      });
    });
    mapGroup.add(province);

    // 使用工具函数创建光柱
    if (properties.centroid || properties.center) {
      const point = properties.centroid || properties.center;
      if (point) {
        let heightScaleFactor = 0.4 + Math.random() * 2;

        const light = createLightPillar(point[0], point[1], heightScaleFactor);
        light.position.z = 0.31;
        mapGroup.add(light);

        // 添加到光柱管理数组
        addLightPillar(light);
      }
    }

    // 使用工具函数创建标签
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

        textWidget.init().then(widget => {
          // 设置位置
          widget.position.set(point[0] + radioScale, point[1] + radioScale, 0.5);
          // 添加到地图组
          mapGroup.add(widget);
        });
      }
    }
  });
  console.log('CurrentMap3d: 创建边框...');
  // 创建上下边框 - 流光线
  const lineTop = createCountryFlatLine(
    provinceData,
    {
      lineColor: 0xffffff,    // 白色基础线 
      lineOpacity: 0.6,       // 基础线透明度
      glowColor: 0x80ffff,    // 淡蓝色光斑
      glowOpacity: 1,       // 光斑透明度
      glowSpeed: 2.0,         // 流动速度
      speedFactors: [1.2, 0.6, -0.8],  // 速度因子
      depthTest: false        // 深度测试
    },
    "LineLoop"
  );
  lineTop.position.z += 0.305;

  const lineBottom = createCountryFlatLine(
    provinceData,
    {
      lineColor: 0x61fbfd,    // 青色基础线
      lineOpacity: 0.8,       // 基础线透明度
      glowColor: 0x00ffff,    // 亮青色光斑
      glowOpacity: 0,       // 光斑透明度
      glowSpeed: 0,         // 流动速度
      speedFactors: [1.5, 0.7, -1.0],  // 速度因子
      depthTest: false        // 深度测试
    },
    "LineLoop"
  );
  lineBottom.position.z -= 0.1905;

  // 添加边线
  mapGroup.add(lineTop);
  mapGroup.add(lineBottom);

  // 添加到全局流光线数组中
  addFlowingLine(lineTop);
  addFlowingLine(lineBottom);

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
  particleArr = initParticle(scene, {
    center: mapCenter,
    size: mapSize
  });


}

/**
 * 更新粒子动画
 * @param {SequenceFrameMesh[]} particles 粒子数组
 * @param {number} time 当前时间
 */
export const updateParticles = (particles: SequenceFrameMesh[], time: number) => {
  particles.forEach(particle => {
    if (particle && particle.updateSequenceFrame) {
      // 更新序列帧
      particle.updateSequenceFrame(time);

      // 更新粒子位置 - 沿Y轴上升
      if (particle.speed && particle.lifecycle !== undefined && particle.maxLifecycle !== undefined &&
        particle.startY !== undefined && particle.startX !== undefined) {

        // 增加生命周期
        particle.lifecycle += 1;

        // 向上移动
        particle.position.y += particle.speed;

        // 当达到最大生命周期时，重置粒子位置
        if (particle.lifecycle >= particle.maxLifecycle) {
          particle.position.y = particle.startY;
          particle.position.x = particle.startX;
          particle.lifecycle = 0;
        }
      }
    }
  });
};

export const initScene = async (core: EnerV3DCore) => {

  // 获取场景实例
  const scene = core.scene;

  // 1. 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

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

  const topFaceMaterial = new THREE.MeshPhongMaterial({
    map: textureMap,
    color: 0xb4eeea,
    combine: THREE.MultiplyOperation,
    transparent: true,
    opacity: 1,
  })
  const sideMaterial = new THREE.MeshLambertMaterial({
    color: 0x123024,
    transparent: true,
    opacity: 0.9,
  })
  const bottomZ = -0.2

  const data = await loadMapData(core.loader)
  console.log('地图数据加载完成，开始转换...');
  if (!data) {
    console.error("无法加载地图数据");
    return;
  }

  const convertedData = transfromGeoJSON(data);
  if (!convertedData) {
    console.error("地图数据转换失败");
    return;
  }

  // 使用类型断言确保TypeScript知道这是正确的类型
  provinceData = convertedData as ProvinceData;
  console.log('地图数据转换成功，包含省份数量:', provinceData.features?.length);

  if (!provinceData.features || !Array.isArray(provinceData.features)) {
    console.error("地图数据格式不正确");
    return;
  }
  // 准备创建地图
  console.log("准备创建地图");

  await initModel({
    topFaceMaterial,
    sideMaterial,
    scene,
  })

  // 设置动画循环
  function animate() {
    requestAnimationFrame(animate);

    // 获取时间，确保流光效果能随时间变化
    const time = clock.getElapsedTime();

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
};