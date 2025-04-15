/**
 * 动画辅助类
 * 用于给物体提供动画，包括：内置动画，文件类读取（自身动画）
 * https://github.com/tweenjs/tween.js/blob/HEAD/README_zh-CN.md
 */

// TODO  应该是manager 而不是tool
import * as TWEEN from '@tweenjs/tween.js';
import { Clock } from 'three';

export interface CreateAnimationOption {
  name: string;
  animationType?: (amount: number) => number;
  startValue: any;
  endValue: any;
  curve?: string;
  time?: number;
  yoyo?: boolean;
  repeat?: number;
  callback: (data: any) => void;
  completeCallback?: (data: any) => void;
}

export interface PlayAnimationOption {
  name: string;
  speed?: number;
  isLoop?: boolean;
}

class Animation {
  public playList: Map<string, (date?: any, delta?: number) => any>;
  clock: Clock;

  constructor() {
    this.playList = new Map();
    this.clock = new Clock();
    this._render();
  }

  /**
   * 创建动画  回调函进入任务队列
   * @param options
   * @param key 动画标识
   */
  create(key: string, callback: (date?: any, delta?: number) => any) {
    if (typeof callback !== 'function') return;
    this.playList.set(key, callback);
  }

  /**
   * 从当前动画队列中移除
   * @param key
   */
  remove(key: string) {
    this.playList.delete(key);
  }

  /**
   * 生成一个TWEEN动画，返回TWEEN对象
   * @param options
   */
  createTween(options: CreateAnimationOption) {
    const {
      animationType = TWEEN.Easing.Linear.None,
      startValue,
      endValue,
      time = 2000,
      callback,
      repeat = 0,
      yoyo = false,
      completeCallback,
    } = options;

    const tween = new TWEEN.Tween(startValue)
      .to(endValue, time)
      .easing(animationType)
      .repeat(repeat)
      .yoyo(yoyo)
      .repeat(repeat)
      .onUpdate(function (object) {
        callback(object);
      })
      .onComplete(object => {
        completeCallback && completeCallback(object);
      });

    return tween;
  }

  clear() {
    this.playList.clear();
  }

  /**
   * 开启动画渲染
   * @param time
   */
  _render = (time?: number) => {
    const delta = this.clock.getDelta();

    TWEEN.update(time);
    this.playList.forEach(cur => cur(time, delta));
    requestAnimationFrame(this._render);
  };
}

export const animationManager = new Animation();
