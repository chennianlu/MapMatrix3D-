import Rotate from "./components/rotate";
import Scale from "./components/scale";
import Translate from "./components/translate";
import assistPlane from "./assistPlane";
import { coordinate, transformType } from './defines';
import * as THREE from 'three';
import { event } from '../../event';

import { cameraTool, BaseObject3D, GeometryObject3D, TubeNormal } from '@enerv-3d/core'


/**
 * gizmo整体的接口层（包括状态管理）
*/
class Gizmo {

    private _splitBar;

    private _dummy;

    private _currentOrient;

    private _translate;

    private _rotation;

    private _scale;

    private _worldAABB;

    private object;

    public helperBox: GeometryObject3D;

    private transformController = new BaseObject3D();
    helperScene: any;

    constructor(options: {
        helperScene: THREE.Scene,
        renderDom: HTMLElement
    }) {
        const { helperScene, renderDom } = options
        this.helperScene = helperScene;
        this._createBox();

        const translate = new Translate(renderDom, this.helperBox);
        const rotate = new Rotate(renderDom, this.helperBox);
        const scale = new Scale(renderDom, this.helperBox);

        this._translate = translate;
        this._rotation = rotate;
        this._scale = scale;


        this.scale.updateMatrixWorld = (force?: boolean): void => {
            // TODO 写一个公共方法
            if (this.object) {
                this.updateScaleRatio();
                if (this.object instanceof TubeNormal || this.object.parent instanceof TubeNormal) {
                    this.scale.traverse((cur) => {
                        cur.visible = false;
                    })
                    this.rotation.traverse((cur) => {
                        cur.visible = false;
                    })
                }
            }
            THREE.Object3D.prototype.updateMatrixWorld.apply(this.scale, [force]);
        }
        this.registerEvents();

        Object.defineProperties(this, {
            'object': {
                set(object) {
                    translate.controlObject = object;
                    rotate.controlObject = object;
                    scale.controlObject = object;
                    scale.updateShowState(object);
                    assistPlane.controlObject = object;
                },
                get() {
                    const object =
                        translate.controlObject ||
                        rotate.controlObject ||
                        scale.controlObject ||
                        assistPlane.controlObject || null;
                    return object;
                }
            },
        }
        );
        this.init();
    }

    private init() {
        this.transformController.add(this.translate, this.rotation);
        this.helperBox.add(this.scale)
        this.transformController.visible = false;
        this._dummy = new BaseObject3D();
        this._dummy.name = 'dummy';
        this.helperScene.add(this.transformController, assistPlane);
        this.updateScaleRatio();
    }

    /**
    * 创建辅助盒子
    */
    _createBox() {
        const box = new GeometryObject3D({
            geometryType: "box",
        });
        box.name = 'helper-box'
        box.setOpacity(0);
        box.showBorder({ color: '#000000' })
        // 默认设置辅助盒子无穷远
        this.helperScene.add(box);

        this.helperBox = box;
        this.helperBox.hide();
    }

    get transMode() {
        const selectedGizmo = this.translate.selected ||
            this.rotation.selected ||
            this.scale.selected;
        return selectedGizmo?.transMode;
    }

    get snap() {
        return this.translate.snap;
    }

    get translate() {
        return this._translate;
    }

    get scale() {
        return this._scale;
    }

    get rotation() {
        return this._rotation;
    }

    get currentOrient() {
        return this._currentOrient;
    }

    get dummy() {
        return this._dummy;
    }

    /**
     * 装载gizmo的入口函数
     * @param containerObject {BaseObject3D} 装gizmo的父对象
    */
    public loadController = (containerObject: BaseObject3D) => {
        if (!containerObject) return;
        containerObject.add(this.transformController);
    }

    public reset = () => {
        if (!this.object) return;
        this.transformController.position.copy(new THREE.Vector3().fromArray(this._worldAABB.center));
        this.transformController.quaternion.copy(new THREE.Quaternion());
    }

    public setDownCenter = () => {
        if (!this.object) return;
        const downCenter = new THREE.Vector3().fromArray(this._worldAABB.center);
        const objectHeight = this.object.getWorldAABB().height ?? 0;
        downCenter.setY(downCenter.y - objectHeight * 0.5);
        this.transformController.position.copy(downCenter);
    }

    public setSnap = (type: 'translate' | 'scale', value: number = 1) => {
        if (!this[type]) return;
        if (type === 'scale') this[type]["lastScaleSnap"] = this[type]["snap"];
        this[type].snap = value;
    }

    public setEnable = (type: transformType, value: boolean) => {
        if (!this[type]) return;
        this[type].state = value === true ? 'enable' : 'disable';
    }

    /**
     * gizmo绑定控制对象
    */
    public attach = (object: BaseObject3D) => {
        if (!object) return;

        const tempPosition = new THREE.Vector3();
        const worldAABB = (object as BaseObject3D).getWorldAABB();

        this.object = object;
        this._worldAABB = worldAABB;

        //设置helperBox
        this.helperBox.show();

        this.helperBox.position.copy(object.position)
        const obb = object.getOBB();
        this.helperBox.setScale([obb.width, obb.height, obb.depth])
        this.helperBox.setWorldPosition(obb.center);
        this.helperBox.rotation.copy(object.rotation)
        // this.scale.scaleUpdate(object as THREE.Object3D);
        tempPosition.fromArray(worldAABB.center);
        this.transformController.position.copy(tempPosition);
        this.transformController.traverse((cur) => {
            cur.visible = true;
        })



        this.transformController.quaternion.identity();

    }

