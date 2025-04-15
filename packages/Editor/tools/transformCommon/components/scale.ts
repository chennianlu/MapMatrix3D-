import { MeshExtend, transformType, color, axisMap } from "../defines";
import BaseType from "./BaseType";
import { event } from '../../../event';

import * as THREE from 'three';

export default class Scale extends BaseType {
    protected override transMode: transformType = 'scale';
    public targetSelectedPos: THREE.Vector3
    protected override config = {
        x: {
            p: {
                element: [
                    {
                        object: new THREE.Mesh(
                            new THREE.BoxGeometry(0.04, 0.08, 0.08),
                            new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0xff2222, opacity: 0.6 })
                        ),
                        position: new THREE.Vector3(0.5, -0.5, 0),
                    }
                ]
            },
            n: {
                element: [
                    {
                        object: new THREE.Mesh(
                            new THREE.BoxGeometry(0.04, 0.08, 0.08),
                            new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0xff2222, opacity: 0.6 })
                        ),
                        position: new THREE.Vector3(-0.5, -0.5, 0),
                    }
                ]
            }
        },
        y: {
            p: {
                element: [
                    {
                        object: new THREE.Mesh(
                            new THREE.BoxGeometry(0.08, 0.04, 0.08),
                            new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0x22ff22, opacity: 0.6 })
                        ),
                        position: new THREE.Vector3(0, 0.5, 0),
                    }
                ]
            },
            n: {
                element: [
                    // {
                    //     object: new THREE.Mesh(
                    //         new THREE.BoxGeometry(0.08, 0.04, 0.08),
                    //         new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0x22ff22, opacity: 0.6 })
                    //     ),
                    //     position: new THREE.Vector3(0, -0.5, 0),
                    // }
                ]
            }
        },
        z: {
            p: {
                element: [
                    {
                        object: new THREE.Mesh(
                            new THREE.BoxGeometry(0.08, 0.08, 0.04),
                            new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0x2222ff, opacity: 0.6 })
                        ),
                        position: new THREE.Vector3(0, -0.5, 0.5),
                    }
                ]
            },
            n: {
                element: [
                    {
                        object: new THREE.Mesh(
                            new THREE.BoxGeometry(0.08, 0.08, 0.04),
                            new THREE.MeshBasicMaterial({ ...this.defaultMatConf, color: 0x2222ff, opacity: 0.6 })
                        ),
                        position: new THREE.Vector3(0, -0.5, -0.5),
                    }
                ]
            }
        }
    }

    protected override lastSelected = [];

    private snap: number = 2;

    private scaleStartMap = new Map();

    private positionStartMap = new Map();

    private lastScaleMap = new Map();

    private lastValue: number[];
    private _v1: THREE.Vector3;

    constructor(renderDom, helperBox) {
        super(renderDom, helperBox);
        this.generate();
        this._v1 = new THREE.Vector3();
        event.on('POINT_MOVE', this.activeSelected);
        event.on('POINT_UP', this.endScale);

    }

    override generate() {
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

    public updateShowState(object) {
        if (!object) return;
        this.traverse(child => {
            child.visible = true;
        })
        if (object.limitScaleX) {
            this.children[0].traverse(child => {
                child.visible = false;
            })
        }
        if (object.limitScaleY) {
            this.children[1].traverse(child => {
                child.visible = false;
            })
        }
        if (object.limitScaleZ) {
            this.children[2].traverse(child => {
                child.visible = false;
            })
        }
    }

    public hideNegScale = () => {
        this.traverse(child => {
            if ((child as MeshExtend).tag && (child as MeshExtend).tag === '-')
                child.visible = false;
        });
    }


    private activeSelected = (e: any) => {
        const select = this.getSelectedObject(e);

        this.selected = null;
        this.parent.userData.scale = undefined;
        if (this.lastSelected.length) {
            super.setPickedStyle(this.lastSelected as Array<THREE.Mesh>, color.normal);
            this.setGizmoScale(this.lastSelected as Array<THREE.Mesh>, 1);
            this.lastSelected = [];
        }
        if (this.parent.userData.translate || this.parent.userData.rotate || !select) return;

        const object = select.object;
        const brother = object.parent.children;
        const allActive = [];

        this.selected = object;
        this.targetSelectedPos = this.selected.getWorldPosition(this._v1.clone());
        this.parent.userData.scale = object;
        e.shiftKey ? allActive.push(...this.children[0].children, ...this.children[1].children, ...this.children[2].children) :
            e.ctrlKey ? allActive.push(...brother) :
                allActive.push(object);
        super.setPickedStyle(allActive, color.active);
        this.setGizmoScale(allActive, 2);
        this.lastSelected = [...allActive];

        //绑定事件
        this.mouseDownFn = this.startScale;
        this.updateHelperBox();
        event.once('POINT_DOWN', this.mouseDownFn);
    }

    /**
     * 设置gizmo的scale属性
    */
    private setGizmoScale = (objectArray, value) => {
        objectArray.forEach(object => {
            const axis = object.axis;
            // object.scale[axis] = value ?? 1;
            object.material.opacity = value === 1 ? 0.6 : 1;
        });
    }

    private startScale = (e: PointerEvent) => {
        if (e.button !== 0 || !this.selected) {
            this.mouseDownFn = null;
            return;
        }
        this.startTransform(e);
        this.controlObject.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                this.scaleStartMap.set(child.uuid, child.scale.clone());
                this.positionStartMap.set(child.uuid, child.position.clone());
                this.lastScaleMap.set(child.uuid, child.scale.clone());
            }
        })
        this.lastValue = this.controlObject.scale.toArray()
        // 暂停摄影机控件操作
        this.cameraControl.enabled = false;
        event.off('POINT_MOVE', this.activeSelected);
        event.on('POINT_MOVE', this.doScale);
    }

    private doScale = (e: any) => {
        const check = this.transform(e);

        if (!check || this.independent) return;

        const axis = this.selected.axis;
        const tag = this.selected.tag;
        const obj = this.controlObject;
        const coordLocQua = obj.quaternion.clone();

        const OBBS = obj.getOBB();
        const center = new THREE.Vector3().fromArray(OBBS.center);

        /**
         * 处理缩放的标准化业务逻辑（单位缩放、单边缩放）W
        */
        const standardAdjust = () => {

            const object = this.controlObject;
            const OBBE = object.getOBB();
            const endGizmoPos = this.selected.getWorldPosition(this._v1.clone());
            const forward = endGizmoPos.sub(this.targetSelectedPos)
            forward.normalize();
            let curOffset;

            switch (axis) {
                case 'x':
                    curOffset = (OBBE.width - OBBS.width) / 2;
                    break;
                case 'y':
                    curOffset = (OBBE.height - OBBS.height) / 2;
                    break;
                case 'z':
                    curOffset = (OBBE.depth - OBBS.depth) / 2;
                    break;
                default:
                    break;
            }

            if (tag === '+') {
                if (curOffset > 0) {
                    if (forward[axis] > 0) {
                        object.position.addScaledVector(forward, curOffset)
                    } else {
                        object.position.addScaledVector(forward.multiplyScalar(-1), Math.abs(curOffset))
                    }
                } else {
                    if (forward[axis] > 0) {
                        object.position.addScaledVector(forward.multiplyScalar(-1), Math.abs(curOffset))
                    } else {
                        object.position.addScaledVector(forward, Math.abs(curOffset))
                    }
                }
            } else if (tag === '-') {
                if (curOffset > 0) {
                    if (forward[axis] < 0) {
                        object.position.addScaledVector(forward, curOffset)
                    } else {
                        object.position.addScaledVector(forward.multiplyScalar(-1), Math.abs(curOffset))
                    }
                } else {
                    if (forward[axis] < 0) {
                        object.position.addScaledVector(forward.multiplyScalar(-1), Math.abs(curOffset))
                    } else {
                        object.position.addScaledVector(forward, Math.abs(curOffset))
                    }
                }
            }

        }

        const scaleMesh = (object) => {
            const tmpStart = new THREE.Vector3().copy(this.localPosStart);
            const tmpEnd = new THREE.Vector3().copy(this.localPosEnd);
            let distance = tmpStart.distanceTo(tmpEnd);
            this.lastScaleMap.set(object.uuid, object.scale.clone());
            // offset = this.scaleStart.x / relativeOne + 1;
            // offset转换为相对原方向的缩放比例
            const scaleSnap = this.snap;


            // 禁止负向缩放
            // if ((tag === '+' && this.localPosEnd[axis] < 0) || (tag === '-' && this.localPosEnd[axis] > 0)) return;
            // 获取拖动方向
            const forward = tmpEnd.sub(tmpStart);
            forward.normalize();

            let axisOffset, selfForWord, dot;
            //获取拖动滑块的方向和鼠标移动的方向  根据夹角判断增减
            switch (axis) {
                case 'x':
                    // 当前x轴正向的实际方向
                    selfForWord = new THREE.Vector3(1, 0, 0).applyEuler(this.controlObject.rotation);
                    dot = forward.dot(selfForWord)
                    axisOffset = dot > 0 ?
                        tag === '+' ? this.scaleStart.x + distance : this.scaleStart.x - distance
                        :
                        tag === '+' ? this.scaleStart.x - distance : this.scaleStart.x + distance;

                    if (axisOffset > this.snap) object.scale.x = axisOffset;


                    break;
                case 'y':
                    selfForWord = new THREE.Vector3(0, 1, 0).applyEuler(this.controlObject.rotation);
                    dot = forward.dot(selfForWord)
                    axisOffset = dot > 0 ?
                        tag === '+' ? this.scaleStart.y + distance : this.scaleStart.y - distance
                        :
                        tag === '+' ? this.scaleStart.y - distance : this.scaleStart.y + distance;

                    if (axisOffset > this.snap) object.scale.y = axisOffset;

                    break;
                case 'z':

                    selfForWord = new THREE.Vector3(0, 0, 1).applyEuler(this.controlObject.rotation);
                    dot = forward.dot(selfForWord)
                    axisOffset = dot > 0 ?
                        tag === '+' ? this.scaleStart.z + distance : this.scaleStart.z - distance
                        :
                        tag === '+' ? this.scaleStart.z - distance : this.scaleStart.z + distance;

                    if (axisOffset > this.snap) object.scale.z = axisOffset;
                    break;
                default:
                    break;
            }
            // 单边处理逻辑
            standardAdjust();
            // 更新辅助框
            this.updateHelperBox();
            event.dispatch('OBJECT_EDITED_CHANGING', [object, Editor_Commands.setScale])

            this.lastScaleMap.set(object.uuid, object.scale.clone());
        }

        scaleMesh(obj);

        this.parent.position.copy(center.clone());
    }

    private endScale = () => {
        if (!this.visible) return;
        const object = this.controlObject;
        if (!object) return;
        this.transformDone();
        this.mouseMoveFn = this.activeSelected;
        // 恢复摄影机控件操作
        this.cameraControl.enabled = true;
        const newData = object.scale.toArray();

        if (this.lastValue) {
            event.dispatch('OBJECT_EDITED_CHANGE', [object, Editor_Commands.setScale, newData, this.lastValue])
        }
        event.off('POINT_MOVE', this.doScale);
        event.on('POINT_MOVE', this.activeSelected);
    }

}
