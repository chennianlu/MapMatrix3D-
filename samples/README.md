# 3D案例展示系统

一个基于 TypeScript + React + React Router + Antd + Three.js 构建的3D案例展示系统。

## 功能特性

- 🎨 **左侧菜单栏**：占页面宽度10%，显示案例列表
- 📱 **右侧内容区**：占页面宽度90%，展示3D案例
- 🔄 **路由切换**：点击左侧菜单可以切换不同的3D案例
- 🎯 **响应式设计**：适配不同屏幕尺寸
- ⚡ **热重载**：开发时代码修改自动刷新

## 技术栈

- **TypeScript** - 类型安全的JavaScript
- **React 18** - 用户界面框架
- **React Router DOM** - 路由管理
- **Ant Design** - UI组件库
- **Three.js** - 3D图形库
- **Vite** - 快速构建工具

## 项目结构

```
samples/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout/         # 主布局组件
│   │   ├── SampleContainer/ # 案例容器组件
│   │   └── ThreeCanvas/    # Three.js画布组件
│   ├── samples/            # 3D案例
│   │   ├── BasicCube/      # 基础立方体
│   │   ├── BasicSphere/    # 基础球体
│   │   ├── AnimatedScene/  # 动画场景
│   │   ├── LightingDemo/   # 光照演示
│   │   └── TextureDemo/    # 纹理演示
│   ├── router/             # 路由配置
│   ├── styles/             # 样式文件
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## 安装和运行

1. **安装依赖**
   ```bash
   cd samples
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问应用**
   打开浏览器访问：http://localhost:8080

## 当前案例

### 基础能力

#### 🎯 核心几何体展示 ⭐ 
- **使用真正的 EnerV3DCore 类**
- 使用 GeometryObject3D 创建各种几何体
- 使用 sceneEffectTool 设置场景背景
- 使用 coreEvent 事件系统
- 展示立方体、球体、圆柱体
- 实时属性编辑（颜色、透明度、可见性）
- 动态删除和可见性控制
- 完整的错误处理和友好提示

#### ⚡ 事件管理展示 ⭐
- **使用 MapMatrix3D 事件管理器**
- 系统事件管理（CORE_CANVAS_RESIZE、CORE_OBJECT_SELECTED等）
- 对象事件管理（CLICK、POINT_MOVE、KEY_DOWN等）
- 事件注册、取消注册、暂停、恢复功能
- 自定义事件触发和参数传递
- 实时事件日志记录和监控
- 完整的事件生命周期演示

## 添加新案例

要新增一个3D案例菜单，需要完成以下4个步骤：

### 1. 在菜单配置中添加菜单项

修改 `src/components/Layout/index.tsx`，在 `menuItems` 数组中添加新的菜单项：

```tsx
// 菜单配置 - 二级菜单结构
const menuItems = [
  {
    key: 'basic-examples',
    icon: <AppstoreOutlined />,
    label: '基础示例',
    children: [
      {
        key: '/basic-cube',
        label: '基础立方体',
      },
      {
        key: '/basic-sphere',
        label: '基础球体',
      },
      // 新增菜单项
      {
        key: '/your-new-sample',
        label: '您的新案例',
      },
    ],
  },
  // ... 其他分组或新建分组
];
```

### 2. 在路由配置中添加路由

修改 `src/router/index.ts`：

```tsx
// 导入新组件
import YourNewSample from '../samples/YourNewSample';

// 在 routes 配置中添加
{
  path: 'your-new-sample',
  element: React.createElement(YourNewSample),
}
```

### 3. 创建案例组件

创建 `src/samples/YourNewSample/index.tsx`：

```tsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import SampleContainer from '../../components/SampleContainer';
import ThreeCanvas from '../../components/ThreeCanvas';

const YourNewSample: React.FC = () => {
  const handleInit = (scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) => {
    // 初始化3D场景
    // 创建几何体
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // 设置相机位置
    camera.position.set(0, 0, 5);
  };

  const handleAnimate = () => {
    // 动画逻辑
  };

  return (
    <SampleContainer>
      <ThreeCanvas onInit={handleInit} onAnimate={handleAnimate} />
    </SampleContainer>
  );
};

export default YourNewSample;
```

### 4. 在导航条中添加标题映射

修改 `src/components/SampleContainer/index.tsx`，在 `routeTitleMap` 中添加新路由的标题：

```tsx
// 路由标题映射
const routeTitleMap: Record<string, string> = {
  '/core-geometry-demo': '核心几何体展示',
  '/event-demo': '事件管理展示',
  '/your-new-sample': '您的新案例', // 新增这一行
};
```

### 注意事项

- 确保路由路径（key）在所有配置中保持一致
- 组件文件夹和文件名建议使用 PascalCase 命名
- 路由路径建议使用 kebab-case 命名（如：`/your-new-sample`）
- 菜单支持二级结构，可以根据案例类型进行分组
- 所有案例都会自动显示面包屑导航

## 构建发布

```bash
npm run build
```

构建产物将生成在 `dist` 目录中。 