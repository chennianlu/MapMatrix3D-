import { transformType, runningState } from "../defines";
import assistPlane from "../assistPlane";
import * as THREE from 'three';
import { Object3DType } from '../../../../../src/types'
import { cameraTool, GeometryObject3D, BaseObject3D, SpriteObject3D, } from '@enerv-3d/core'

export interface SuperSprite extends SpriteObject3D {
    axis: string
    tag: string
}


/**
 * 对核心类的拓展
 */
export default class BaseType extends BaseObject3D {

    public controlObject: Object3DType;

    public independent;

    public selected;

    public offset = new THREE.Vector3();

    public quaternionStart;

    protected state: 'enable' | 'disable' = 'enable';

    protected transMode: transformType;

    protected posAxisMap = {
        x: new THREE.Vector3(1, 0, 0),
        y: new THREE.Vector3(0, 1, 0),
        z: new THREE.Vector3(0, 0, 1),
    };

    protected raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 6000);

    protected mouseDownFn: (event: any) => void = () => { };

    protected mouseMoveFn: (event: any) => void = () => { };

    protected mouseUpFn: (event: any) => void = () => { };

    protected config = {
        x: {
            p: {
                element: []
            },
            n: {
                element: []
            }
        },
        y: {
            p: {
                element: []
            },
            n: {
                element: []
            }
        },
        z: {
            p: {
                element: []
            },
            n: {
                element: []
            }
        }
    };

    protected defaultMatConf: THREE.MaterialParameters = {
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        transparent: true,
    };

    protected lastSelected = [];

    protected objectAABB;

    protected centerPositionOffset;

    protected positionStart;

    protected gizmoPositionStart;

    protected scaleStart;

    protected localPosStart;

    public helperBox: GeometryObject3D;

    protected localPosEnd;
    renderDom: HTMLElement;
    cameraControl: typeof cameraTool.orbitControl;
    status: runningState;

    constructor(renderDom, helperBox) {
        super();
        this.renderDom = renderDom;
        this.helperBox = helperBox
        this.cameraControl = cameraTool.orbitControl;
        this.status = runningState.NONE
    }

    /**
     * 公共更新流程
    */
    protected update = (event) => {
        this.selected && assistPlane.updateAssiatPlane(this.transMode, this.selected.axis, this.parent);
        this.updateRaycaster(event.offsetX, event.offsetY);
    }

    /**
     *  更新辅助盒子
     */
    updateHelperBox() {
        const object = this.controlObject;
        // 更新helperbox;
        this.helperBox.position.copy(object.position)
        const obb = object.getOBB();
        this.helperBox.setScale([obb.width, obb.height, obb.depth])
        this.helperBox.rotation.copy(object.rotation)
        this.helperBox.setWorldPosition(obb.center);
        //===================
        this.children.forEach(axisGroup => {
            axisGroup.children.forEach(scaleBox => {
                scaleBox.scale.set(1 / this.helperBox.scale.x, 1 / this.helperBox.scale.y, 1 / this.helperBox.scale.z)
            })
        });
    }

    protected generate() {
        const config = this.config;
        const keys = Object.keys(config);
        for (const axis of keys) {
            const singleAxis = config[axis];
            const pn = Object.keys(singleAxis);
            const axisGroup = new THREE.Group();

            for (const direct of pn) {
                const singleDirect = singleAxis[direct];
                const rotation = singleDirect.rotation || new THREE.Euler();
                singleDirect.element.forEach(el => {
                    const {
                        object,
                        position = new THREE.Vector3(),
                        scale = new THREE.Vector3(1, 1, 1),
                    } = el;
                    object.transMode = this.transMode;
                    object.axis = axis;
                    object.tag = direct === 'p' ? '+' : '-';
                    object.position.copy(position);
                    object.scale.copy(scale);

                    axisGroup.add(object);
                    axisGroup.rotation.copy(rotation)
                });
            }
            this.add(axisGroup);
        }
    }

    protected getSelectedObject = (event: PointerEvent) => {

        if (this.state === 'disable') return;
        //射线拾取到的激活状态
        const intersects = [];

        this.update(event);
        this.traverse(child => {
            if (child.visible && this.parent.visible) {
                child.raycast(this.raycaster, intersects);
            }
        })

        return intersects[0];

    }

    protected setPickedStyle(objectArray, value) {
        if (objectArray.length) {
            objectArray.forEach(object => {
                const hexStr = `0x${(object.material as THREE.MeshBasicMaterial).color.getHexString().replace(/\d/g, value)}`;
                (object.material as THREE.MeshBasicMaterial).color.setHex(Number(hexStr));
            })
        }
    }

    protected startTransform = (event: PointerEvent) => {
        //更新
        this.update(event);

        let result = false;
        const object = this.controlObject;
        if (!object) return result;
        const planeIntersect = this.raycaster.intersectObject(assistPlane)[0];

        if (object && planeIntersect) {
            this.objectAABB = object.getWorldAABB();
            const center = object.name === 'dummy' ? object.position.clone() : new THREE.Vector3().fromArray(this.objectAABB.center);
            const coordLocPos = center.clone()
            this.centerPositionOffset = object.position.clone().sub(center);
            this.positionStart = new THREE.Vector3().copy(center);
            this.quaternionStart = new THREE.Quaternion().copy(object.name === 'dummy' ? this.parent.quaternion : object.quaternion);
            this.scaleStart = new THREE.Vector3().copy(object.scale);
            this.gizmoPositionStart = new THREE.Vector3().copy(coordLocPos);
            this.localPosStart = new THREE.Vector3().copy(planeIntersect.point).sub(this.gizmoPositionStart);
            // todo cnl
            // editorEvent.dispatch('TRANSFORM_MOUSE_DOWN', [this.transMode]);
            result = true;
        }
        return result;
    }

    protected transform = (e: PointerEvent) => {
        this.update(e);

        const object = this.controlObject;
        if (!object) return false;
        const planeIntersect = this.raycaster.intersectObject(assistPlane)[0];

        if (planeIntersect) {
            this.localPosEnd = new THREE.Vector3().copy(planeIntersect.point).sub(this.gizmoPositionStart);
            this.offset.copy(this.localPosEnd).sub(this.localPosStart);
            //控制走不走每一个子对象里面后面的逻辑
            if (object.name === 'dummy')
                return false;
            else
                return true;
        }
        return false;
    }

    protected transformDone = () => {
        const object = this.controlObject;
        if (!object) return;
        this.offset.set(0, 0, 0);
    }

    private updateRaycaster = (offsetX, offsetY) => {
        const pointer = this.screenToNdc(offsetX, offsetY);
        this.raycaster.setFromCamera(pointer, cameraTool.camera);
    }

    private screenToNdc = (offsetX, offsetY) => {
        const pointer = new THREE.Vector2();

        pointer.x = (offsetX / this.renderDom.clientWidth) * 2 - 1;
        pointer.y = - (offsetY / this.renderDom.clientHeight) * 2 + 1;
        return pointer;
    }

}
