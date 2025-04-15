import * as THREE from "three";
import { event } from '../event'
import { BaseObject3D, lightTool } from '@enerv-3d/core';

/**
 * 灯光编辑能力
 * @date 2024/1/8 - 17:54:15
 *
 * @export
 * @class LightEditor
 * @typedef {LightEditor}
 */
export class LightEditor {
    sceneRoot: BaseObject3D;


    constructor(sceneRoot) {
        if (new.target !== LightEditor) {
            return
        }
        if (!LightEditor._instance) {
            LightEditor._instance = this;
            this.sceneRoot = sceneRoot
            this._registEvent()
        }
        return LightEditor._instance;
    }

    static _instance: LightEditor;

    _registEvent() {
        event.on('SCENE_INIT_END', () => {
            lightTool.autoFitPosition(this.sceneRoot);
        }, {
            des: '监听场景加载后自动适配场景视角'
        });
    }

    /**
     * 设置灯光颜色，如果传递groundColor需要判断是否为半球光源
     * @date 2024/1/9 - 09:29:34
     *
     * @param {THREE.Light} light
     * @param {string} color
     * @param {?string} [groundColor]
     */
    setLightColor(light: THREE.Light, color: string, groundColor?: string) {
        if (groundColor && light instanceof THREE.HemisphereLight) {
            light.color = new THREE.Color(color)
            light.groundColor = new THREE.Color(groundColor)
        } else {
            light.color = new THREE.Color(color)
        }
    }


    /**
     * 设置灯光强度
     * @date 2024/1/9 - 09:26:31
     *
     * @param {THREE.Light} light
     * @param {number} intensity
     */
    setLightIntensity(light: THREE.Light, intensity: number) {
        light.intensity = intensity;
    }

    /**
     * 设置灯光沿着轴向旋转
     * @date 2024/1/9 - 11:18:15
     *
     * @param {{
     *         light: THREE.Light,
     *         axis: 'y' | 'z' | 'x',
     *         angle: number 角度
     *     }} options
     */
    rotateLight(options: {
        light: THREE.Light,
        axis: 'y' | 'z' | 'x',
        angle: number
    }) {
        const { light, axis, angle } = options;
        switch (axis) {
            case 'x':
                light.rotateX(THREE.MathUtils.degToRad(angle))
                break;
            case 'y':
                light.rotateY(THREE.MathUtils.degToRad(angle))
                break;
            case 'z':
                light.rotateZ(THREE.MathUtils.degToRad(angle))
                break;
            default:
                break;
        }

    }




}