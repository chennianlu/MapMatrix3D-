/**
 * 设计原则：
 * BaseObject为业务类   BaseObject3D为3D实体
 * 1、3D实体只允许绑定3D强相关的属性，业务类对象负责绑定拓展属性
 * 2、涉及到3D需要实现的逻辑不允许写在这里，需要通过node实现方法
 */

import * as THREE from "three";
import { BaseObject3D } from "@enerv-3d/core";
import { factory } from "./factory";
import { CORE_CONST } from '@enerv-3d/core';
import { Utils } from "@enerv-3d/core";

import { animationManager } from '@enerv-3d/core';
// import { MetaBall } from '@enerv-3d/core';
import { ObjectEventType } from '@enerv-3d/core'

const { LAYOUT_X, LAYOUT_Y, LAYOUT_Z, TRANSFORMER_SPACE } = CORE_CONST
const { getUUID, isFunction } = Utils;

export type BaseInitOptions = {
    parent?: BaseObject;
    pickedEnable?: boolean;
    id?: string;
    name?: string;
    url?: string;
    path?: string;
    data?: any;
    layout?: {
        rule?: number[],
        offset?: number[]
    }
};

export type BaseObjectKeys = keyof BaseInitOptions;

interface ObjectStyle {
    color: string;
    opacity: number;
    // outline: {
    //     color: string
    // }
}

// type XLayout = typeof LAYOUT_X[keyof typeof LAYOUT_X];
type LayoutCell = 1 | 2 | 3;
export type XYZLayout = [LayoutCell, LayoutCell, LayoutCell]

export interface Layout {
    rule: XYZLayout
    offset?: [number, number, number]
}

/**
 * @class BaseObject
 * @desc 3D物体业务类 挂载通用数据
 */
export class BaseObject {
    public readonly type: string = "Base";
    static readonly type: string = "Base";
    // 唯一id标识
    public id: string;
    // 物体名称
    public name: string;
    // 当前对象是否允许拾取
    public pickedEnable: boolean;
    // 真实3D节点  不允许外部访问
    public node: BaseObject3D;
    //显示状态
    private _visible: boolean;

    private colorAnimation: any;

    // 物体绑定数据
    public data: { key?: string; value?: any };

    // 额外的字段信息，一般不用来展示
    public extraData: any;
    // 子节点
    public children: Array<BaseObject | null>
    // 子节点数据（缓释加载）
    public childrenData: any[]
    // 父节点
    public parent: BaseObject | null

    //加载状态
    public loadStatus: boolean;
    //模型资源路径
    public productCode: string | undefined;
    // 样式对象
    public style: ObjectStyle;
    // 当前物体可以播放的动画名称列表
    public animationNames: string | null[];


    // 充电效果控制
    // private chargingEffect: MetaBall;
    // public chargingStatus: boolean;
    public initOption: BaseInitOptions;
    constructor(options: BaseInitOptions = {}) {
        this.id = options.id ?? getUUID();
        this.name = options.name ?? "default";
        this.pickedEnable = options.pickedEnable ?? true;
        this._visible = true;
        this.data = options.data || {};
        this.extraData = {};
        this.children = [];
        this.childrenData = [];
        this.productCode = options.path;
        this.loadStatus = false;
        this.style = {
            color: "#ffff00",
            opacity: 1,
        };
        this.initOption = options;
        //默认补全url  只需要给path
        if (this.initOption.path && !this.initOption.url) this.initOption.url = 'index.gltf'
        factory.add(this);
    }

    /**
     * 销毁子物体
     */
    destroy() {
        //1 从factory中移除
        factory.remove(this);
        //2 物体从父节点中删除
        this.setParent(null);
        // 物体还有哪些属性需要释放？？？？
        for (let i = 0; i < this.children.length; i++) {
            const cur = this.children[i];
            cur.destroy();
            i--;
        }
        this.children = [];
    }

    /**
     * 初始化物体，挂载3D实例节点
     * 继承类尽量不要重写init函数
     * @param params 
     */
    public async init(params?: BaseInitOptions): Promise<BaseObject> {
        // 初始化node
        const initOption = params || this.initOption
        this.node = new BaseObject3D(initOption);
        await this.node.init(initOption)
        //业务主键绑定
        this.node.appKey = this.id;
        this.setParent(initOption.parent);
        this.initAttribute(initOption);
        return this;
    }

    public initAttribute(param) {
        //初始化矩阵信息
        const { position, scale, rotation, bloom } = param;
        this.node.setBloomEffect(bloom)
        if (Array.isArray(position)) {
            this.setPosition(position)
        }
        if (Array.isArray(scale)) {
            this.setScale(scale)
        }
        if (Array.isArray(rotation)) {
            this.setAngle(rotation);
        }
    }

    /**
     * 设置物体相对位置(父节点)
     * @param pos
     */
    public setPosition(pos: number[]) {
        this.node.setPosition(pos);
    }

    /**
     * 获取自身坐标 相对位置(父节点)
     * @param pos
     */
    public getPosition(): number[] {
        return this.node.position.toArray();
    }


