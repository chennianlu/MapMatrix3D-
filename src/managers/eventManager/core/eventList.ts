/**
 * 系统事件列表
 */
const SYSTEM_EVENTS: { [name: string]: [list: Array<any>] | [] } = {
  // 全局状态发生变化
  CORE_STATE_CHANGED: [],
  //画布大小发生变化
  CORE_CANVAS_RESIZE: [],
  // 系统初始化前事件
  CORE_INIT_BEFORE: [],
  //系统初始化结束事件
  CORE_INIT_END: [],
  // 场景层级发生变化
  CORE_LEVEL_CHANGE: [],
  //物体选择（单击）事件
  CORE_OBJECT_SELECTED: [],
};
/**
 * 物体事件列表
 */
const OBJECT_EVENTS: { [name: string]: [list: Array<any>] | [] } = {
  //单击
  CLICK: [],
  // 双击
  DBCLICK: [],
  // 鼠标或手势抬起
  POINT_UP: [],
  // 鼠标或手势按下
  POINT_DOWN: [],
  // 鼠标或手势移动
  POINT_MOVE: [],
  // 离开悬停范围时
  POINT_OUT: [],
  // 移至元素的点击测试边界时，将触发此事件
  POINT_OVER: [],
  // 滚轮
  WHEEL: [],
  // 键盘按下
  KEY_DOWN: [],
  // 键盘抬起
  KEY_UP: [],
};

/**
 * 对事件列表的管理
 */
export default class EventList {
  public eventLib: Map<string, Array<any> | []>;
  public objectEventLib: Map<string, Array<any> | []>;
  private _EXTEND_EVENTS:
    | {
        [name: string]: [list: Array<any>] | [];
      }
    | object;

  constructor() {
    // 维护一个事件列表
    this.eventLib = new Map();
    this.objectEventLib = new Map();
    // 外部拓展的事件类型
    this._EXTEND_EVENTS = {};
    this.init();
  }

  /**
   * 初始化内部事件类型
   */
  init() {
    this.initSystemDefault();
    this.initObjectDefault();
  }

  /**
   * 初始化3D内置事件
   */
  initSystemDefault() {
    for (const cur in SYSTEM_EVENTS) {
      this.eventLib.set(cur, SYSTEM_EVENTS[cur]);
    }
  }

  /**
   * 初始化dom原生事件列表
   */
  initObjectDefault() {
    for (const cur in OBJECT_EVENTS) {
      this.objectEventLib.set(cur, OBJECT_EVENTS[cur]);
    }
  }

  /**
   * 向3D事件列表注入拓展事件
   * @param type
   */
  register(type: string) {
    this._EXTEND_EVENTS[type] = [];
    this.eventLib.set(type, []);
  }

  /**
   * 获取某项事件类型的注册列表
   * @param key
   */
  getEvent(key: string): any[] | null {
    const result = this.objectEventLib.get(key) || this.eventLib.get(key);
    if (!result) {
      console.error(`${key} is not registered`);
      return null;
    } else {
      return result;
    }
  }
}
