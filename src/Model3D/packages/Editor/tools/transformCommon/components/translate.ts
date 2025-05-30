import { transformType, color, runningState } from "../defines";
import BaseType, { SuperSprite } from "./BaseType";
import { event } from '../../../event';
import * as THREE from 'three';
import { loader, SpriteObject3D, } from '@enerv-3d/core'

export default class Translate extends BaseType {

    protected override transMode: transformType = 'position';
    private snap: number = 1;

    private lastCenter = new THREE.Vector3();
    private lastValue: number[];
    private spriteConfig: { xz: string; xz_hover: string; y: string; y_hover: string; };
    private transModeXZ: SpriteObject3D;
    private transModeY: SpriteObject3D;


    constructor(renderDom, helperBox) {
        super(renderDom, helperBox);
        // this.generate();
        this.spriteConfig = {
            xz: '/images/sprite/translate_xz.png',
            xz_hover: '/images/sprite/translate_xz_select.png',
            y: '/images/sprite/translate_y.png',
            y_hover: '/images/sprite/translate_y_select.png',
        }
        this.generateSprite();

        event.on('POINT_MOVE', this.activeSelected);
        event.on('POINT_UP', this.endTranslate);

    }

    /**
     * 创建一个旋转控件（Sprite）
     */
    async generateSprite() {
        const texture_xz = await loader.loadTexture(this.spriteConfig.xz_hover);
        // const texture_xz_hover = await loader.loadTexture(this.spriteConfig.xz_hover);
        const texture_y = await loader.loadTexture(this.spriteConfig.y_hover);
        // const texture_y_hover = await loader.loadTexture(this.spriteConfig.y_hover);

        const material = new THREE.SpriteMaterial({
            map: texture_xz as THREE.Texture,
        });
        const transModeXZ = new SpriteObject3D(material);
        transModeXZ.material.depthTest = false;
        (transModeXZ as unknown as SuperSprite).axis = 'xz';
        this.add(transModeXZ);
        this.transModeXZ = transModeXZ;
        transModeXZ.scale.set(0.2, 0.2, 0.2);
        this.transModeXZ.material.opacity = 0.8;

        //y
        const material2 = new THREE.SpriteMaterial({
            map: texture_y as THREE.Texture,
        });
        const transModeY = new SpriteObject3D(material2);
        transModeY.material.depthTest = false;
        (transModeY as unknown as SuperSprite).axis = 'y';
        this.add(transModeY);
        this.transModeY = transModeY;
        transModeY.scale.set(0.2, 0.2, 0.2);
        transModeY.position.x = -0.2;
        this.transModeY.material.opacity = 0.8;
    }

    private activeSelected = (e: any) => {
        const select = this.getSelectedObject(e);
        if (!this.transModeXZ || !this.transModeY) return;
        this.transModeXZ.material.opacity = 0.8;
        this.transModeY.material.opacity = 0.8;
        if (select?.object) {
            select.object.material.opacity = 1;
        }
        this.selected = null;
        this.parent.userData.translate = undefined;
        if (this.lastSelected.length) {
            super.setPickedStyle(this.lastSelected, color.normal);
            this.lastSelected.forEach(child => {

            })
            this.lastSelected = [];
        }
        if (this.parent.userData.rotate || this.parent.userData.scale || !select) return;

        const object = select.object;
        const brother = object.parent.children;

        this.selected = object;

        this.parent.userData.translate = object;
        super.setPickedStyle(brother, color.active);
        brother.forEach(child => {

        })
        this.lastSelected.push(...brother);

        //绑定事件
        event.once('POINT_DOWN', this.startTranslate);
    }

    private startTranslate = (e: any) => {
        if (e.button !== 0 || !this.selected) {
            this.mouseDownFn = null;
            return;
        }
        this.status = runningState.PENDING;
        this.lastValue = this.controlObject._getWorldPosition()

        if (!this.startTransform(e)) return;
        this.handleVisible(false)
        this.lastCenter.copy(this.positionStart);
        // 暂停摄影机控件操作
        this.cameraControl.enabled = false;
        event.off('POINT_MOVE', this.activeSelected);
        event.on('POINT_MOVE', this.translate);
    }

