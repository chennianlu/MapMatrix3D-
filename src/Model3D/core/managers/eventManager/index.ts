import EventList from './core/eventList';
import { Options, EventBinding } from './core/eventBinding';
import EventNative from './core/webEvent';
import { EventManagerDispatchType, EventManagerOnType } from './core/defines';

/**
 * 作为引擎全局事件的统一管理模块
 * 事件注册统一经过EventManager完成
 * 事件种类：全局事件、物体事件
 * 事件派发：1、全局监听 2、检查绑定对象  3、派发
 * 事件类型隔离：全局事件类型大于物体事件，物体事件列表单独管理
 * @example    event.on()    object.on()
 */
class EventManager {
  public eventList: EventList;
  private canvasRegisterLib: WeakMap<HTMLCanvasElement, EventNative>;

  constructor(eventList: EventList) {
    //所有注册事件名称列表
    this.eventList = eventList;
    //EventNative与canvas绑定关系
    this.canvasRegisterLib = new WeakMap();
  }

  /**
   * 为事件增加新的订阅函数
   * @param eventType {string}  事件类型
   * @param func {Function}  为事件绑定的执行函数
   * @param {Object} [options] - The options for the manager.
   * @param {Number} [options.priority=0] - 根据下标插入到执行队列 default=0
   * @param {String} [options.des=''] - 对当前事件的描述 default=''
   * @param {String} [options.id=''] - 事件唯一标识 default=null
   */
  on(...[eventType, func, options = {}]: EventManagerOnType) {
    const priority = options.priority || 0;
    const events = this.eventList.getEvent(eventType);
    if (!events) return;
    this.add(events, func, false, options);
  }

  /**
   * 为事件增加新的订阅函数,只执行一次，然后自动从该事件队列中移除
   * @param eventType {string}  事件类型
   * @param func {Function}  为事件绑定的执行函数
   * @param {Object} [options] - The options for the manager.
   * @param {Boolean} [options.priority=0] - 根据下标插入到执行队列 default=0
   * @param {String} [options.des=''] - 对当前事件的描述 default=''
   */
  once(...[eventType, func, options = {}]: EventManagerOnType) {
    const priority = options.priority || 0;
    const events = this.eventList.getEvent(eventType);
    if (!events) return;
    this.add(events, func, true, options);
  }

  /**
   * 从事件队列中移除订阅
   * @todo 根据ID移除单个事件
   * @param eventType {string}  事件类型
   * @param func {Function}  为事件绑定的执行函数
   */
  off(...[eventType, func]: EventManagerOnType) {
    const events = this.eventList.getEvent(eventType);
    if (!events) return;
    this.remove(events, func);
  }

  /**
   * 暂停某个注册事件，可能是一个函数  也可能是暂停一类事件 还没想好，看后续产品需求
   * @param eventType {string}  事件类型
   */
  pause(eventType: string) {
    const events = this.eventList.getEvent(eventType);
    if (!events) return;
    events.forEach(cur => cur.pause(true));
    // TODO  暂停一个事件
  }

  /**
   * 恢复某个暂停的事件
   * @param eventType {string}  事件类型
   */
  resumePause(eventType: string) {
    const events = this.eventList.getEvent(eventType);
    if (!events) return;
    events.forEach(cur => cur.pause(false));
    // TODO  恢复一个事件
  }

  /**
   * 执行事件的全部订阅函数
   * @param eventType {string}  事件类型
   * @param param {any[]}  需要传递的执行参数 必须数组类型
   */
  dispatch(...[eventType, param]: EventManagerDispatchType) {
    if (!Array.isArray(param)) throw new Error('param must be Array');
    const events = this.eventList.getEvent(eventType);
    if (!events) return;

    const length = events.length;
    for (let i = 0; i < length; i++) {
      const curFunc = events[i];
      // 需要考虑判断条件  例如暂停
      try {
        curFunc.execute.call(curFunc, ...param);
      } catch (e) {
        console.error('事件管理器执行回调函数时发生错误', e);
      }
    }
  }

