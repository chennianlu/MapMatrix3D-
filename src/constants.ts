/**
 * 定义所有需要的常量，最终挂载到@enerv-3d
 */

//===================================start===================================
//限制鼠标单击发生接收时间，正常 0.1s - 0.3s
export const MAX_CLICK_TIME = 300;
//限制鼠标双击发生接收时间
export const MAX_DOUBLE_CLICK_TIME = 1000;

//布局相关
export const enum LAYOUT_X {
  LEFT = 1,
  CENTER,
  RIGHT,
}
export const enum LAYOUT_Y {
  TOP = 1,
  CENTER,
  BOTTOM,
}
export const enum LAYOUT_Z {
  FRONT = 1,
  CENTER,
  BACK,
}

//公告板
export const enum WIDGET {
  IMG_2D = 1, //精灵图 始终面向屏幕  跟随父物体移动
  IMG_3D, //3D图片 允许调整旋转方向
  TEXT_2D, //2D文字 始终面向屏幕
  TEXT_3D, //3D文字 允许调整旋转方向
  PANEL_2D, //始终面向屏幕  跟随父物体移动
  PANEL_3D, //允许调整旋转方向
}

export const enum VISIUAL_TYPE {
  PYRAMID = 1,
  SHIELD,
  GROUND,
}

/**
 * 坐标空间
 */
export const enum TRANSFORMER_SPACE {
  SELF = 1,
  WORLD,
  PARENT,
}

/**
 * 线类型枚举值
 */
export const enum LINE_TYPE {
  UV_PATH = 1,
  UV_TUBE,
  PIXEL,
}

/**
 * @description: 粒子类型枚举值
 */
export const enum PARTICLE_TYPE {
  RAIN = 1, // 雨
  SNOW, // 雪
  FLAME, // 火焰
  SPRAY, // 喷洒
}
