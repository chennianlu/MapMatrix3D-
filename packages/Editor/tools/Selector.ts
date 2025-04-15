import { coreEvent, cameraTool, BaseObject3D, GeometryObject3D, selectionTool } from '@enerv-3d/core'
import { event } from '../event'
import { Gizmo } from '../tools/transformCommon'
import { Object3DType } from '../../../src/types'

/**
 * 空间坐标系转换为当前屏幕坐标
 * @param vec3 
 * @param camera 
 * @param renderDom 
 * @returns 
 */
export const threeConversionTwo = (
    vec3: THREE.Vector3,
    camera: THREE.Camera,
    renderDom: HTMLElement
): {
    x: number,
    y: number
} | null => {
    if (vec3 === undefined) return null;
    const pos = vec3.clone();
    const proVec3 = pos.project(camera);
    const w = renderDom.offsetWidth / 2;
    const h = renderDom.offsetHeight / 2;
    return {
        x: Math.round(proVec3.x * w + w),
        y: Math.round(-proVec3.y * h + h)
    }
}


export class Selector {
    public pauseSelection: boolean;
    public pauseMultiSelection: boolean;
    public selected: Object3DType | null | Object3DType[];
    public curLevel: Object3DType | null;
    public preLevel: Object3DType | null;
    public sceneRoot: BaseObject3D;
    public scene: THREE.Scene;
    public helperScene: THREE.Scene
    gizmo: Gizmo;
    domContainer: HTMLElement;
    multiDom: HTMLElement;
    multiContainer: BaseObject3D;

    constructor(options: {
        gizmo: Gizmo,
        scene: THREE.Scene,
        helperScene: THREE.Scene,
        sceneRoot: BaseObject3D,
        domContainer: HTMLElement
    }) {
        if (new.target !== Selector) {
            return
        }
        if (!Selector._instance) {
            Selector._instance = this;
            const { gizmo, scene, sceneRoot, domContainer, helperScene } = options;
            // dom容器
            this.domContainer = domContainer;
            // 这里添加构造函数属性
            this.pauseSelection = false;
            this.pauseMultiSelection = true; // 默认关闭框选
            this.gizmo = gizmo;
            this.selected = null;
            this.curLevel = null;
            this.preLevel = null;
            this.sceneRoot = sceneRoot;
            this.scene = scene;
            this.helperScene = helperScene;
            // 创建一个框选虚拟容器
            this.multiContainer = new BaseObject3D({
                name: 'multiContainer'
            })
            this.scene.attach(this.multiContainer);
            selectionTool.curLevel = sceneRoot;
            this._registEvent();
            this._initMultiDom();
        }
        return Selector._instance;
    }

    static _instance: Selector;



    _initMultiDom() {
        const dom = document.createElement('div');
        dom.id = 'multiSelectionBox';
        dom.style.position = 'absolute';
        dom.style.width = '600px';
        dom.style.height = '400px';
        dom.style.border = '1px dashed';
        dom.style.zIndex = '2';
        dom.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
        this.multiDom = dom;
    }

    /**
     * 注册摄影机相关事件
     */
    _registEvent() {
        // 监听核心事件  物体选中后广播
        event.on('CORE_OBJECT_SELECTED', (object) => {
            this.setSelection(object);
        })

        // 监听核心事件  物体选中后广播
        event.on('OBJECT_REMOVED', (object) => {
            this.gizmo.detach();
        })
    }

    /**
     * 开启多选
     * @returns 
     */
    _initMultiSelection() {
        if (!this.domContainer) return;
        const _this = this;
        // 初始鼠标点击位置  计算移动距离
        let mouseStopId;
        let mouseOn = false;
        let startX = 0;
        let startY = 0;
        const selectContainer = this.domContainer;
        const selDiv = this.multiDom;
        let startPos = { x: 0, y: 0 };
        let endPos = { x: 0, y: 0 };

        const clearEventBubble = (e) => {
            if (e.stopPropagation) e.stopPropagation();
            else e.cancelBubble = true;

            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
        }



        const pointDown = (e) => {
            if (this.pauseMultiSelection) return;
            clearEventBubble(e);
            if (e.buttons !== 1 || e.which !== 1) return;
            mouseStopId = setTimeout(function () {
                mouseOn = true;
                // 调整坐标原点为容器左上角
                startX = e.offsetX;
                startY = e.offsetY;
                const x = e.offsetX;
                const y = e.offsetY;
                startPos.x = x;
                startPos.y = y;
                // 添加框选元素到容器内
                selectContainer.appendChild(selDiv);
                selDiv.style.left = startX + 'px';
                selDiv.style.top = startY + 'px';
            }, 20);
        }

        const pointMoveFunc = (e) => {
            if (this.pauseMultiSelection) return;
            if (!mouseOn) return;
            clearEventBubble(e);
            const rect = selectContainer.getBoundingClientRect();
            const _x = e.clientX - rect.left;
            const _y = e.clientY - rect.top;
            // 鼠标移动超出容器内部，进行相应的处理

            selDiv.style.left = Math.min(_x, startX) + 'px';
            selDiv.style.top = Math.min(_y, startY) + 'px';
            if ((Math.min(_x, startX) + Math.abs(_x - startX)) <= selectContainer.scrollWidth) {
                selDiv.style.width = Math.abs(_x - startX) + 'px';
            }
            selDiv.style.height = Math.abs(_y - startY) + 'px';
        }

        const pointUp = (e) => {
            if (this.pauseMultiSelection) return;
            clearEventBubble(e);
            const x = e.offsetX;
            const y = e.offsetY;
            endPos.x = x;
            endPos.y = y;

            // 鼠标抬起计算框选范围
            _this._calculateMultiResult(startPos, endPos)
            selectContainer.removeChild(selDiv);
            mouseOn = false;

        }

        selectContainer.addEventListener('mousedown', pointDown, false);
        selectContainer.addEventListener('mousemove', pointMoveFunc, false)
        selectContainer.addEventListener('mouseup', pointUp, false)
    }

