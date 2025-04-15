export interface Options {
  id?: string;
  des?: string;
  priority?: number;
}
/**
 * 事件注册和分发过程的中间层，绑定事件执行状态
 */
export class EventBinding {
  private _intro: string;
  private _id: string | null;
  private _priority: number;
  private _listener: any;
  private _isOnce: boolean;
  private _Event: any[] | string;

  /**
   * @param event {Array} 事件队列
   * @param listener {Function} 挂载函数
   * @param isOnce {Boolean}  是否只执行一次
   * @param options options.priority {Number} 执行优先级
   * @param options options.id
   * @param options {Object} 拓展参数
   * @param options options.des
   */
  constructor(event: string, listener: any, isOnce: boolean, options: Options = {}) {
    /**
     * 事件描述
     * @type Number
     * @private
     */
    this._intro = options.des || '';

    /**
     * 事件绑定id
     * @type Number
     * @private
     */
    this._id = options.id || null;

    /**
     * 权重
     * @type Number
     * @private
     */
    this._priority = options.priority || 0;

    /**
     * 挂载函数
     * @type Function
     * @private
     */
    this._listener = listener;

    /**
     * 是否只执行一次
     * @type boolean
     * @private
     */
    this._isOnce = isOnce;

    /**
     * 绑定被注册的事件类型对象
     * @type Event
     * @private
     */
    this._Event = event;
  }

  /**
   * 是否暂停
   * @type boolean
   */
  active = true;

  /**
   * 给绑定的函数传递参数 并执行
   * @param {*} [paramsArr] 参数
   * @return {*} Value returned by the listener.
   */
  execute() {
    let handlerReturn;
    if (this.active && !!this._listener) {
      // handlerReturn = this._listener.apply(this.context, params);
      // excute func
      // eslint-disable-next-line prefer-rest-params
      handlerReturn = this._listener(...arguments);
      if (this._isOnce) {
        this.detach();
      }
    }
    return handlerReturn;
  }

  /**
   * 从绑定事件队列移除
   * @return {Function|null}
   */
  detach() {
    // @ts-ignore
    if (this._Event.indexOf(this) !== -1) {
      // @ts-ignore
      this._Event.splice(this._Event.indexOf(this), 1);
      this._destroy();
    }
  }

  /**
   * @return {boolean}
   */
  isOnce() {
    return this._isOnce;
  }

  /**
   * @param bool {Boolean}
   */
  pause(bool: boolean) {
    this.active = !bool;
  }
  /**
   * @return {Function}
   */
  getListener() {
    return this._listener;
  }

  /**
   * @return {Event}
   */
  getEvent() {
    return this._Event;
  }

  /**
   * 删除绑定实例
   * @private
   */
  _destroy() {
    this._Event = [];
    delete this._listener;
  }
}
