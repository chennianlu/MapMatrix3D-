import React, { useEffect, useRef } from 'react';
import { EnerV3DCore, selectionTool, BaseObject3D } from '../src/index';
import GeoGround from './tools';

// 使用模块级变量，在组件渲染周期之外维持状态
let globalCore: EnerV3DCore | null = null;
let globalInitialized = false;
let geoGround: GeoGround | null = null;


const CoreViewExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

      // 设置摄像机位置
      globalCore.camera.position.set(0, 30, 20);
      globalCore.camera.lookAt(0, 0, 0);
      // 初始化GeoGround  
      geoGround = new GeoGround(globalCore);
 
// 宁德市 四川省 中华人民共和国 福建省  广东省  上海市  china
      // 初始化场景
      geoGround.init("./data/map/china.json").then((mapGroup) => {
        if (globalCore) {
          const groups = mapGroup.children.filter((child) => child.userData.type === 'GeoGround');
          selectionTool.raycasterObjs = groups;
          console.log('地图组初始化完成:', mapGroup);
        }
      });

      // 标记为已初始化
      globalInitialized = true;
      console.log('3D核心初始化完成');
    } else {
      console.log('3D核心已存在，跳过初始化');
    }

    // 组件卸载时清理资源
    return () => {
      if (geoGround) {
        geoGround.dispose();
        geoGround = null;
      }
      console.log('组件卸载，清理GeoGround实例');
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
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