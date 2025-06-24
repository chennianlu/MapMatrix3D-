# MapMatrix3D - Three.js 核心引擎封装

一个基于 Three.js 的企业级 3D 引擎框架，提供了完整的 3D 场景管理、对象系统、工具链和资源管理能力。

## 🏗️ 核心架构

### EnerV3DCore - 核心引擎类
核心引擎类是整个框架的入口点，负责初始化和管理所有 3D 系统组件：

- **场景管理**：主场景 (scene) 和辅助场景 (helperScene)
- **渲染管道**：集成 WebGL 渲染器和 CSS3D 渲染器
- **相机系统**：透视相机和正交相机支持
- **工具集成**：灯光、选择、效果、加载等工具
- **事件系统**：统一的事件管理和分发机制

```typescript
const core = new EnerV3DCore(domContainer);
// 自动初始化所有子系统
```

## 🔧 工具系统 (Tools)

### 🎥 CameraTool - 相机工具
- 透视相机和正交相机支持
- 相机控制器集成
- 视窗比例自动调整
- 相机参数动态配置

### 💡 LightTool - 光照工具
- 环境光、方向光、点光源支持
- 光照参数动态调整
- 阴影映射配置
- 光照效果预设

### 🎨 RenderTool - 渲染工具
- WebGL 渲染器管理
- CSS3D 渲染器支持
- 后处理效果链
- 性能监控 (Stats)
- 截图导出功能

### 🎯 SelectionTool - 选择工具
- 射线检测
- 多选支持
- 选择高亮效果
- 选择事件回调

### 🌟 SceneEffectTool - 场景效果工具
- 后处理效果管理
- Bloom 效果
- 环境遮蔽 (SSAO)
- 景深效果

### 📦 Loader - 资源加载器
- GLTF/GLB 模型加载
- 纹理加载 (HDR/LDR)
- 立方体纹理加载
- 加载进度回调
- 资源缓存管理

## 🎯 对象系统 (Objects)

### BaseObject3D - 基础对象类
所有 3D 对象的基类，提供统一的对象接口：

```typescript
class BaseObject3D extends THREE.Object3D {
  // 基础属性
  public material: ExMaterial | ExMaterial[];
  public loadStatus: boolean;
  public aabb: AABB | null;
  public appKey: number | string | null;
  
  // 核心方法
  async init(options: BaseInitOptions): Promise<BaseObject3D>;
  async loadURL(params: BaseInitOptions): Promise<any>;
  setPosition(pos: Array<number> | THREE.Vector3): void;
  setLayoutPosition(layout: Layout): void;
  setBloomEffect(bool: boolean): void;
}
```

#### 主要特性：
- **异步初始化**：支持异步加载和初始化流程
- **模型绑定**：自动加载和绑定 GLTF 模型
- **布局系统**：相对定位和绝对定位支持
- **事件系统**：对象级事件监听和触发
- **外观控制**：颜色、透明度、线框模式
- **辉光效果**：Bloom 效果开关
- **包围盒计算**：AABB 和 OBB 支持

### 专用对象类型

#### MeshObject3D - 网格对象
- 基于 Mesh 的 3D 对象
- 材质管理
- 几何体绑定

#### SpriteObject3D - 精灵对象
- 2D 精灵支持
- 始终面向相机
- UI 元素集成

#### Widget3D - 3D 小部件
- 2D/3D 文本渲染
- 图片精灵
- UI 面板支持
- 布局系统集成

#### 特效对象
- **WaterPlane**：水面效果
- **ParticlePoints**：粒子系统
- **TubeNormal**：管道和线条
- **EffectGround**：地面特效
- **Pyramid**：金字塔效果
- **Shield**：护盾效果

## 🗄️ 管理器系统 (Managers)

### GeometryManager - 几何体管理器
- 几何体缓存和复用
- 基础几何体生成 (box, sphere, cylinder, cone 等)
- 参数化几何体创建
- 内存优化管理

### MaterialManager - 材质管理器
- 材质缓存和复用
- 材质参数动态调整
- 材质库管理

### AnimationManager - 动画管理器
- 关键帧动画
- 缓动函数支持
- 动画队列管理
- 动画状态控制

### EventManager - 事件管理器
- 统一事件总线
- DOM 事件绑定
- 自定义事件支持
- 事件冒泡机制

### Cache - 缓存管理器
- 内存缓存
- 浏览器缓存
- 资源引用计数
- 垃圾回收机制

## 🔧 工具函数 (Utils)
- 数学计算辅助函数
- 类型检查工具
- 性能优化工具
- 调试辅助函数

## 📝 常量定义 (Constants)
- 布局枚举 (LAYOUT_X, LAYOUT_Y, LAYOUT_Z)
- 小部件类型 (WIDGET)
- 视觉效果类型 (VISIUAL_TYPE)
- 坐标空间定义 (TRANSFORMER_SPACE)
- 线条类型 (LINE_TYPE)
- 粒子类型 (PARTICLE_TYPE)

## 🚀 快速开始

```typescript
import { EnerV3DCore, BaseObject3D } from '@your-package/mapmatrix3d';

// 1. 初始化核心引擎
const container = document.getElementById('container');
const core = new EnerV3DCore(container);

// 2. 创建 3D 对象
const cube = new BaseObject3D();
await cube.init({
  url: '/models/cube.gltf',
  position: [0, 0, 0],
  scale: [1, 1, 1],
  parent: core.scene
});

// 3. 添加事件监听
cube.on('click', (event) => {
  console.log('立方体被点击了！', event);
});

// 4. 启用调试模式
core.setDebugger(true);
```

## 🎯 核心优势

- **🏗️ 企业级架构**：模块化设计，松耦合，易扩展
- **⚡ 高性能**：资源缓存、几何体复用、智能渲染
- **🎨 丰富特效**：内置多种视觉效果和后处理
- **🔧 开发友好**：TypeScript 支持，完整的类型定义
- **📱 跨平台**：支持现代浏览器和移动设备
- **🎮 交互丰富**：完整的事件系统和选择机制
- **📦 资源管理**：智能加载、缓存和内存管理

## 📚 技术栈

- **Three.js** - 3D 图形库
- **TypeScript** - 类型安全的 JavaScript
- **WebGL** - 硬件加速渲染
- **CSS3D** - CSS 3D 变换支持

---

MapMatrix3D 为企业级 3D 应用提供了完整的解决方案，从基础的场景管理到高级的特效系统，助力开发者快速构建高质量的 3D 体验。
