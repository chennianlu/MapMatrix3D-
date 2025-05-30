import { event } from "./event";
import { SceneManager } from './manager/sceneManager'

import { Camera } from './tools/Camera';
import { Gizmo } from './tools/transformCommon'
import { Selector } from './tools/Selector';
import { ObjectEditor } from './tools/ObjectEditor';
import { BackgroundEditor } from './tools/BackgroundEditor';
import { LightEditor } from './tools/LightEditor';


import { History } from './tools/history';

import {
    coreEvent,
    EnerV3DCore,
    renderTool,
    selectionTool,
    BaseObject3D,
    EffectGround,
    GeometryObject3D,
    TubeNormal
} from '@enerv-3d/core'


interface GroundParams {
    visible?: boolean
    radius?: number,
    markUrl: string,
    markColor: string,
    groundUrl: string,
    groundColor: string,
    animation?: boolean,
    groundOpacity?: number
}


interface SystemAPPInit {
    container?: HTMLElement
}

export class Editor {
    private _core: EnerV3DCore;

    public event: typeof event;
    public sceneManager: SceneManager
    public camera: Camera
    public gizmo: Gizmo;

    selector: Selector;
    objectEditor: ObjectEditor;
    history: History;
    stage: GeometryObject3D;
    backgroundEditor: BackgroundEditor;
    lightEditor: LightEditor;

    /**
     * Creates an instance of Editor.
     * @date 2024/1/9 - 13:27:41
     *
     * @constructor
     * @param {?SystemAPPInit} [options]
     */
    constructor(options?: SystemAPPInit) {
        if (new.target !== Editor) {
            return;
        }
        if (!Editor._instance) {
            Editor._instance = this;
            this.history = new History(this);
            /**
             * 初始化APP依赖的系统模块
             */
            this._core = new EnerV3DCore();

            this.camera = new Camera(this._core.scene);
            //事件管理器
            this.event = event;

            // 场景管理器
            this.sceneManager = new SceneManager({
                scene: this._core.scene,
                helperScene: this._core.helperScene
            })


            // 开启后处理效果
            renderTool.setPostprocessingStatus(true);


            this.initEditorScene();

            // 初始化编辑器控件
            this.gizmo = new Gizmo({
                helperScene: this._core.helperScene,
                renderDom: this._core.canvas
            })

            // 初始化选择器
            this.selector = new Selector({
                gizmo: this.gizmo,
                helperScene: this._core.helperScene,
                sceneRoot: this.sceneManager.sceneRoot,
                scene: this._core.scene,
                domContainer: options?.container
            });

            // 初始化物体编辑工具
            this.objectEditor = new ObjectEditor({
                gizmo: this.gizmo,
                selector: this.selector,
                sceneRoot: this.sceneManager.sceneRoot
            });

            this.lightEditor = new LightEditor(this.sceneManager.sceneRoot)

            this.backgroundEditor = new BackgroundEditor()

            this._registEvent();

            //默认设置gizmo操作间隔为1
            this.setGizmoSnap(0.1);

            if (options?.container) this.setContainer(options.container)
        }
        return Editor._instance;
    }

    static _instance;


    /**
     * 注册摄影机相关事件
     * TODO  事件放到外部管理
     * 
     */
    _registEvent() {
        //键盘focus事件
        coreEvent.on('KEY_DOWN', (e) => {
            if (e.key === 'f') {
                const object = selectionTool.getSelection();
                if (object) {
                    this.camera.flyTo(object);
                }
            }
        })
        // 监听层级变换
        event.on('CORE_LEVEL_CHANGE', (curObj, preObj) => {
            // 进入管线
            if (curObj && curObj instanceof TubeNormal) {
                curObj.showControlPoints();
            }
            // 从管线退出到上一层
            if (preObj && preObj instanceof TubeNormal && curObj === preObj.parent) {
                preObj.destroyControlPoints();
            }
        }, {
            des: '编辑过程层级切换状态更新'
        })

        event.on('OBJECT_EDITED_CHANGING', (object, type) => {
            switch (type) {
                case Editor_Commands.setPosition:
                    if (object && object.parent instanceof TubeNormal) {
                        object.parent._updateControlPoints();
                    }
                    break;
                default:
                    break;
            }
        }), {
            des: '监听编辑状态发生更新时的变化'
        }
    }


    /**
     * 初始化编辑器需要的场景元素
     */
    initEditorScene() {
        // 初始化坐标系辅助工具
        const axisHelper = this._core._initAxisHelper(1);
        // 辅助对象放到helperscene
        this._core.helperScene.add(axisHelper)
        // 测试盒子
        const box = new GeometryObject3D({
            geometryType: 'box',
        });
        box.setPosition([0, 0.5, 0])
        this.sceneManager.sceneRoot.attach(box)
    }

