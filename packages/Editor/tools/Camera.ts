import {
    BaseObject3D,
    cameraTool,
    renderTool,
    animationManager,
    coreEvent
} from "@enerv-3d/core";


/**
 * 编辑器场景中的摄影机核心方法
 */
export class Camera {
    sceneRoot: BaseObject3D;
    domContainer: any;
    viewHelperOffset: { w: number; h: number; };

    constructor(root: BaseObject3D) {
        if (new.target !== Camera) {
            return;
        }
        if (!Camera._instance) {
            Camera._instance = this;
            //这里添加构造函数属性
            this.sceneRoot = root;
            this.viewHelperOffset = {
                w: 0,
                h: 0
            }

            // 初始化相机视角
            cameraTool.flyWithCameraInfo({
                position: [4, 2, 4],
                target: [0, 0, 0],
                time: 2000
            })
        }
        return Camera._instance;
    }

    static _instance: Camera;



    /**
     * 初始化摄影机辅助控件
     * @param container 
     */
    initViewHelper(container: HTMLElement) {
        this.domContainer = container;
        renderTool.initCameraHelper(container);
        const animation = (time, delta) => {
            if (renderTool.viewHelper.animating === true) {
                renderTool.viewHelper.update(delta)
            }
        }
        animationManager.create('Camera_Helper_Animation', animation)

        coreEvent.on("CORE_CANVAS_RESIZE", () => {
            if (!this.domContainer.parentElement) return;
            const width = this.domContainer.parentElement.clientWidth;
            const height = this.domContainer.parentElement.clientHeight;
            // 默认渲染在右上角
            renderTool.viewHelper.setupRenderSize(width - this.viewHelperOffset.w, height - this.viewHelperOffset.h)
        });
    }

    /**
     * 更新控件渲染区域  相对于屏幕左上角
     * @param width 
     * @param height 
     */
    setViewHelperOffset(width: number, height: number) {

        // 下一帧生效
        setTimeout(() => {
            renderTool.viewHelper.setupRenderSize(
                this.domContainer.parentElement.clientWidth - width,
                this.domContainer.parentElement.clientHeight - height
            )
        });

        this.viewHelperOffset = {
            w: width,
            h: height
        }
        renderTool.viewHelper.visualDom.style.top = height + 'px';
        renderTool.viewHelper.visualDom.style.right = width + 'px';

    }


    /**
     * 相机视角聚焦到物体
     * @param obj 
     */
    flyTo(obj: BaseObject3D) {
        cameraTool.flyTo(obj);
    }


    /**
     * 获取当前摄影机信息
     * @returns 
     */
    getCameraInfo(): {
        position: number[],
        target: number[]
    } {
        return cameraTool.getCameraInfo()
    }

    /**
     * 控制摄影机视角远近
     * @param dollyScale number  大于0视角拉远 小于零视角缩进
     */
    dollyInOut(dollyScale: number) {
        cameraTool.orbitControl.dollyInOut(dollyScale)
    }

}
