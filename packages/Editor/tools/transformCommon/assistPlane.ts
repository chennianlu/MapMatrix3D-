import * as THREE from 'three'
import { axisName, transformType } from './defines';
import { cameraTool } from '@enerv-3d/core'


const unitX: THREE.Vector3Tuple = [1, 0, 0];
const unitY: THREE.Vector3Tuple = [0, 1, 0];
const unitZ: THREE.Vector3Tuple = [0, 0, 1];

class AssistPlane extends THREE.Mesh {

    public controlObject;


    override readonly type: string = 'AssistPlane';

    private materialDefault = {
        visible: false,
        wireframe: true,
        side: THREE.DoubleSide as THREE.Side,
        transparent: true,
        opacity: 1,
        color: 'red',
        toneMapped: false
    }

    private calcUpAndVertical: (transMode: transformType, axis: axisName, eye: THREE.Vector3, transformController) => {
        upVector: THREE.Vector3, dirVertical: THREE.Vector3
    } = (transMode, axis, eye, transformController) => {
        //这块需要兼容曲面编辑特性
        const quaternion = transformController.quaternion;
        const vector_x = new THREE.Vector3(...unitX).applyQuaternion(quaternion);
        const vector_y = new THREE.Vector3(...unitY).applyQuaternion(quaternion);
        const vector_z = new THREE.Vector3(...unitZ).applyQuaternion(quaternion);
        let upVector = new THREE.Vector3(),
            dirVertical = new THREE.Vector3();
        //default up y轴的方向向量
        upVector = vector_y.clone()

        switch (transMode) {
            case 'position':
            case 'scale':
                switch (axis) {
                    case 'x':
                        //计算eye与对应轴的平面的法向量（也就代表eye-o-x轴平面）
                        upVector.copy(eye).cross(vector_x);
                        //计算eye投影到x轴的垂线方向（在eye-o-x平面上，且垂直于x轴）
                        dirVertical.copy(vector_x).cross(upVector);
                        break;
                    case 'y':
                        upVector.copy(eye).cross(vector_y);
                        dirVertical.copy(vector_y).cross(upVector);
                        break;
                    case 'z':
                        upVector.copy(eye).cross(vector_z);
                        dirVertical.copy(vector_z).cross(upVector);
                        break;
                    case 'xz':
                        upVector.set(0, 0, 1)
                        dirVertical.set(0, 1, 0)
                }
                break;
            case 'rotation':
                switch (axis) {
                    case 'x':
                        dirVertical.copy(vector_x);
                        break;
                    case 'y':
                        upVector.set(0, 0, 1)
                        dirVertical.set(0, 1, 0)
                        break;
                    case 'z':
                        dirVertical.copy(vector_z);
                        break;
                }
                break;
            default:
                // special case for rotate
                dirVertical.set(0, 0, 0);

        }
        return { upVector, dirVertical };
    }

    public updateAssiatPlane = (transMode, axis, transformController) => {
        const camera = cameraTool.camera;
        if (!camera) return;

        const eye = new THREE.Vector3()
            .copy(camera.position)
            .sub(this.parent.position).normalize();
        //目的：让此平面垂直于eye投影到各个轴（面）的垂线。
        //因为平面的初始状态就是XoY面，所以采用等同于相机viewMatrix的方式
        //去设置xyz->x'y'z'的旋转信息。并且可以直接运用于平面的旋转。

        //没选中物体或者没选中轴
        if (!axis || !transMode) return;

        const { upVector, dirVertical } = this.calcUpAndVertical(
            <transformType>transMode,
            <axisName>axis,
            eye,
            transformController
        );

        this.position.copy(transformController.position);
        if (dirVertical.length() === 0) {
            // If in rotate mode, make the plane parallel to camera(原注释)
            //this.quaternion.copy(camera.quaternion);
        } else {
            //这地方还有点问题
            const tempMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), dirVertical, upVector);
            this.quaternion.setFromRotationMatrix(tempMatrix);
        }
    }

    constructor() {
        super(
            new THREE.PlaneGeometry(6666, 6666, 2, 2)
        )
        this.material = new THREE.MeshBasicMaterial(this.materialDefault);
    }
}

export default new AssistPlane();