    /**
     * 创建编辑器舞台
     * @param param 
     */
    loadStage(param: GroundParams) {
        if (this.stage) return;
        const effectStage = new EffectGround(
            {
                ...param,
            }
        )
        this.sceneManager.scene.attach(effectStage);
        effectStage.pickedEnable = false;
        const pickStage = new GeometryObject3D({
            geometryType: 'plane',
            geometryParam: {
                width: param.radius,
                height: param.radius
            }
        })
        pickStage.rotateX(-Math.PI / 2);
        pickStage.name = 'editor-stage';
        pickStage.setOpacity(0);
        pickStage.pickedEnable = false;
        this.stage = pickStage;
        // 网格添加到主场景
        this.sceneManager.scene.attach(pickStage);
    }




    /**
     * 调整gizmo操作物体变换的吸附间隔
     */
    setGizmoSnap = (value) => {
        this.gizmo.setSnap('scale', value);
        this.gizmo.setSnap('translate', value);
    }

    /**
     * 将渲染画布添加到外部dom容器，默认初始化APP会检测是否传container自动调用
     * @param dom
     */
    setContainer(dom: HTMLElement) {
        dom.appendChild(this._core.domContainer);
        dom.appendChild(this._core.renderTool.css3DRenderer.domElement);
        this._core.domContainer.style.width = dom.offsetWidth + 'px';
        this._core.domContainer.style.height = dom.offsetHeight + 'px';
        this.selector.domContainer = dom;
        this.selector._initMultiSelection()
        // 相机辅助控件
        this.camera.initViewHelper(dom);
    }

    /**
     * 拖拽生成模型事件
     * TODO 放到场景管理器中
     * @param data 
     */
    loadModelFromDragging(data: {
        path: string,
        name: string,
        productCode: string,
    }) {
        const { path, name, productCode } = data;
        this.sceneManager.helperBox.show();
        this.sceneManager.helperBox.setPosition([0, Infinity, 0]);

        const pointMoveFunc = () => {
            this.gizmo.attach(this.sceneManager.helperBox);
            // 鼠标移动获取实时位置
            const position = this.selector.getRayStagePosition();
            if (position) {
                this.sceneManager.helperBox.position.copy(position)
            }
            coreEvent.once('POINT_UP', pointUpFunc)

        }

        const pointUpFunc = () => {
            // 获取当前helperbox位置信息
            const curPos = this.sceneManager.helperBox.position;
            // 创建模型物体
            const model = new BaseObject3D({
                name: name
            });
            model.init({
                path: path,
                url: 'index.gltf',
            }).then((object) => {
                this.sceneManager.helperBox.hide();
                // 获取自身包围盒  底部贴合
                const selfAABB = model.getSelfAABB();
                curPos.setY(curPos.y + selfAABB.height / 2 - selfAABB.center[1])
                model.position.copy(curPos);
                // 隐藏helper对象
                this.sceneManager.sceneRoot.attach(model);
                this.selector.setSelection(model)
                model.userData.productCode = productCode;
                // 选中物体  触发编辑器事件
                event.dispatch('OBJECT_SELECTED', [model]);
                // 物体被添加到物体  触发添加事件
                event.dispatch('OBJECT_ADDED', [model]);

            })

            coreEvent.off('POINT_MOVE', pointMoveFunc)

        }

        // 外部注册point_down
        coreEvent.on('POINT_MOVE', pointMoveFunc)
    }

    execute(cmd, optionalName: string) {
        this.history.execute(cmd, optionalName);
    }

    redo() {
        this.history.redo();

    }
    undo() {
        this.history.undo();

    }
    /**
     * 对当前画布渲染生成截图
     * @param compress 压缩后的尺寸 以宽度优先，成比例输出 默认输出原图
     * @return {Promise<*>}
     */
    async exportBase64Image(compress?: number): Promise<{
        image: string,
        blob: Blob
    }> {
        const res = await this._core.exportBase64Image(compress);
        return res;
    }

    /**
    * 直接将当前画面输出为截图
    */
    async downLoadImage() {
        await this._core.downLoadImage();
    }

    /**
     * 计算编辑器窗口
     */
    resize() {
        coreEvent.dispatch("CORE_CANVAS_RESIZE", []);
    }

    /**
     * 重置app
     */
    reset() {
        this.resize();
        this.history.clear();
    }

}
