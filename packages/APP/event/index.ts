import { coreEvent, EventManager } from '@enerv-3d/core'
import { APP_EVENTS, EventManagerOnType, EventManagerDispatchType } from "./define";


class AppEventManager extends EventManager {
    constructor(eventList) {
        super(eventList);
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
    override on(...[eventType, func, options]: EventManagerOnType) {
        // @ts-ignore
        super.on(...[eventType, func, options]);
    }


    /**
     * 为事件增加新的订阅函数,只执行一次，然后自动从该事件队列中移除
     * @param eventType {string}  事件类型
     * @param func {Function}  为事件绑定的执行函数
     * @param {Object} [options] - The options for the manager.
     * @param {Boolean} [options.priority=0] - 根据下标插入到执行队列 default=0
     * @param {String} [options.des=''] - 对当前事件的描述 default=''
     */
    override once(...[eventType, func, options]: EventManagerOnType) {
        // @ts-ignore
        super.once(...[eventType, func, options]);
    }



    /**
     * 从事件队列中移除订阅
     * @param eventType {string}  事件类型
     * @param func {Function}  为事件绑定的执行函数
     */
    override off(...[eventType, func]: EventManagerOnType) {
        // @ts-ignore
        super.off(...[eventType, func]);
    }


    /**
     * 执行事件的全部订阅函数
     * @param eventType {string}  事件类型
     * @param param {any[]}  需要传递的执行参数 必须数组类型
     */
    override dispatch(...[eventType, param]: EventManagerDispatchType) {
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
                console.error("事件管理器执行回调函数时发生错误", e);
            }
        }
    }
}

//去拓展editorEventList
(function (list) {
    for (const cur in list) {
        coreEvent.eventList.register(cur);
    }
})(APP_EVENTS);

//拓展后的eventList传入系统层的事件管理器进行实例
const event = new AppEventManager(coreEvent.eventList);

export { event }
