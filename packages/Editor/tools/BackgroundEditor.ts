import { sceneEffectTool } from '@enerv-3d/core';


type BackgroundType = 'color' | 'image' | '360Image' | 'skyBox';


/**
 * 编辑器场景对于背景图和环境效果的编辑能力
 * @date 2024/1/8 - 17:37:36
 *
 * @export
 * @class BackgroundEditor
 * @typedef {BackgroundEditor}
 */
export class BackgroundEditor {


    constructor() {
        if (new.target !== BackgroundEditor) {
            return
        }
        if (!BackgroundEditor._instance) {

            BackgroundEditor._instance = this;
            // this._initEvent();
            sceneEffectTool.initDefaultEnv();

        }
        return BackgroundEditor._instance;
    }

    static _instance: BackgroundEditor;


    /**
     * 设置背景
     * @date 2024/1/8 - 17:42:43
     *
     * @param {{
     *         type: BackgroundType,
     *         color?: string | number,
     *         url?: string
     *     }} options
     */
    setBackground(options: {
        type: BackgroundType,
        color?: string | number,
        url?: string
    }) {
        // 设置天空盒
        sceneEffectTool.setBackground(options)
    }

    /**
     * 设置环境贴图，暂时约定格式仅支持HDR
     * @date 2024/1/8 - 17:48:49
     *
     * @param {{
     *         url?: string
     *     }} options
     */
    setEnvironment(options: {
        url?: string
    }) {
        sceneEffectTool.setEnvironment(options)
    }


}