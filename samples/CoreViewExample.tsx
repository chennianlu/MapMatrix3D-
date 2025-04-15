import React, { useEffect, useRef, useState } from 'react';
import { EnerV3DCore, GeometryObject3D } from '../src/index';
import { initScene } from './tools';

// 使用模块级变量，在组件渲染周期之外维持状态
let globalCore: EnerV3DCore | null = null;
let globalInitialized = false;

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
      
      // 初始化场景
      initScene(globalCore);
      
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