    public detach = () => {
        this.object = null;
        this.helperBox.hide();

        this.transformController.traverse((cur) => {
            cur.visible = false;
        })
    }


    //gizmo变化只出现平移轴y轴
    public extrudeOn = () => {
        this._rotation.visible = false;
        this._scale.visible = false;
        event.off('POINT_MOVE', this._rotation.mouseMoveFn);
        event.off('POINT_MOVE', this._scale.mouseMoveFn);
        this._translate.children.forEach((child, index) => {
            if (index !== 1)
                child.traverse((child) => child.visible = false);
        });
    }

    //还原gizmo
    public extrudeOff = () => {
        this._rotation.visible = true;
        this._scale.visible = true;
        event.on('POINT_MOVE', this._rotation.mouseMoveFn);
        event.on('POINT_MOVE', this._scale.mouseMoveFn);
        this._translate.children.forEach((child, index) => {
            if (index !== 1)
                child.traverse((child) => child.visible = true);
        });
    }

    //gizmo变化只出现split轴
    public splitOn = () => {
        this._rotation.visible = false;
        this._scale.visible = false;
        this._translate.children.forEach(child => {
            child.traverse((child) => child.visible = false);
        });
        event.off('POINT_MOVE', this._rotation.mouseMoveFn);
        event.off('POINT_MOVE', this._scale.mouseMoveFn);
        if (this._splitBar) {
            this._translate.add(this._splitBar);
        } else {
            //生成一个
            const materialDefault = {
                depthTest: false,
                depthWrite: false,
                toneMapped: false,
                transparent: true,
            }
            const group = new THREE.Group();
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.01, 0.5, 12),
                new THREE.MeshBasicMaterial({ ...materialDefault, color: 0x2222ff })
            ) as THREE.Mesh;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 16, 16),
                new THREE.MeshBasicMaterial({ ...materialDefault, color: 0x2222ff })
            ) as THREE.Mesh;

            cylinder.translateY(0.25);
            (cylinder as THREE.Mesh & { transMode: string }).transMode = 'split';
            sphere.translateY(0.5);
            (sphere as THREE.Mesh & { transMode: string }).transMode = 'split';
            group.add(cylinder, sphere);
            this._translate.add(group);
            this._splitBar = group;
        }
    }

    public splitOff = () => {
        this._rotation.visible = true;
        this._scale.visible = true;
        event.on('POINT_MOVE', this._rotation.mouseMoveFn);
        event.on('POINT_MOVE', this._scale.mouseMoveFn);
        this._translate.remove(this._splitBar);
        this._translate.children.forEach(child => {
            child.traverse((child) => child.visible = true);
        });
    }

    //只用于前端改变物体变换信息时候更新gizmo
    public updateGizmo = (object) => {
        if (!object) return;
        const center = new THREE.Vector3().fromArray(object.getWorldAABB().center);

        this.transformController.position.copy(center.clone());
        this.transformController.quaternion.copy(new THREE.Quaternion());
    }

    /**
     * @param worldPosition {THREE.Vector3} 上层transformControl的世界坐标
    */
    private updateScaleRatio = (worldPosition: THREE.Vector3 = this.transformController.position) => {
        const camera = cameraTool.camera;
        if (!camera) return;
        let factor;
        //需要做一下类型区分
        if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
            let orthographicCamera = camera as THREE.OrthographicCamera;
            factor = (orthographicCamera.top - orthographicCamera.bottom) / orthographicCamera.zoom;
        } else {
            let perspectiveCamera = camera as THREE.PerspectiveCamera;
            factor = worldPosition.distanceTo(perspectiveCamera.position) * Math.min(1.9 * Math.tan(Math.PI * perspectiveCamera.fov / 360) / perspectiveCamera.zoom, 7);
        }

        if (!isNaN(factor)) {
            this.transformController.scale.set(1, 1, 1).multiplyScalar(factor * 0.25);
            // 同步gizmo与相机旋转信息
            this.transformController.quaternion.copy(camera.quaternion)
            // this.translate.scale.set(1, 1, 1).multiplyScalar(factor * 0.25);
            // this.scale.scale.set(1, 1, 1).multiplyScalar(factor * 0.25);
            // this.rotation.scale.set(1, 1, 1).multiplyScalar(factor * 0.25);
            this.scale.children.forEach(axisGroup => {
                axisGroup.children.forEach(scaleBox => {
                    scaleBox.scale.set(1 / this.helperBox.scale.x, 1 / this.helperBox.scale.y, 1 / this.helperBox.scale.z).multiplyScalar(factor * 0.25);
                })
            });
        }
    }

    /**
     * gizmo里面的所有事件监听
    */
    private registerEvents = () => {
        event.on("OBJECT_REMOVED", () => this.object && this.detach());
    }

}

export { Gizmo };
