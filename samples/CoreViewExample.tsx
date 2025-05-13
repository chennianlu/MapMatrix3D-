import React, { useEffect, useRef, useState } from 'react';
import { EnerV3DCore, selectionTool, coreEvent } from '../src/index';
import GeoGround from './tools';
import './CoreViewExample.css'; // 添加样式文件
import { darkConfig, lightConfig, getMapConfig } from './config';
import { GUIControl } from './utils/guiControl';
import { EffectGround, GroundParams } from '../src/objects/EffectObject3D/EffectGround';
import * as THREE from 'three';

// 使用模块级变量，在组件渲染周期之外维持状态
let globalCore: EnerV3DCore | null = null;
let globalInitialized = false;
let geoGround: GeoGround | null = null;
let mapHistory: string[] = []; // 使用数组作为历史记录栈

// 地图切换时的相机视角配置
const MAP_VIEW_CONFIG = {
  // 中国地图视角
  china: {
    "position": [1.4327863356484303, 77.13011599761127, 27.336628954353568],
    "target": [1.3106895574931972, -2.9202533634212418e-18, 1.161552804276242],
    time: 2000
  },
  // 省份地图视角
  province: {
    position: [0.1705719255849332, 7.450188295770979, 4.568885461364649] as number[],
    target: [0, 0, 0] as number[],
    time: 2000
  },
  // 城市地图视角
  city: {
    position: [0.40794936581001073, 17.818287388164478, 10.92720223466206] as number[],
    target: [0, 0, 0] as number[],
    time: 2000
  },
  // 区县地图视角
  district: {
    position: [0.40794936581001073, 17.818287388164478, 10.92720223466206] as number[],
    target: [0, 0, 0] as number[],
    time: 2000
  }
} as const;


// 定义地图类型
type MapType = keyof typeof MAP_VIEW_CONFIG;

const CoreViewExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);


  // 调整相机视角
  const adjustCameraView = (mapType: MapType) => {
    if (!globalCore) return;

    const config = MAP_VIEW_CONFIG[mapType];
    globalCore.cameraTool.flyWithCameraInfo({
      position: config.position,
      target: config.target,
      time: config.time,
      callback: () => {
        console.log(`相机视角已调整到${mapType}级别`);
      }
    });
  };

  // 加载地图数据
  const loadMap = async (jsonPath: string,  config?: any) => {
    if (!globalCore) return;

    setIsLoading(true);

    // 清理之前的实例
    if (geoGround) {
      geoGround.dispose();
      geoGround = null;
    }

    // 创建新实例
    geoGround = new GeoGround(globalCore);
    const guiControl = new GUIControl(geoGround, config);

    const customGround = new EffectGround({
      radius: 200,                    // 设置半径为200
      groundColor: config?.ground?.groundColor || '#ffffff',         // 设置地面颜色
      markColor: config?.ground?.markColor || '#ffffff',           // 设置标记颜色
      groundOpacity: config?.ground?.groundOpacity || 0.8,             // 设置地面透明度
      animation: true,               // 关闭动画
      markUrl: './assets/texture/光1.png',    // 设置标记贴图
      groundUrl: './assets/texture/地板线01.png', // 设置地面贴图
      glowEffect: {
        glowColor: config?.light?.glowColor || '#00aaff',
        glowWidth: config?.light?.glowWidth || 0.6,
        glowIntensity: config?.light?.glowIntensity || 0.7,
        glowFalloff: config?.light?.glowFalloff || 1.6
      }
    });
    globalCore.scene.add(customGround);
    globalCore.sceneEffectTool.setBackground({
      type: 'color',
      color: config?.background?.backgroundColor || '#eeeeee'
    });

    try {
      const mapGroup = await geoGround.init(jsonPath, config);
      if (globalCore) {
        // 更新可点击对象
        globalCore.selectionTool.setPickableObjects([mapGroup]);

        // 计算边界框
        const box = new THREE.Box3().setFromObject(mapGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 设置相机位置
        const camera = globalCore.camera;
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // 调整距离

        // 设置相机位置和朝向
        camera.position.set(center.x, center.y + cameraZ, center.z);
        camera.lookAt(center);

        // 更新控制器
        const controls = globalCore.orbitControls;
        controls.target.copy(center);
        controls.update();

        // 设置控制器限制
        controls.maxDistance = cameraZ * 2;
        controls.minDistance = cameraZ * 0.5;
      }
    } catch (error) {
      console.error('地图加载失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 确保容器元素已经渲染
    if (!containerRef.current) return;

    if (!globalInitialized) {
      console.log('初始化3D核心(首次)...');

      // 确保先清理已有实例
      if (globalCore) {
        if (globalCore.renderTool) {
          globalCore.renderTool.renderer.dispose();
        }
        globalCore = null;
      }

      // 创建新实例
      globalCore = new EnerV3DCore(containerRef.current);
      //@ts-ignore
      window.APP3D = globalCore;
      // 设置摄像机位置
      globalCore.camera.position.set(0, 30, 20);
      globalCore.camera.lookAt(0, 0, 0);

      // 监听点击事件
      coreEvent.on('CORE_OBJECT_SELECTED', (object: any) => {
        if (object) {
          if (object.userData.type === 'GeoGround') {
            console.log('CORE_OBJECT_SELECTED', object);

            // 获取点击的板块名称
            const areaName = object.name;

            // 从配置中获取对应的地图配置
            const mapConfig = getMapConfig(areaName);

            if (mapConfig) {
              // 调用loadMap方法加载新地图
              loadMap(mapConfig.url, lightConfig);
            } else {
              console.warn(`未找到 ${areaName} 的地图配置`);
            }
          }
        } else if (mapHistory.length > 1) {
          // 点击空白区域，返回上一个地图
          console.log('点击空白区域，返回上一个地图');
          // 移除当前地图
          mapHistory.pop();
          // 获取上一个地图
          const lastMap = mapHistory[mapHistory.length - 1];
          loadMap(lastMap, lightConfig);
        }
      });

      loadMap("./data/map/china.json", lightConfig);

      // 标记为已初始化
      globalInitialized = true;
      console.log('3D核心初始化完成');
    } else {
      console.log('3D核心已存在，跳过初始化');
    }

    // 组件卸载时清理资源
    // return () => {
    //   if (geoGround) {
    //     geoGround.dispose();
    //     geoGround = null;
    //   }
    //   mapHistory = []; // 清理历史记录
    //   console.log('组件卸载，清理GeoGround实例和历史记录');
    // };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Loading动画 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div className="loading-spinner"></div>
          <div style={{ color: 'white', fontSize: '16px' }}>地图加载中...</div>
        </div>
      )}


      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default CoreViewExample; 