
import { BaseObject, ObjectType } from '../object';
import { event } from '../event'
import { selectionTool } from '@enerv-3d/core';
import { factory } from '../object/factory';

export class Selector {
    public selected: ObjectType | null;
    public curLevel: ObjectType | null;
    public preLevel: ObjectType | null;

    constructor(root: BaseObject) {
        if (new.target !== Selector) {
            return
        }
        if (!Selector._instance) {
            Selector._instance = this;
            // 这里添加构造函数属性
            selectionTool.curLevel = root.node;
            this.selected = null;
            this.curLevel = null;
            this.preLevel = null;
            event.on('CORE_OBJECT_SELECTED', (obj) => {
                const appKey = obj?.appKey;
                if (!appKey) {
                    this.selected = null;
                } else {
                    this.selected = factory.getObjectByID(appKey);
                }
                event.dispatch('OBJECT_SELECTED', [this.selected])
            })
            event.on('CORE_LEVEL_CHANGE', (cur, pre) => {
                const appKeyCur = cur?.appKey || '';
                const curObj = factory.getObjectByID(appKeyCur as string);

                const appKeyPre = pre?.appKey || '';
                const preObj = factory.getObjectByID(appKeyPre as string);

                event.dispatch('SCENE_LEVEL_CHANGE', [curObj, preObj])
            })
        }
        return Selector._instance;
    }

    static _instance: Selector;



    /**
     * 设置当前选择选中物体
     * @date 2024/2/18 - 13:26:45
     *
     * @param {(ObjectType | null)} object
     */
    setSelection(object: ObjectType | null) {
        if (object) {
            const res = selectionTool.setSelection(object.node)
            if (res) this.selected = object
        } else {
            selectionTool.setSelection(null);
            this.selected = null;
        }
    }

    /**
     * 获取当前场景中选中的物体,如果是框选对象，则返回其子对象数组
     * @return {ObjectType | null}
     */
    getSelection(): ObjectType | null {
        const obj = selectionTool.getSelection();
        if (!obj) return null;
        const appKey = obj.appKey;
        return factory.getObjectByID(appKey as string);
    }


    /**
     * 设置场景根节点
     * @date 2024/2/18 - 13:33:21
     *
     * @param {ObjectType} object  当前被设置根节点的物体
     * @param {?boolean} [crossLevel]  是否需要跨层级
     */
    setSceneLevel(object: ObjectType, crossLevel?: boolean) {
        //判断当前是否为禁用鼠标状态
        if (!object || !object.node) return;
        const res = selectionTool.setSceneLevel(object.node, crossLevel)
        if (res) this.curLevel = object;
    }

    /**
     * 获取当前场景根节点
     * @returns 
     */
    getSceneLevel(): ObjectType | null {
        const obj = selectionTool.getSceneLevel();
        if (!obj) return null;
        const appKey = obj.appKey;
        return factory.getObjectByID(appKey as string);
    }

    /**
     * 是否允许层级操作
     * @date 2024/2/18 - 13:36:02
     *
     * @param {boolean} isAllow
     * @param {?boolean} pauseFlying
     */
    setLevelAllowed(isAllow: boolean, pauseFlying?: boolean) {
        selectionTool.pauseLevelChange = !isAllow;
        selectionTool.pauseLevelChangeAnimation = !pauseFlying;
    }


}