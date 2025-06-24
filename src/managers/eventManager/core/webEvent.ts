import { EventDispatcher } from 'three';
import EventList from './eventList';
import { MAX_CLICK_TIME } from '../../../constants';

// 响应时间监听
let lastTimeStamp: number = 0;
let spaceTimeStamp: number = 0;

export default class EventNative extends EventDispatcher {
  public eventList: any;
  private interactionFrequency: number;
  private targetCanvas: HTMLElement | null;
  private supportsTouchEvents: boolean;
  private cursor: unknown;

  /**
   * @param {EventList} eventList - 获取注册的事件列表
   * @param {HTMLCanvasElement} canvas - 获取画布
   */
  constructor(eventList: EventList, canvas: HTMLCanvasElement) {
    super();

    this.eventList = eventList;

    this.interactionFrequency = 10; //事件的检查更新频率 TODO

    //当前绑定的domElement
    this.targetCanvas = null;

    /**
     * 预先通过bind绑定this指针
     */

    // 一次点击事件
    this.onClick = this.onClick.bind(this);
    // 鼠标滚动事件
    this.onWheel = this.onWheel.bind(this);

    // 双击事件
    this.onDblClick = this.onDblClick.bind(this);
    // 当指针不再处于 active 状态时，将触发此事件
    this.onPointerUp = this.onPointerUp.bind(this);
    //当指针变为 active 时将触发该事件。对于鼠标，当设备从没有按下的按钮过渡到至少按下的一个按钮时会触发。
    //对于触摸，当与数字转换器进行物理接触时会触发。对于笔，当手写笔与数字转换器物理接触时会触发。
    this.onPointerDown = this.onPointerDown.bind(this);
    //指针更改坐标时将触发此事件
    this.onPointerMove = this.onPointerMove.bind(this);
    // 将指针设备移出元素的命中测试边界；
    // 为不支持悬停的设备触发指标事件
    // 触发 pointercancel 事件后
    // 当笔针离开悬停范围时
    this.onPointerOut = this.onPointerOut.bind(this);
    //将定点设备移至元素的点击测试边界时，将触发此事件
    this.onPointerOver = this.onPointerOver.bind(this);
    this.onResize = this.onResize.bind(this);
    //键盘类事件定义
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    //用于改变鼠标指针状态
    this.cursor = null;

    this.setTargetElement(canvas);
  }

  /**
   * 设置接收鼠标/触摸事件的DOM元素
   * @param {HTMLCanvasElement} element - the DOM element which will receive mouse and touch events.
   */
  setTargetElement(element: HTMLElement) {
    // this.removeEvents();
    this.targetCanvas = element;
    this.addEvents();
  }

  /**
   * 注册所有的DOM事件
   * PS：指针事件等同于鼠标事件，同时兼容触控设备，所以这里不注册mouse事件
   * @private
   */
  addEvents() {
    if (!this.targetCanvas) {
      return;
    }
    window.addEventListener('resize', this.onResize, false);

    // 渲染画布父元素注册事件
    const parentElement = this.targetCanvas.parentElement;
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    parentElement.addEventListener('click', this.onClick, false);
    parentElement.addEventListener('dblclick', this.onDblClick, false);

    parentElement.addEventListener('pointermove', this.onPointerMove, false);
    parentElement.addEventListener('pointerdown', this.onPointerDown, false);
    parentElement.addEventListener('pointerup', this.onPointerUp, true);

    //除了触发pointerup(用于触摸事件)和pointercancel之外，还会触发pointerout
    parentElement.addEventListener('pointerleave', this.onPointerOut, false);
    parentElement.addEventListener('pointerover', this.onPointerOver, false);
  }

