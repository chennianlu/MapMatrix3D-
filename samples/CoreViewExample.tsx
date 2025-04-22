import React, { useEffect, useRef, useState } from 'react';
import { EnerV3DCore, coreEvent, selectionTool, BaseObject3D } from '../src/index';
import { initScene, addRiseAnimation, addFallAnimation } from './tools';
import { Object3DType } from '../src/types';

// 使用模块级变量，在组件渲染周期之外维持状态
let globalCore: EnerV3DCore | null = null;
let globalInitialized = false;

// 添加全局变量记录上一次拾取的省份
let lastPickedProvince: BaseObject3D | null = null;

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



      coreEvent.on('CORE_OBJECT_SELECTED', (object) => {
        if (object && object.userData.type === 'province') {
          console.log('CORE_OBJECT_SELECTED', object);
        }
      })

      coreEvent.on('POINT_MOVE', () => {
        const currentProvince = selectionTool.getPickedObject() as BaseObject3D;

        // 如果当前拾取的不是省份
        if (!currentProvince || currentProvince.userData.type !== 'province') {
          // 如果上一次有拾取的省份，触发下落动画
          if (lastPickedProvince) {
            addFallAnimation(lastPickedProvince);
            lastPickedProvince = null;
          }
          return;
        }

        // 如果当前拾取的是新的省份
        if (currentProvince !== lastPickedProvince) {
          // 如果上一次有拾取的省份，先触发下落动画
          if (lastPickedProvince) {
            addFallAnimation(lastPickedProvince);
          }
          
          // 记录新的省份并触发上升动画
          lastPickedProvince = currentProvince;
          addRiseAnimation(currentProvince);
        }
      })

      initScene(globalCore).then((mapGroup) => {
        if (globalCore) {
          const groups = mapGroup.children.filter((child) => child.userData.type === 'province');
          selectionTool.raycasterObjs = groups;
          console.log(mapGroup)
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
      // 不在这里清理，而是在应用真正关闭时清理
      console.log('组件卸载，但保留3D实例');
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