    override translate = (e: any) => {
        const check = this.transform(e);

        if (!check) return;
        if (this.status === runningState.NONE) return;
        const object = this.controlObject;
        if (!object || !this.selected) return;
        const axis = this.selected.axis;
        const snap = this.snap;
        const objectAABB = this.objectAABB;
        const stage = new THREE.Box3(
            new THREE.Vector3(-1000, -20, -1000),
            new THREE.Vector3(1000, 0, 1000)
        );
        const center = new THREE.Vector3().fromArray(objectAABB.center);
        const coordLocPos = center.clone();
        /**
         * 把变换数据做标准化调整（精度计算、出界限制、对齐）
        */
        const standardAdjust = () => {
            const tempVector = new THREE.Vector3();

            if (object.parent) {
                tempVector.setFromMatrixPosition(object.parent.matrixWorld)
                center.add(tempVector);
            }

            center[axis] = Math.round(center[axis] / snap) * snap;

            if (/x/.test(axis)) {
                //防止出界
                if (center.x >= objectAABB.width / 2 + stage.max.x) {
                    center.x = objectAABB.width / 2 + stage.max.x;
                }
                if (center.x <= objectAABB.width / 2 - stage.max.x) {
                    center.x = objectAABB.width / 2 - stage.max.x;
                }
            }
            if (/y/.test(axis) && !this.independent) {
                //防止出界
                if (center.y <= objectAABB.height / 2) {
                    center.y = objectAABB.height / 2;
                }
            }
            if (/z/.test(axis)) {
                //防止出界
                if (center.z >= objectAABB.depth / 2 + stage.max.z) {
                    center.z = objectAABB.depth / 2 + stage.max.z;
                }
                if (center.z <= objectAABB.depth / 2 - stage.max.z) {
                    center.z = objectAABB.depth / 2 - stage.max.z;
                }
            }
            if (object.parent) {
                center.sub(tempVector)
            }
        }
        const offset = new THREE.Vector3().copy(this.localPosEnd).sub(this.localPosStart);
        //一些通用处理过程
        offset.applyQuaternion(this.parent.quaternion.clone().invert());


        offset.applyQuaternion(this.parent.quaternion);
        //消除有的父对象的缩放旋转影响
        if (object.parent) {
            const parentQuaInv = object.parent.quaternion.clone().invert();
            const parentScale = object.parent.scale;
            offset.applyQuaternion(parentQuaInv).divide(parentScale);
        }
        if (axis === 'xz') {
            offset.y = 0;
        }
        if (axis === 'y') {
            offset.x = 0;
            offset.z = 0;
        }

        center.copy(offset.clone().add(this.positionStart));
        //对运算中间量做对应处理
        standardAdjust();
        object.setPosition(object.position.clone().add(center.clone().sub(this.lastCenter)));
        //gizmo加的是物体移动的差值
        this.parent.position.add(center.clone().sub(this.lastCenter));
        this.updateHelperBox();
        event.dispatch('OBJECT_EDITED_CHANGING', [object, Editor_Commands.setPosition])

        //记录上一次物体移动的center的结果
        this.lastCenter.copy(center);
    }

    private endTranslate = () => {
        if (!this.visible) return;
        const object = this.controlObject;
        if (!object) return;

        this.status = runningState.NONE;
        this.handleVisible(true)
        this.transformDone();
        this.mouseMoveFn = this.activeSelected;
        // 恢复摄影机控件操作
        this.cameraControl.enabled = true;
        event.off('POINT_MOVE', this.translate);
        event.on('POINT_MOVE', this.activeSelected);
        const newData = object._getWorldPosition();
        if (this.lastValue) {
            event.dispatch('OBJECT_EDITED_CHANGE', [object, Editor_Commands.setPosition, newData, this.lastValue])
        }
    }

    /**
     * 摄像机转动时候调整gizmo朝向
    */
    private lookTowards = () => { }

    private handleVisible = (visible: boolean) => {
        this.parent.children.forEach((object) => {
            if (object !== this) {
                // 隐藏控件其他物体
                object.traverse(child => {
                    child.visible = visible
                });
            } else {
                //当前控件处理逻辑
                this.children.forEach(cur => {
                    if (cur !== this.selected) cur.visible = visible
                })
            }

        })

        // this.helperBox.traverse(cur => cur.visible = visible)
        if (visible) {
            this.transModeXZ.position.x = 0;
            this.transModeY.position.x = -0.2;
            this.transModeXZ.material.opacity = 0.8;
            this.transModeY.material.opacity = 0.8;
        } else {
            this.selected.position.x = 0;
            this.transModeXZ.material.opacity = 1;
            this.transModeY.material.opacity = 1;
        }
    }
}
