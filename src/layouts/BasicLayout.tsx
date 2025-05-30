import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  ProLayout,
  PageContainer,
  ProConfigProvider,
  SettingDrawer,
} from '@ant-design/pro-components';
import type { ProSettings } from '@ant-design/pro-components';
import { ConfigProvider, theme } from 'antd';
import { removeToken } from '../utils/auth';
import { menuConfig } from '../router/routes';

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState<ProSettings>({
    fixSiderbar: true,
    layout: 'side',
    splitMenus: false,
    navTheme: 'light',
    colorPrimary: '#1677ff',
  });

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  return (
    <ProConfigProvider hashed={false}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <ProLayout
          title="能源大数据可视化平台"
          logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          route={{
            path: '/',
            routes: menuConfig,
          }}
          location={{
            pathname: location.pathname,
          }}
          menu={{
            type: 'sub',
            defaultOpenAll: true,
          }}
          avatarProps={{
            src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
            title: '管理员',
            render: (props, dom) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={handleLogout}
              >
                {dom}
              </div>
            ),
          }}
          menuItemRender={(item, dom) => (
            <div 
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {dom}
            </div>
          )}
          {...settings}
          breadcrumbRender={false}
          menuHeaderRender={false}
          fixSiderbar={true}
          fixedHeader={true}
          layout="side"
          navTheme="light"
          splitMenus={false}
          suppressSiderWhenMenuEmpty={true}
        >
          <PageContainer>
            <Outlet />
          </PageContainer>
          <SettingDrawer
            pathname={location.pathname}
            enableDarkTheme
            getContainer={() => document.body}
            settings={settings}
            onSettingChange={(changeSetting) => {
              setSettings(changeSetting);
            }}
            disableUrlParams={true}
          />
        </ProLayout>
      </ConfigProvider>
    </ProConfigProvider>
  );
};

export default BasicLayout; 