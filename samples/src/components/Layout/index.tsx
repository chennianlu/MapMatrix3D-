import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  BulbOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider, Content } = AntLayout;

// 菜单配置 - 基础能力一级菜单
const menuItems = [
  {
    key: 'basic-capabilities',
    icon: <SettingOutlined />,
    label: '基础能力',
    children: [
      {
        key: '/core-geometry-demo',
        icon: <BulbOutlined />,
        label: '核心几何体展示',
      },
      {
        key: '/event-demo',
        icon: <ThunderboltOutlined />,
        label: '内置事件',
      },
      {
        key: '/object-event-demo',
        icon: <ThunderboltOutlined />,
        label: '物体事件',
      },
    ],
  },
  {
    key: 'gis-capabilities',
    icon: <SettingOutlined />,
    label: '地图GIS',
    children: [
      {
        key: '/graph-gis',
        icon: <SettingOutlined />,
        label: 'GraphGIS',
      },
    ],
  },
];

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  return (
    <div className="layout-container">
      <Sider className="sidebar" theme="dark">
        <div style={{ 
          color: 'white', 
          textAlign: 'center', 
          padding: '16px 0', 
          fontSize: '18px',
          fontWeight: 'bold',
          borderBottom: '1px solid #404040'
        }}>
          3D案例展示
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['basic-capabilities']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 