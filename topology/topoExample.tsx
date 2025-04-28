import React, { useEffect, useRef, useState } from 'react';
import { SystemAPP } from '../packages/APP';
import './topoExample.css';
import * as THREE from 'three';
import { json } from './topojson';
import { initCore } from './utils/loader';
// 使用模块级变量，在组件渲染周期之外维持状态
let APP3D: SystemAPP | null = null;
let globalInitialized = false;



const CoreViewExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    // 确保容器元素已经渲染
    if (!containerRef.current) return;

    if (!globalInitialized) {
      console.log('初始化3D核心(首次)...');

      // 确保先清理已有实例
      if (APP3D) {
      
        APP3D = null;
      }
   
      // 创建新实例
      APP3D = new SystemAPP({container:containerRef.current});
      //@ts-ignore
      window.APP3D = APP3D;
      // 设置摄像机位置
 
            const axesHelper = new THREE.AxesHelper(5);
            APP3D.core.scene.add(axesHelper);
      // 标记为已初始化
      globalInitialized = true;
      console.log('3D核心初始化完成');
      // 加载拓扑数据
      initCore(APP3D, json.topology);
    } else {
      console.log('3D核心已存在，跳过初始化');
    }
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