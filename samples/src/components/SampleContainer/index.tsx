import React from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

interface SampleContainerProps {
  children: React.ReactNode;
}

// 路由标题映射
const routeTitleMap: Record<string, string> = {
  '/core-geometry-demo': '核心几何体展示',
  '/event-demo': '事件管理展示',
};

const SampleContainer: React.FC<SampleContainerProps> = ({
  children,
}) => {
  const location = useLocation();
  const currentTitle = routeTitleMap[location.pathname] || '未知页面';

  return (
    <div className="sample-container">
      <div className="sample-navbar">
        <div className="navbar-content">
          <Breadcrumb
            items={[
              {
                href: '/',
                title: <HomeOutlined />,
              },
              {
                title: '3D案例',
              },
              {
                title: currentTitle,
              },
            ]}
          />
        </div>
      </div>
      <div className="sample-content">{children}</div>
    </div>
  );
};

export default SampleContainer; 