import { Options } from '../../../src/managers/eventManager/core/eventBinding';
import { EventParams } from '../../../src/managers/eventManager/core/defines';
import { Object3DType } from '../../../src/types';


/**
 * 3D系统的通用事件
 */
export const EDITOR_EVENTS: { [name: string]: [list: Array<any>] | [] } = {

    OBJECT_ADDED: [], // 添加物体到场景事件

    OBJECT_REMOVED: [],// 物体从场景移除事件

    OBJECT_PARENT_CHANGED: [], // 物体父结构发生改变

    OBJECT_SELECTED: [],// 选中了物体触发的事件

    SYSTRM_INIT_BEFORE: [],// 系统初始化前事件，早于场景初始化

    SCENE_INIT_START: [],// 场景初始化前事件

    SCENE_INIT_PENDING: [],// 场景初始化中

    SCENE_INIT_END: [],// 场景初始化结束

    OBJECT_EDITED_CHANGE: [], //物体编辑器内发生编辑更新(更新结束)

    OBJECT_EDITED_CHANGING: [], //物体编辑器编辑中状态


}


type EditorEventParams =
    {
        name: "OBJECT_ADDED", //物体添加到编辑器事件
        params: [object: Object3DType]
    } |
    {
        name: "OBJECT_REMOVED", //物体从编辑场景中移除
        params: [object: Object3DType]
    } |
    {
        name: "OBJECT_SELECTED", // 编辑器内物体选中事件
        params: [object: Object3DType | null],
    } |
    {
        name: "OBJECT_PARENT_CHANGED", // 物体父节点发生变化
        params: [object: Object3DType | null],
    } |
    {
        name: "SCENE_TREE_CHANGED", // 物体父节点发生变化
        params: [null],
    } |
    {
        name: "OBJECT_EDITED_CHANGE",
        params: [
            object: Object3DType,
            type: Editor_Commands,
            newValue?: any,
            oldValue?: any,
        ],
    } |
    {
        name: "OBJECT_EDITED_CHANGING",
        params: [
            object: Object3DType,
            type: Editor_Commands,
            newValue?: any,
            oldValue?: any,
        ],
    } |
    {
        name: "SCENE_INIT_START",
        params: [],
    } |
    {
        name: "SCENE_INIT_PENDING",
        params: [value?: number | string],
    } |
    {
        name: "SCENE_INIT_END",
        params: [],
    } |
    EventParams;

type ToEventManagerOnType<Src> = Src extends { name: string, params: any[] } ?
    [name: Src["name"], func: (...params: Src["params"]) => void, options?: Options] : never;

export type EventManagerOnType = ToEventManagerOnType<EditorEventParams>;

type ToEventManagerDispatchType<Src> = Src extends { name: string, params: any[] } ?
    [name: Src["name"], params: Src["params"]] : never;

export type EventManagerDispatchType = ToEventManagerDispatchType<EditorEventParams>;