    /**
     *  设置物体世界位置
     * @param pos
     */
    public setWorldPosition(pos: number[]) {
        this.node.setWorldPosition(pos);
    }

    /**
     * 获取世界坐标
     * @returns 
     */
    public getWorldPosition() {
        return this.node._getWorldPosition();
    }

    /**
     * 设置缩放比例
     * @param scale
     */
    public setScale(scale: number[]) {
        this.node.setScale(scale);
    }

    /**
     * 设置缩放比例
     * @param scale
     */
    public getScale(): number[] {
        return this.node.scale.toArray();
    }

    /**
     * 设置物体尺寸
     * @param size 国际单位制米
     * @param axis 缩放的轴向
     * @returns 
     */
    setSize(size: number, axis: 'x' | 'y' | 'z') {
        this.node.setSize(size, axis);
    }


    /**
     *  设置旋转角度
     * @param angle
     */
    public setAngle(angle: number[]) {
        this.node.setRotation(angle, "degrees");
    }


    /**
     * 设置物体偏航角Y
     * @param degree 
     */
    yaw(degree) {
        this.node.yaw(degree);
    }
    /**
     * 设置物体俯仰角Z
     * @param degree 
     */
    pitch(degree) {
        this.node.pitch(degree);
    }
    /**
    * 设置物体横滚角X
    * @param degree 
    */
    roll(degree) {
        this.node.roll(degree);
    }

    /**
     * 设置物体朝向
     * @param args 
     * @param coorSystem 
     * @param zDir 
     */
    setDirection(args, coorSystem) {
        if (!coorSystem) coorSystem = TRANSFORMER_SPACE.WORLD;
        this.node.setDirection(args, coorSystem);
    }


    /**
     * 设置物体是否可拾取
     * @param bool 
     */
    setPickEnabled(bool) {
        this.node.pickedEnable = bool;
    }

    /**
     * 设置物体显示隐藏
     * @param deep 是否显示子节点
     */
    show(deep?: boolean) {
        this.node.show(deep)
    }


    /**
     * 设置物体显示隐藏
     * @param deep 是否隐藏子节点
     */
    hide(deep?: boolean) {
        this.node.hide(deep)
    }

    /**
     * 设置物体透明
     * @param value
     */
    setOpacity(value: number, deep?: boolean) {
        this.node.setOpacity(value, deep)
    }

    /**
     * 设置物体颜色
     * @param value 
     * @param deep 
     */
    setColor(value: string, deep?: boolean) {
        this.node.setColor(value, deep)
    }

    /**
     * 设置物体颜色闪烁
     * @date 2024/2/20 - 14:34:01
     *
     * @param {boolean} enable 开启或关闭状态
     * @param {ColorRGB} color  闪烁目标颜色
     * @param {ColorRGB} [endColor={ r: 255, g: 255, b: 255 }]  从该颜色过度到目标颜色
     * @param {number} [speed=2] 颜色闪烁速度
     */
    setColorFlicker(enable: boolean, color: ColorRGB, endColor?: ColorRGB, speed?: number, deep: boolean = false) {
        if (enable === true) {
            if (!this.colorAnimation) {
                this.colorAnimation = animationManager.createTween({
                    startValue: color,
                    endValue: endColor || { r: 255, g: 255, b: 255 },
                    name: 'colorAnimation',
                    callback: ({ r, g, b }) => {
                        const R = Math.floor(r);
                        const G = Math.floor(g);
                        const B = Math.floor(b);

                        this.setColor(`rgb(${R}, ${G}, ${B})`, deep);
                    },
                    yoyo: true,
                    repeat: Infinity,
                    time: 1000 / (speed || 2),
                });
            }
            this.colorAnimation.start();
        } else {
            this.colorAnimation.stop();
            // 清掉颜色值  有种情况是否需要考虑：例如本身物体已经有颜色怎么办
            this.setColor(null, deep);
        }
    }



    /**
     * 设置物体辉光
     * @param bool 
     */
    setBloomEffect(bool) {
        this.node.setBloomEffect(bool)
    }
    /**
     * 获取世界包围盒
     * @returns
     */
    public getWorldAABB(isUpdate: boolean = false) {
        const aabb = this.node.getWorldAABB();
        return aabb;
    }

    /**
     * 获取自身包围盒
     * @returns
     */
    public getSelfAABB(isUpdate: boolean = false) {
        const aabb = this.node.getSelfAABB();
        return aabb;
    }

    /**
     * 添加子节点
     * @param child
     */
    public add(child: BaseObject | Array<BaseObject>) {
        if (!Array.isArray(child)) child = [child];
        for (let i = 0; i < child.length; i++) {
            const cur = child[i];
            const bool = this.children.includes(cur);
            if (bool === false) {
                this.node.attach(cur.node);
                this.children.push(cur);
                cur.parent = this;
            }
        }
        this.node.updateMatrixWorld();
    }