    /**
     * 切换框选状态
     * @param state 
     */
    onMultiSelection(state: boolean) {
        if (state) {
            cameraTool.orbitControl.enabled = false;
            this.pauseMultiSelection = false;
        } else {
            cameraTool.orbitControl.enabled = true;
            this.pauseMultiSelection = true;
        }

    }

    /**
     * 根据鼠标起始点和终止点计算框选范围对象
     * @param startPoint 
     * @param endPoint 
     * @returns 
     */
    _calculateMultiResult(startPoint, endPoint) {
        let result = [];
        // 只能框选中当前场景层级中的物体
        // 模拟碰撞 
        const maxX = Math.max(startPoint.x, endPoint.x);
        const minX = Math.min(startPoint.x, endPoint.x);

        const maxY = Math.max(startPoint.y, endPoint.y);
        const minY = Math.min(startPoint.y, endPoint.y);

        const children = this.sceneRoot.children;
        for (let i = 0; i < children.length; i++) {
            const cur = children[i];
            // 过滤舞台和不允许被拾取的物体
            if (cur.name === 'editor-stage') continue;
            //不允许被拾取的物体默认过滤
            if ((cur as unknown as BaseObject3D).pickedEnable === false) continue;
            //判断如果框选物体范围内有被锁定的物体，则不赋予gizmo
            if ((cur as unknown as BaseObject3D).lockedStatus === true) continue;


            // 计算出当前层级物体的中心点坐标屏幕二维点位

            const screenPos = threeConversionTwo(cur.position, cameraTool.camera, this.domContainer);
            if ((screenPos.x > minX && screenPos.x < maxX) && (screenPos.y > minY && screenPos.y < maxY)) {
                result.push(cur);
                this.multiContainer.attach(cur);
                i--;
            }

        }

        if (result.length > 0) {
            this.gizmo.attach(this.multiContainer);
            coreEvent.dispatch('CORE_OBJECT_SELECTED', [this.multiContainer, 'multiple']);
            this.selected = result;
        }
        return result;
    }

    /**
     * 设置当前选择选中物体
     * @param {Array} object
     */
    setSelection(object: Object3DType | null) {
        //判断当前是否为禁用鼠标状态
        if (this.pauseSelection) return;
        if (object) {
            this.gizmo.detach();
            if (!object.pickedEnable) return;
            if (!object.lockedStatus) {
                this.gizmo.attach(object);
            }
            event.dispatch('OBJECT_SELECTED', [object]);
        } else {
            // 如果当前为框选状态需释放框选对象中的物体
            const multiChilds = this.multiContainer.children
            if (multiChilds.length > 0) {
                for (let i = 0; i < multiChilds.length; i++) {
                    const cur = multiChilds[i];
                    this.sceneRoot.attach(cur)
                    i--;
                }
            }

            this.gizmo.detach();
            event.dispatch('OBJECT_SELECTED', [null]);
        }
        selectionTool.selected = object;
        this.selected = object;
    }

    /**
     * 获取当前场景中选中的物体,如果是框选对象，则返回其子对象数组
     * @return {Object3DType | null}
     */
    getSelection(): Object3DType | null | Object3DType[] {
        return this.selected;
    }

    /**
     * 获取射线和舞台相交坐标
     */
    getRayStagePosition(): THREE.Vector3 | null {
        const pickedMsg = selectionTool.calculateSelection({
            objects: this.scene.children
        });
        if (pickedMsg) {
            return pickedMsg.point
        } else {
            return null;
        }
    }


}