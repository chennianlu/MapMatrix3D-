import React, { useRef, useEffect, useState } from 'react';
import CoreViewExample from './CoreViewExample';

// 全局状态：跟踪组件是否已经被渲染
let isRendered = false;
let renderingComponent: React.ReactElement | null = null;

interface SingletonCoreViewProps {
  showGUI?: boolean;
}

const SingletonCoreView: React.FC<SingletonCoreViewProps> = ({ showGUI = false }) => {
  const [canRender, setCanRender] = useState(false);
  
  useEffect(() => {
    if (!isRendered) {
      console.log('SingletonCoreView: 首次渲染，允许创建CoreViewExample');
      isRendered = true;
      setCanRender(true);
    } else {
      console.log('SingletonCoreView: 已经渲染过，拒绝重复创建');
      setCanRender(false);
    }

    return () => {
      // 组件卸载时重置状态，允许下次渲染
      // 注意：如果你真的想要全局单例，可以注释掉这里
      // isRendered = false;
      // renderingComponent = null;
    };
  }, []);

  if (!canRender) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f0f0',
        color: '#666'
      }}>
        <div>
          <h3>CoreViewExample已在其他地方渲染</h3>
          <p>该组件只能渲染一次以避免资源冲突</p>
        </div>
      </div>
    );
  }

  // 缓存组件实例
  if (!renderingComponent) {
    renderingComponent = <CoreViewExample showGUI={showGUI} />;
  }

  return renderingComponent;
};

export default SingletonCoreView; 