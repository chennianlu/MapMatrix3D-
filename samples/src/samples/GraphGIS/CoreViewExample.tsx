import React, { useEffect, useRef, useState } from 'react';
import { EnerV3DCore, selectionTool, coreEvent } from '@enerv-3d/core';
import GeoGround from './tools';
import './CoreViewExample.css'; // 添加样式文件
import { darkConfig, lightConfig, getMapConfig } from './config';
import { GUIControl } from './utils/guiControl';
import { initMapCore, loadMap } from './utils/mapLoader';

// 使用模块级变量，在组件渲染周期之外维持状态
let globalCore: EnerV3DCore | null = null;
let globalInitialized = false;
let geoGround: GeoGround | null = null;
let mapHistory: string[] = []; // 使用数组作为历史记录栈

// 地图切换时的相机视角配置
const MAP_VIEW_CONFIG = {
  // 中国地图视角
  china: {
    position: [1.4327863356484303, 77.13011599761127, 27.336628954353568] as number[],
    target: [1.3106895574931972, -2.9202533634212418e-18, 1.161552804276242] as number[],
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

interface CoreViewExampleProps {
  showGUI?: boolean;
}

const CoreViewExample: React.FC<CoreViewExampleProps> = ({ showGUI = false }) => {
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
  const handleLoadMap = async (jsonPath: string, config?: any) => {
    setIsLoading(true);
    try {
      await loadMap(jsonPath, config);
      mapHistory.push(jsonPath);
    } catch (error) {
      console.error('地图加载失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

      // 初始化地图核心
      globalCore = initMapCore(containerRef.current);
      globalInitialized = true;

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
              handleLoadMap(mapConfig.url, lightConfig);
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
          handleLoadMap(lastMap, lightConfig);
        }
      });

      // 加载初始地图
      handleLoadMap("/data/map/china.json", lightConfig);
    }

    // 根据showGUI属性决定是否初始化GUI控制
    if (showGUI && globalCore) {
      const guiControl = new GUIControl(geoGround!, lightConfig);
    }

    return () => {
      if (geoGround) {
        geoGround.dispose();
        geoGround = null;
      }
      mapHistory = []; // 清理历史记录
      console.log('组件卸载，清理GeoGround实例和历史记录');
    };
  }, [showGUI]);

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
          height: '100%',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

// 使用React.memo来防止不必要的重新渲染
export default React.memo(CoreViewExample); 