  /**
   * 校验
   * @param listener
   * @param fnName
   * @private
   */
  validateListener(listener: any, fnName: string) {
    if (typeof listener !== 'function') {
      throw new Error(
        'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName)
      );
    }
  }

  /**
   * 初始化EventNative
   */
  initEventNative(canvas: HTMLCanvasElement) {
    //对外部canvas进行事件绑定
    this.canvasRegisterLib.set(canvas, new EventNative(this.eventList, canvas));
  }

  /**
   * 检测是否已经被注册
   * @param {Array} event 当前事件队列
   * @param {Function} listener  需要检测的函数
   * @param options
   * @return {number}
   * @private
   */
  _indexOfListener(event: any, listener: Func, options: Options = {}) {
    const bingID = options.id;
    let n = event.length,
      cur;
    while (n--) {
      cur = event[n];
      //优先判断ID 其次比较函数
      if (bingID && bingID !== '') {
        if (cur._id === bingID) {
          return n;
        }
      } else if (cur._listener === listener) {
        return n;
      }
    }
    return -1;
  }

  /**
   * @param {Array} event 当前事件队列
   * @param {EventBinding} binding
   * @private
   */
  _addBinding(event: any, binding: any) {
    //simplified insertion sort
    let n = event.length;
    if (n > 10)
      console.warn(
        `警告！注册事件过多，已注册${n}个事件，可能导致内存泄露和性能下降，请检查是否有应该被销毁但未被销毁的事件！`
      );
    do {
      --n;
    } while (event[n] && binding._priority <= event[n]._priority);
    event.splice(n + 1, 0, binding);
  }

  /**
   * 将事件绑定函数注册到中间层
   * @param {Array} event 当前事件队列
   * @param {Function} listener
   * @param {boolean} isOnce
   * @param options
   * @return {EventBinding}
   * @private
   */
  _registerListener(event: any, listener: Func, isOnce: boolean, options: Options = {}) {
    const prevIndex = this._indexOfListener(event, listener, options);
    let binding;

    if (prevIndex !== -1) {
      binding = event[prevIndex];
      //如果已经被注册不允许修改优先级
      const priority = options.priority;
      // @ts-ignore
      if (priority && binding._priority !== priority) {
        throw new Error('An existing priority cannot be modified');
      }
      // @ts-ignore
      if (binding.isOnce() !== isOnce) {
        throw new Error(
          'You cannot add' +
            (isOnce ? '' : 'Once') +
            '() then add' +
            (!isOnce ? '' : 'Once') +
            '() the same listener without removing the relationship first.'
        );
      }
    } else {
      binding = new EventBinding(event, listener, isOnce, options);
      this._addBinding(event, binding);
    }
    return binding;
  }

  /**
   * 新增订阅
   * @param {Array} event 当前事件队列
   * @param {Function} listener
   * @param isOnce
   * @param options
   * @private
   */
  add(event: any, listener: Func, isOnce: boolean, options: Options) {
    this.validateListener(listener, 'add');
    return this._registerListener(event, listener, isOnce, options);
  }

  /**
   * 将订阅函数从事件队列中移除
   * @param event
   * @param {Function} listener 要移除的函数
   * @return {Function} listener
   * @private
   */
  remove(event: any, listener: Func) {
    this.validateListener(listener, 'remove');

    const i = this._indexOfListener(event, listener);
    if (i !== -1) {
      event[i]._destroy();
      event.splice(i, 1);
    }
    return listener;
  }

  /**
   * 移除事件的全部订阅函数
   * @private
   */
  removeAll(event: any) {
    let n = event.length;
    while (n--) {
      event[n]._destroy();
    }
    event.length = 0;
  }
}
const eventList = new EventList();
const coreEvent = new EventManager(eventList);
export { coreEvent, EventManager };
