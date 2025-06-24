# @enerv-3d

## Install and Run

Type the following in any terminal:

```bash
# 安装本地依赖环境
npm install #or yarn

# 启动项目
npm run dev #or yarn run dev

# 打包文件至dist，只会打包@enerv-3d目录
npm run build #or yarn run dev
```

## Project Layout

```bash
├─ 📂 node_modules/                 # 依赖文件库
│  └─ 📁 ...                        # (TypeScript, Vite, etc.)
├─ 📂 public/                       # 公共资源路径
├─ 📂 src/                          # 入口文件
│  ├─ 📁 assets                     # 前端静态资源路径，不涉及3D部分
│  └─ 📁 @enerv-3d                     # @enerv-3d主文件目录
│     ├ 📁 core                     # @enerv-3d 核心文件
│     ├ 📁 interface                # @enerv-3d 对外暴露接口模块
│     ├ 📁 resources                # @enerv-3d 依赖资源
│     ├ 📁 types                    # @enerv-3d 内置类描述文件
│     ├ 📁 utils                    # @enerv-3d 通用函数
│     └─ 📄 index.ts                # @enerv-3d 出口
│  └─ 📁 components                 # 前端React组件目录
│  └─ 📁 examples                   # @enerv-3d示例文件
│     ├ 📁 files                    # 示例文件依赖资源目录
│     ├ 📁 jsm                      # 示例文件代码
│     ├ 📁 lib                      # 示例文件所依赖的第三方库
│  └─ 📄 APP.scss                   # react 入口样式文件
│  └─ 📄 APP.tsx                    # react 入口tsx文件
├─ 📄 .gitignore                    # Ignore certain files in git repo
├─ 📄 index.html                    # Entry page
├─ 📄 package.json                  # Node package file
├─ 📄 tsconfig.json                 # TS configuration file
├─ 📄 vite.config.js                # vite configuration file
└─ 📄 readme.md                     # Read Me!
```
