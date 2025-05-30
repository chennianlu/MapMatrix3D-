import { EventDispatcher } from 'three';
import { isFunction } from '../util';

/**
 * proxy `addEventListener` function
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback
 * @return {this} this
 */
(EventDispatcher as any).prototype.on = function (type: string, fn: (p: any) => any) {
  if (!isFunction(fn)) return;
  // if (this instanceof Object3D) this.interactive = true;
  this.addEventListener(type, fn);
  return this;
};

/**
 * proxy `removeEventListener` function
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback, which you had bind before
 * @return {this} this
 */
(EventDispatcher as any).prototype.off = function (type, fn) {
  this.removeEventListener(type, fn);
  return this;
};

/**
 * binding a once event, just emit once time
 *
 * @param {String} type event type, evnet name
 * @param {Function} fn callback
 * @return {this} this
 */
(EventDispatcher as any).prototype.once = function (type, fn) {
  if (!isFunction(fn)) return;
  const cb = ev => {
    fn(ev);
    this.off(type, cb);
  };
  this.on(type, cb);
  return this;
};

/**
 * emit a event
 *
 * @param {String} type event type, evnet name
 * @return {this} this
 */
(EventDispatcher as any).prototype.emit = function (type, ...argument) {
  if (this._listeners === undefined || typeof this._listeners[type] === 'undefined') return;
  const cbs = this._listeners[type] || [];
  const cache = cbs.slice(0);

  for (let i = 0; i < cache.length; i++) {
    cache[i].apply(this, argument);
  }
  return this;
};
