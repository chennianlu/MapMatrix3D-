import './App.less'
import React, { useState } from 'react';
// 引入router工具库
import { useRoutes } from 'react-router-dom';
// 引入路由配置文件
import {
  AppstoreOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Button, ConfigProvider } from 'antd';
import routes from './router/config';
import { useNavigate, Routes, Route } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number];


function App() {
  const navigate = useNavigate();

  const element = useRoutes(routes);

  return (
    <div id="app">
      <ConfigProvider theme={{
        algorithm: theme.defaultAlgorithm
      }}>

        {element}
      </ConfigProvider>
    </div>
  );
}

export default App;
