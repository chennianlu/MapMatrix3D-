import { factory } from "../object/factory";
import { BaseObject, ObjectType } from "../object";
import { cameraTool } from "@enerv-3d/core";




/**
 * 根据查询条件对物体进行过滤
 * QuerySelector用于提供多种过滤物体的方式，例如id  name  classID
 */
export class Camera {
    sceneRoot: ObjectType;

    constructor(root: ObjectType) {
        if (new.target !== Camera) {
            return;
        }
        if (!Camera._instance) {
            Camera._instance = this;
            //这里添加构造函数属性
            this.sceneRoot = root;
        }
        return Camera._instance;
    }

    static _instance: Camera;

    /**
     * 根据当前场景物体自动适配视角
     */
    autoFit() {
        cameraTool.flyTo(this.sceneRoot.node, { time: 2000 });
    }

    /**
     * 相机视角聚焦到物体
     * @param obj 
     */
    flyTo(obj: ObjectType) {
        cameraTool.flyTo(obj.node, { time: 2000 });
    }
    /**
     * 围绕物体旋转飞行
     * @param object 
     */
    flyAround(object: ObjectType | null, options: {
        speed: number,
        clockwise: boolean,
        scale: number[]
    }) {
        cameraTool.flyAround(object && object.node || null, options)
    }

    flyWithCameraInfo(info: {
        position: number[],
        target: number[],
        time?: number,
        callback?: Func
    }): void {
        cameraTool.flyWithCameraInfo(info);
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
     * 环绕物体飞行，如果没有传参默认围绕场景飞行
     * @param obj 
     */
    around(obj: ObjectType) {

    }

}
