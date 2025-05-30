
import { BaseObject3D, Group3D, GeometryObject3D, coreEvent, TubeNormal, selectionTool } from "@enerv-3d/core";
import type { LineObjectOptions } from '@enerv-3d/core'
import { Object3DType } from '../../../src/types'
import { event } from '../event'
import { Selector } from '../tools/Selector';
import {
    LINE_TYPE
} from "../../../src/constants";
import { Gizmo } from '../tools/transformCommon'


export class ObjectEditor {
    public pauseSelection: boolean;
    public selected: Object3DType | null;
    public curLevel: Object3DType | null;
    public preLevel: Object3DType | null;
    private _trashStorage: any[]; // 存储层级切换过程设置效果的容器
    private _temporaryTube: TubeNormal | null;  // 临时缓存正在创建的管线物体  创建成功后清空
    private _defaultLineOption: LineObjectOptions;
    gizmo: Gizmo;

    sceneRoot: BaseObject3D;
    selector: Selector;
    private _drawLineEvent: () => void;
    lockedMapping: Map<string, Object3DType>;
    lineSphere: Array<GeometryObject3D | null>;

    constructor(options) {
        if (new.target !== ObjectEditor) {
            return
        }
        if (!ObjectEditor._instance) {
            const { selector, sceneRoot, gizmo } = options;
            this.selector = selector;
            this.gizmo = gizmo;
            this.sceneRoot = sceneRoot;
            this._temporaryTube = null;
            this.lockedMapping = new Map(); // 当前编辑器锁定的物体
            this._defaultLineOption = {
                name: 'line',
                lineType: LINE_TYPE.UV_TUBE,
                points: [],
                radius: .1,
                url: null,
                color: '#CDCDCD',
                opacity: 1,
                repeat: 1,
                animation: {
                    speed: .1
                }
            }
            this.lineSphere = [];
            this._drawLineEvent = this._clickPointEvent.bind(this);
            ObjectEditor._instance = this;
            this._initEvent();
        }
        return ObjectEditor._instance;
    }

    static _instance: ObjectEditor;

    static groupName = 'editor-group'


    /**
     * 快捷键统一注册  TODO 
     */
    _initEvent() {
        coreEvent.on('KEY_DOWN', (e) => {
            if (e.key === 'd') {
                // this.removeObject();
            }
        })
    }


    /**
     * 设置物体位置信息 gizmo是否同步
     * @param object 
     * @param positon 
     * @returns 
     */
    setPosition(object: BaseObject3D, positon: [number, number, number]) {
        if (!object || !(object instanceof BaseObject3D)) {
            return;
        }
        object.position.set(...positon)
        this.gizmo.updateGizmo(object);
    }

    /**
     * 设置物体位置信息 gizmo是否同步
     * @param object 
     * @param positon 
     * @returns 
     */
    setRotaition(object: BaseObject3D, rotation: [number, number, number]) {
        if (!object || !(object instanceof BaseObject3D)) {
            return;
        }
        object.setRotation(rotation, 'degrees')
        this.gizmo.updateGizmo(object);
    }


    /**
     * 设置物体尺寸
     * @param object 
     * @param size 
     * @param axis 缩放的轴向
     * @param equal 是否为等比例缩放
     * @returns 
     */
    setSize(object: BaseObject3D, size: number, axis: 'x' | 'y' | 'z', equal: boolean) {
        if (!object || !(object instanceof BaseObject3D)) {
            return;
        }
        const obb = object.getOBB();
        let ratio = 0;
        const sourceScale = object.scale.toArray();
        const resScale = object.scale.toArray();

        switch (axis) {
            case 'x':
                ratio = size / obb.width;
                sourceScale[0] *= ratio
                break;
            case 'y':
                ratio = size / obb.height;
                sourceScale[1] *= ratio
                break;
            case 'z':
                ratio = size / obb.depth;
                sourceScale[2] *= ratio
                break;

            default:
                break;
        }
        if (equal) {
            const ratioScale = resScale.map(cur => cur *= ratio);
            object.setScale(ratioScale);
        } else {
            object.setScale(sourceScale);
        }
        this.gizmo.updateGizmo(object);
    }


    /**
     * 设置物体信息（userData）
     * @param object BaseObject3D
     * @param key string
     * @param value string
     * @returns 
     */
    setInfo(object: BaseObject3D, key: string, value: any) {
        if (!object || !(object instanceof BaseObject3D)) {
            return;
        }
        object.userData[key] = value;
    }


    /**
     * 获取物体信息
     * @param object 
     * @returns 
     */
    getInfo(object) {
        if (!object || !(object instanceof BaseObject3D)) {
            return {};
        }
        const { userData } = object;
        const { name } = object;
        const position = object._getWorldPosition();
        const scale = object.scale.toArray();
        const obb = object.getOBB();
        const size = [obb.width, obb.height, obb.depth];
        const rotation = object.getRotation();
        const bloomStatus = object.bloomStatus;
        const color = object.overrideColor;
        const opacity = object.overrideOpacity;
        const locked = object.lockedStatus;
        return {
            name,
            position,
            scale,
            size,
            color,
            opacity,
            rotation,
            bloomStatus,
            locked,
            DATA: {
                ...userData,
            }
        }
    }