  /**
   * 移除所有该模块内注册的DOM事件
   * @private
   */
  removeEvents() {
    if (!this.targetCanvas) {
      return;
    }

    this.targetCanvas.removeEventListener('click', this.onClick, true);

    window.document.removeEventListener('pointermove', this.onPointerMove, true);
    this.targetCanvas.removeEventListener('pointerdown', this.onPointerDown, true);
    this.targetCanvas.removeEventListener('pointerleave', this.onPointerOut, true);
    this.targetCanvas.removeEventListener('pointerover', this.onPointerOver, true);
    window.removeEventListener('pointerup', this.onPointerUp, true);

    this.targetCanvas = null;
  }

  /**
   * 设置鼠标状态，后面可能会有需求 暂时没用到
   * @param {string} mode - cursor mode
   */
  setCursorMode(mode: string) {
    if (this.targetCanvas) this.targetCanvas.style.cursor = mode;
  }

  onResize(events: any) {
    const bindings = this.eventList.getEvent('CORE_CANVAS_RESIZE');
    this.fireEvents(bindings, events);
  }

  onWheel(events: any) {
    if (events.type !== 'wheel') return;

    const bindings = this.eventList.getEvent('WHEEL');
    this.fireEvents(bindings, events);
  }

  onClick(events: any) {
    if (events.type !== 'click') return;
    if (spaceTimeStamp > MAX_CLICK_TIME) return;

    // TODO: Double click happened. Trigger custom event.
    const bindings = this.eventList.getEvent('CLICK');
    this.fireEvents(bindings, events);
  }

  onDblClick(events: any) {
    if (events.type !== 'dblclick') return;

    const bindings = this.eventList.getEvent('DBCLICK');
    this.fireEvents(bindings, events);
  }

  onPointerDown(events: any) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && events.pointerType === 'touch') return;
    //更新触控时间戳
    lastTimeStamp = new Date().getTime();
    const bindings = this.eventList.getEvent('POINT_DOWN');
    this.fireEvents(bindings, events);
  }

  onPointerUp(events: any) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && events.pointerType === 'touch') return;
    spaceTimeStamp = new Date().getTime() - lastTimeStamp;
    // 防止右键鼠标视角操作冲突
    if (events.button === 2 && spaceTimeStamp > MAX_CLICK_TIME) return;

    const bindings = this.eventList.getEvent('POINT_UP');
    this.fireEvents(bindings, events);
  }

  onPointerMove(events: any) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && events.pointerType === 'touch') return;

    const bindings = this.eventList.getEvent('POINT_MOVE');
    this.fireEvents(bindings, events);
  }

  onPointerOut(events: any) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && events.pointerType === 'touch') return;

    const bindings = this.eventList.getEvent('POINT_OUT');
    this.fireEvents(bindings, events);
  }

  onPointerOver(events: any) {
    //unusual not
    const bindings = this.eventList.getEvent('POINT_OVER');
    this.fireEvents(bindings, events);
  }

  onKeyDown(events: any) {
    const bindings = this.eventList.getEvent('KEY_DOWN');
    this.fireEvents(bindings, events);
  }

  onKeyUp(events: any) {
    const bindings = this.eventList.getEvent('KEY_UP');
    this.fireEvents(bindings, events);
  }

  /**
   * 执行事件队列
   * @param {EventBinding} binding
   * @param {*} events
   */
  fireEvents(binding: Array<any>, events: any) {
    // 避免isOnce对原队列的操作 做一次简单克隆
    const cloneBinding = [...binding];
    const n = cloneBinding.length;
    for (let i = 0; i < n; i++) {
      const curBind = cloneBinding[i];
      curBind.execute(events);
    }
    // if (events.type === 'pointerup')   console.error(cloneBinding.length);
  }

  /**
   * 销毁
   */
  destroy() {
    this.targetCanvas = null;

    this.removeEvents();

    // this.onPointerDown = null;
    //
    // this.onPointerUp = null;
    //
    // this.onPointerMove = null;
    //
    // this.onPointerOut = null;
    //
    // this.onPointerOver = null;
    //
    // this.onKeyDown = null;
    //
    // this.onKeyUp = null;
    //
    // this.onResize = null;
  }
}
