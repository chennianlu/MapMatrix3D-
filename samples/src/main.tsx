import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import App from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>
);

// 初始化 Stagewise Toolbar
const toolbarConfig = {
  plugins: [], // 在这里添加您的自定义插件
};

document.addEventListener('DOMContentLoaded', () => {
  const toolbarRoot = document.createElement('div');
  toolbarRoot.id = 'stagewise-toolbar-root'; // 确保一个唯一的 ID
  document.body.appendChild(toolbarRoot);

  createRoot(toolbarRoot).render(
    <React.StrictMode>
      <StagewiseToolbar config={toolbarConfig} />
    </React.StrictMode>
  );
}); 