    /**
     * 根据实时点击点位绘制管线
     * @param pointList 
     */
    _drawLine(params: LineObjectOptions) {
        const newTube = new TubeNormal(params);
        newTube.init(params).then(line => {
            console.log("创建线结束", line)
            // 销毁上次的线 将新物体添加到场景
            if (this._temporaryTube) {
                this.sceneRoot.remove(this._temporaryTube);
            }
            // 默认不开启泛光
            // newTube.setBloomEffect(true);

            this._temporaryTube = newTube;
            this.sceneRoot.attach(newTube);
            event.dispatch('OBJECT_ADDED', [newTube]);

        })
    }

    /**
     * 点击创建线路节点
     * @returns 
     */
    _clickPointEvent() {
        const position = this.selector.getRayStagePosition();
        if (!position) return;
        this._defaultLineOption.points.push(position.toArray());
        const sphere = new GeometryObject3D({
            geometryType: 'sphere',
            geometryParam: {
                radius: this._defaultLineOption.radius * 1.2
            }
        })
        sphere.pickedEnable = false;
        sphere.setColor('#000000');
        sphere.position.copy(position);
        this.sceneRoot.attach(sphere);
        this.lineSphere.push(sphere);

        if (this._defaultLineOption.points.length > 1) {
            // 动态自动计算贴图平铺分段
            const length = TubeNormal.calcutePointLength(this._defaultLineOption.points);
            if (this._defaultLineOption.repeat !== 1) this._defaultLineOption.repeat = length * 2;
            this._drawLine(this._defaultLineOption)
        }
    }
    /**
     * 绘制管线
     */
    startDrawLine(params: LineObjectOptions = {}) {

        Object.assign(this._defaultLineOption, params)
        // 开启点击事件, 收集鼠标与物体相交点
        this._defaultLineOption.points = [];

        // 外部注册point_down
        coreEvent.on('CLICK', this._drawLineEvent, {
            id: 'startDrawLine',
            des: '点击绘制管线'
        })
    }
    /**
     * 注销管线绘制事件
     */
    endDrawlLine() {
        this._temporaryTube = null;
        this._defaultLineOption.points = [];
        for (let i = 0; i < this.lineSphere.length; i++) {
            const cur = this.lineSphere[i];
            this.sceneRoot.remove(cur);
        }
        this.lineSphere = [];
        coreEvent.off('CLICK', this._drawLineEvent)
    }

    drawPlane() {
        // 鼠标按下获取第一个坐标点，创建box  调整缩放

        // 监听鼠标移动过程与第一个点位距离，计算缩放值

        // 监听鼠标第二次点击事件 停止box缩放效果，添加场景


    }

    /**
     * 将多个物体进行打组,将组结构父节点设置到当前层级
     * @param list 
     */
    addGroup(list: Object3DType[]): BaseObject3D | null {
        // 至少有两个物体才能进行组合
        if (!Array.isArray(list) || list?.length < 1) return null;
        const group = new Group3D({
            name: ObjectEditor.groupName
        })
        const parent = list[0].parent;

        for (let i = 0; i < list.length; i++) {
            const cur = list[i];
            group.attach(cur)
        }
        parent.attach(group);
        event.dispatch('OBJECT_ADDED', [group]);

        return group;
    }


    /**
     * 解组后将子结构释放回当前层级
     * @param obj 
     */
    splitGroup(obj: Object3DType) {
        // 解组只允许对特定物体进行分解
        if (!(obj instanceof Group3D)) return;
        const children = obj.children;
        if (children.length === 0) return;
        const parent = obj.parent;
        for (let i = 0; i < children.length; i++) {
            const cur = children[i];
            parent.attach(cur);
            i--;
        }
        parent.remove(obj);
        event.dispatch('OBJECT_REMOVED', [obj])
    }


    /**
     * 删除选中的物体
     */
    removeObject(selectObjs: Object3DType | Object3DType[]) {
        // 选中单个物体  选中多个物体  选中物体为组结构
        let target = selectObjs;

        if (!Array.isArray(target)) target = [target]
        target.forEach(cur => {
            cur.parent.remove(cur);
            event.dispatch('OBJECT_REMOVED', [cur])
        })
    }

    /**
     * 对物体的克隆操作
     */
    clone(selectObjs: Object3DType) {

        // 选中单个物体  选中多个物体  选中物体为组结构
        let target = selectObjs;

        const cloneNode = target.clone(true);
        cloneNode.name = target.name + '_clone';
        this.sceneRoot.attach(cloneNode);
        selectionTool.setSelection(cloneNode);
        event.dispatch('OBJECT_ADDED', [cloneNode]);

    }

    /**
     * 给物体加锁，通过设置pickedencble实现
     * @param obj 
     */
    setLock(obj: Object3DType, state: boolean) {
        if (state) {
            this.lockedMapping.set(obj.uuid, obj);
            obj.lockedStatus = true;
            this.gizmo.detach();
        } else {
            this.lockedMapping.delete(obj.uuid);
            obj.lockedStatus = false;
            this.gizmo.attach(obj);
        }
    }

}