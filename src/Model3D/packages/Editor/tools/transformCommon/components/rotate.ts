import { transformType, axisName, color } from "../defines";
import BaseType, { SuperSprite } from "./BaseType";
import { event } from '../../../event';
import * as THREE from 'three';
import { loader, SpriteObject3D, } from '@enerv-3d/core'


export default class Rotate extends BaseType {

    protected override transMode: transformType = 'rotation';

    private tmpQuaternion = new THREE.Quaternion();

    private lastRotateAngle: number;

    private assistCircle;

    private circlePlane;

    private startAngle;

    private lastValue;
    rotateMode: SpriteObject3D;
    spriteConfig: { y: string; y_hover: string; };

    constructor(renderDom, helperBox) {
        super(renderDom, helperBox);
        this.spriteConfig = {
            y: '/images/sprite/angle_y.png',
            y_hover: '/images/sprite/angle_y_select.png',
        }
        this.generateSprite();
        event.on('POINT_MOVE', this.activeSelected);
        event.on('POINT_UP', this.endRotate);

    }

    /**
     * 创建一个旋转控件（Sprite）
     */
    async generateSprite() {
        const texture = await loader.loadTexture(this.spriteConfig.y_hover);
        const material = new THREE.SpriteMaterial({
            map: texture as THREE.Texture,
        });
        const img2D = new SpriteObject3D(material);
        img2D.material.depthTest = false;
        (img2D as unknown as SuperSprite).axis = 'y';
        (img2D as unknown as SuperSprite).tag = '+';
        this.add(img2D);
        img2D.scale.set(0.2, 0.2, 0.2);
        img2D.material.transparent = true;
        img2D.material.opacity = .8;
        this.rotateMode = img2D;
        this.position.x = 0.2;
        // TODO  hover  预加载texture  切换map
    }

    private activeSelected = (e: any) => {
        const select = this.getSelectedObject(e);
        if (!this.rotateMode) return;
        this.rotateMode.material.opacity = 0.8;
        if (select?.object) {
            select.object.material.opacity = 1;
        }
        this.selected = null;
        this.parent.userData.rotate = undefined;
        if (this.lastSelected.length) {
            super.setPickedStyle(this.lastSelected as Array<THREE.Mesh>, color.normal);
            this.lastSelected = [];
        }
        if (this.parent.userData.translate || this.parent.userData.scale || !select) return;

        const object = select.object;
        const brother = object.parent.children;

        this.selected = object;
        this.parent.userData.rotate = object;
        super.setPickedStyle(brother, color.active);
        this.lastSelected.push(...brother);

        //绑定事件
        event.once('POINT_DOWN', this.prepareRotate);
    }

    private prepareRotate = (e: any) => {
        if (e.button !== 0 || !this.selected) {
            this.mouseDownFn = null;
            return;
        }

        if (!this.startTransform(e)) return;
        // this.generateCircle(this.selected.axis, this.localPosStart.clone());
        this.handleVisible(false);

        // 暂停摄影机控件操作
        this.cameraControl.enabled = false;
        this.lastValue = {
            position: this.controlObject.position.clone(),
            rotation: this.controlObject.rotation.clone()
        }
        event.off('POINT_MOVE', this.activeSelected);
        event.on('POINT_MOVE', this.doRotate);
    }

    private doRotate = (e: any) => {
        const check = this.transform(e);
        if (!check) return;
        const axis = this.selected?.axis;
        if (!axis) return;
        const object = this.controlObject;
        //按住shift时15°、15°转。
        const snap = e.shiftKey ? THREE.MathUtils.degToRad(15) : THREE.MathUtils.degToRad(1);
        const rotateAxis = {
            x: new THREE.Vector3(1, 0, 0),
            y: new THREE.Vector3(0, 1, 0),
            z: new THREE.Vector3(0, 0, 1)
        };
        let rotateAngle = 0;
        let isClockWise;
        this.tmpQuaternion = new THREE.Quaternion();
        const calcRotateAngle = () => {
            this.localPosStart.normalize();
            this.localPosEnd.normalize();
            isClockWise = this.localPosStart.clone().cross(this.localPosEnd).dot(rotateAxis[axis]) < 0;
            //顺时针为正，逆时针为负
            rotateAngle = isClockWise ?
                this.localPosStart.angleTo(this.localPosEnd) :
                -this.localPosStart.angleTo(this.localPosEnd);
            // Apply rotate snap
            rotateAngle = Math.round(rotateAngle / snap) * snap;

            //正负交替为信号，角度一直是在0到Π和-Π到0的区间变化，但是在起始处来回切换不应该适用以下变换。
            //为防止一开始就在真正的交替条件附近，需要设定一个合适的阈值。
            if (this.lastRotateAngle && this.lastRotateAngle * rotateAngle < 0 && Math.abs(this.lastRotateAngle) > 0.05) {
                this.lastRotateAngle = this.lastRotateAngle > 0 ?
                    Math.PI * 2 - Math.abs(rotateAngle) :
                    Math.abs(rotateAngle) - Math.PI * 2;
                if (Math.abs(this.lastRotateAngle) >= Math.PI * 2) this.lastRotateAngle = 0;
            } else {
                this.lastRotateAngle = rotateAngle;
            }
        }
        if (object.parent)
            rotateAxis[axis].applyQuaternion(object.parent?.quaternion.clone().invert());


        calcRotateAngle();
        this.tmpQuaternion.setFromAxisAngle(rotateAxis[axis], -rotateAngle);
        const finalQuaternion = this.tmpQuaternion.clone().multiply(this.quaternionStart).normalize();
        //const tempEuler = new THREE.Euler();
        const coordLocPos = new THREE.Vector3();
        coordLocPos.sub(this.centerPositionOffset);

        coordLocPos.applyQuaternion(this.tmpQuaternion);

        //绕任意点旋转的问题就是一个绕球旋转的问题
        object.setRotation(finalQuaternion, 'quaternion');
        object.setPosition(this.gizmoPositionStart.clone().sub(coordLocPos));
        //处理旋转的时候gizmo显示
        this.rotating(axis, this.lastRotateAngle);
        event.dispatch('OBJECT_EDITED_CHANGING', [object, Editor_Commands.setRotation])

    }

