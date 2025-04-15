// 引入Three.js
import * as THREE from 'three';

/**
 * 判断是否为对象类型
 * @param value 需要判断的值
 * @returns 是否为对象
 */
export const isObject = (value: any): boolean => {
    return Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * 判断值是否为指定类型
 * @param type 类型名称
 * @param value 需要判断的值
 * @returns 是否为指定类型
 */
export const isType = (type: string, value: any): boolean => {
    return Object.prototype.toString.call(value) === `[object ${type}]`;
};

/**
 * 深拷贝函数 - 支持循环引用处理
 * @param target 要拷贝的对象
 * @param map 用于追踪循环引用的Map
 * @returns 拷贝后的对象
 */
export function deepClone<T>(target: T, map = new Map()): T {
    // target 不能为空，并且是一个对象
    if (target != null && isObject(target)) {
        // 在克隆数据前，进行判断是否克隆过,已克隆就返回克隆的值
        let cache = map.get(target);
        if (cache) {
            return cache as T;
        }

        // 判断是否为数组
        const isArray = Array.isArray(target);
        let result = isArray ? [] : {};

        // 将新结果存入缓存中
        map.set(target, result);

        // 如果是数组
        if (isArray) {
            // 循环数组
            (target as unknown as any[]).forEach((item, index) => {
                // 如果item是对象，再次递归
                (result as any)[index] = deepClone(item, map);
            });
        } else {
            // 如果是对象
            Object.keys(target as object).forEach(key => {
                if (isObject((target as any)[key])) {
                    (result as any)[key] = deepClone((target as any)[key], map);
                } else {
                    (result as any)[key] = (target as any)[key];
                }
            });
        }
        return result as T;
    } else {
        return target;
    }
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    const result = deepClone(target) as T & U;

    for (const key in source) {
        if (key in result) {
            // 对象的处理
            if (isObject((source as any)[key])) {
                if (!isObject((result as any)[key])) {
                    (result as any)[key] = (source as any)[key];
                } else {
                    (result as any)[key] = deepMerge((result as any)[key], (source as any)[key]);
                }
            } else {
                (result as any)[key] = (source as any)[key];
            }
        } else {
            (result as any)[key] = (source as any)[key];
        }
    }

    return result;
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 获取DOM元素的计算样式
 * @param el DOM元素
 * @param ruleName CSS规则名
 * @returns 计算后的样式值
 */
export function getStyle(el: HTMLElement, ruleName: string): string {
    return window.getComputedStyle(el)[ruleName as any];
}

// 重新导出其他工具函数文件中的函数
export {
    geoSphereCoord,
    geoMercatorCoord,
    getBoundingBox,
    setMeshQuaternion
} from './coordUtils';

export {
    transformGeoJSON,
    transformGeoRoad
} from './geoDataUtils';

export {
    createSequenceFrame
} from './sequenceFrameUtils';

export {
    createCountryFlatLine
} from './countryUtils';

// 别名，兼容性支持
export { geoSphereCoord as lon2xyz } from './coordUtils'; 