    /**
     * 删除子节点
     * @param child
     */
    public remove(child: BaseObject | Array<BaseObject>) {
        if (!Array.isArray(child)) child = [child];
        for (let i = 0; i < child.length; i++) {
            const cur = child[i];
            const bool = this.children.includes(cur);
            if (bool === true) {
                this.node.remove(cur.node);
                const index = this.children.indexOf(cur);
                this.children.splice(index, 1);
                i--;
            } else {
                console.warn(`调用removeChild警告，物体不属于该节点`);
            }
        }
        this.node.updateMatrixWorld();
    }

    /**
     * 添加父节点或更新父节点操作
     * @param parent 
     * @returns 
     */
    setParent(parent: BaseObject | null) {
        if (!parent) {
            // 没有父节点则取消父节点挂载
            if (this.parent) {
                this.parent.remove(this);
            }
            return;
        }
        if (this.parent === parent) return;
        // 有父节点的情况下需要重新挂载
        if (this.parent) {
            let self: any = this;
            if (this.parent instanceof THREE.Scene) {
                self = this.node;
                factory.removeRootObj(this);
            }
            //@ts-ignore
            this.parent.remove(self);
        }
        // 属于场景根节点物体
        if (parent instanceof THREE.Scene) {
            parent.add(this.node);
            // this.parent = parent;
            factory.addRootObj(this);
        } else if (parent instanceof BaseObject) parent.add(this);
    }

    /**
     * 设置物体相对父亲偏移量
     * @param layout 
     * @returns 
     */
    setLayout(layout: Layout) {
        this.node.setLayoutPosition(layout)
    }


    clone(recursive: boolean = false) {
        //@ts-ignore
        return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {

        this.name = source.name;
        this.pickedEnable = source.pickedEnable;
        this._visible = source._visible;
        this.data = source.data;
        this.children = source.children;
        this.productCode = source.productCode;
        this.loadStatus = source.loadStatus;
        this.style = source.style;
        this.node = source.node.clone(recursive);

        if (recursive === true) {

            for (let i = 0; i < source.children.length; i++) {

                const child = source.children[i];
                this.add(child.clone());

            }

        }

        return this;

    }





    /**
     * 创建充放电效果，并将其置于物体顶部中心
     * @param center 物体几何中心
     * @param height 物体高度
     * @param scaleNum 充电效果缩放比例
     */
    private _createChargingStatus(center: number[], height: number, scaleNum: number = 0.5) {
        // const pos = center;
        // pos[1] += height / 2;
        // const params = {
        //     position: pos as number[],
        //     scale: [scaleNum, scaleNum, scaleNum] as number[],
        // };
        // const chargingEffect = new MetaBall(params);
        // chargingEffect.init(params)
        // this.chargingEffect = chargingEffect;
        // this.node.attach(chargingEffect);
        console.warn('已转移')
    }

    /**
     * 显示(或创建)物体充放电状态
     */
    showChargingStatus() {
        // const aabb = this.getSelfAABB();
        // const { height, center, width, depth } = aabb;

        // if (this.chargingEffect) {
        //     // TODO: 需要确定电量百分比的设置入口，是否在 showChargingStatus() 方法中提供
        //     this.chargingEffect.show();
        // } else {
        //     // 新建充放电状态
        //     this._createChargingStatus(center, height, Math.min(width, depth) / 10);
        // }
        // this.chargingStatus = true;
        console.warn('已转移')
    }

    /**
     * 隐藏物体充放电状态
     */
    hideChargingStatus() {
        // this.chargingEffect && this.chargingEffect.hide();
        // this.chargingStatus = false;
        console.warn('已转移')
    }



    /**
     * 注册物体事件
     * @date 2024/1/30 - 16:28:04
     *
     * @param {ObjectEventType} eventType
     * @param {Func} func
     */
    on(eventType: ObjectEventType, func: Func) {
        if (!isFunction(func)) return;
        this.node.on(eventType, func)
    }

    /**
     * 注销物体事件
     * @date 2024/1/30 - 16:28:04
     *
     * @param {ObjectEventType} eventType
     * @param {Func} func
     */
    off(eventType: ObjectEventType, func: Func) {
        if (!isFunction(func)) return;
        this.node.off(eventType, func)
    }

    /**
     * 注册物体事件（只生效一次后注销）
     * @date 2024/1/30 - 16:28:04
     *
     * @param {ObjectEventType} eventType
     * @param {Func} func
     */
    once(eventType: ObjectEventType, func: Func) {
        if (!isFunction(func)) return;
        this.node.once(eventType, func)
    }

    /**
    * 执行事件
    * @date 2024/1/30 - 16:28:04
    *
    * @param {ObjectEventType} eventType
    * @param {Func} func
    */
    emit(eventType: ObjectEventType, func: Func) {
        if (!isFunction(func)) return;
        this.node.emit(eventType, func)
    }

    /**
     * 设置物体线框模式
     * @date 2024/2/4 - 11:24:51
     *
     * @param {boolean} visible
     */
    setWireframeVisible(visible: boolean) {
        this.node.setWireframeVisible(visible)
    }

    /**
     * 获取物体的三角面和顶点信息
     * @date 2024/2/4 - 12:27:32
     *
     * @returns {{ triangles: number; Vertices: number; }}
     */
    getTriangleInfo() {
        return this.node.getTriangleInfo()
    }


}