    /**
     * 处理旋转的时候辅助圆面的显示修改
     */
    private rotating = (axis: axisName, rotateAngle: number) => {
        let circlePlane = this.circlePlane;
        const createCirclePlane = (startAngle: number, color: number) => {
            return new THREE.Mesh(
                new THREE.CircleGeometry(0.3, 24, startAngle, Math.abs(rotateAngle)),
                new THREE.MeshBasicMaterial({ ...this.defaultMatConf, side: THREE.DoubleSide, color: color, opacity: 0.3 })
            );
        }
        //去掉以前生成逻辑
        if (circlePlane) {

            //销毁所有缓冲区数据
            this.disposeAll(circlePlane);
            //指向置空
            this.circlePlane = null;
        }

        //每个轴的圆面的thetaStart主要受到两个因素
        //①开始的角度是参照（+x、+y、+z）哪个轴计算的。②圆面生成方式里3点中方向为thetaStart=0。
        switch (axis) {
            case 'x':
                circlePlane = createCirclePlane(this.startAngle + Math.PI * 0.5, 0xff1111);
                circlePlane.rotateY(Math.PI * 0.5);
                rotateAngle > 0 && circlePlane.rotateZ(Math.PI * 2 - rotateAngle);
                break;
            case 'y':
                circlePlane = createCirclePlane(Math.PI * 0.5 - this.startAngle, 0x11ff11);
                circlePlane.rotateX(Math.PI * 0.5);
                rotateAngle < 0 && circlePlane.rotateZ(Math.PI * 2 + rotateAngle);
                break;
            case 'z':
                circlePlane = createCirclePlane(this.startAngle + Math.PI * 0.5, 0x1111ff);
                //rotateAngle越大，扇形范围越大，需要旋转的角度就越小。
                rotateAngle > 0 && circlePlane.rotateZ(Math.PI * 2 - rotateAngle);
                break;
            default:
                console.warn('旋转轴不正确')
                return;
        }
        //转动球轴
        this.circlePlane = circlePlane;
    }

    private disposeAll = (threeObject) => {
        if (threeObject.type === 'Mesh') {
            const object = threeObject;
            object.geometry.dispose();
            Array.isArray(object.material) ?
                object.material.forEach(material => {
                    material.dispose()
                }) :
                object.material.dispose();
        } else {
            threeObject.children.forEach((child) => {
                this.disposeAll(child);
            });
        }
    }

    private endRotate = () => {
        if (!this.visible) return;

        const object = this.controlObject;
        if (!object) return;
        const coordLocQua = new THREE.Quaternion();

        if (this.independent) {
            coordLocQua.premultiply(this.tmpQuaternion);
        }
        this.tmpQuaternion.identity();

        this.transformDone();
        event.off('POINT_MOVE', this.doRotate);
        event.on('POINT_MOVE', this.activeSelected);
        const newData = {
            position: this.controlObject.position.clone(),
            rotation: this.controlObject.rotation.clone()
        }
        if (this.lastValue) {
            event.dispatch('OBJECT_EDITED_CHANGE', [object, Editor_Commands.setRotation, newData, this.lastValue])
        }
        // 恢复摄影机控件操作
        this.cameraControl.enabled = true;
        this.updateHelperBox();

        this.handleVisible(true);
    }


    private handleVisible = (visible: boolean) => {
        this.parent.children.forEach((object) => {
            if (object !== this) {
                object.traverse(child => child.visible = visible);
            }
        })
        this.helperBox.traverse(cur => cur.visible = visible)
        if (visible) {
            this.position.x = 0.2;
            this.rotateMode.material.opacity = 0.8;

        } else {
            this.position.x = 0;
            this.rotateMode.material.opacity = 1;

        }
    }

}

