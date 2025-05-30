import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  HomeOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import HomeScreen from '../pages/HomeScreen/index';
import Dashboard from '../pages/Dashboard';
import EnergyAnalysis from '../pages/Analysis/Energy';
import CarbonAnalysis from '../pages/Analysis/Carbon';
import Login from '../pages/Login';
import BasicLayout from '../layouts/BasicLayout';

// 路由配置类型
export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  routes?: RouteConfig[];
  name?: string;
  icon?: React.ReactNode;
  hideInMenu?: boolean;
}

// 菜单配置
export const menuConfig = [
  {
    path: '/home',
    name: '首页',
    icon: <HomeOutlined />,
  },
  {
    path: '/dashboard',
    name: '仪表盘',
    icon: <DashboardOutlined />,
  },
  {
    path: '/analysis',
    name: '数据分析',
    icon: <BarChartOutlined />,
    routes: [
      {
        path: '/analysis/energy',
        name: '能源分析',
      },
      {
        path: '/analysis/carbon',
        name: '碳排放分析',
      },
    ],
  },
  {
    path: '/settings',
    name: '系统设置',
    icon: <SettingOutlined />,
  },
];

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <BasicLayout />,
    routes: [
      {
        path: 'home',
        element: <HomeScreen />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'analysis',
        routes: [
          {
            path: 'energy',
            element: <EnergyAnalysis />,
          },
          {
            path: 'carbon',
            element: <CarbonAnalysis />,
          },
        ],
      },
      {
        path: 'settings',
        element: <div>系统设置</div>,
      },
      {
        path: '',
        element: <Navigate to="home" />,
      },
    ],
  },
]; 