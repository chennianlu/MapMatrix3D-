import { ObjectType } from '../object';
import { Options } from '../../../src/managers/eventManager/core/eventBinding';
import { EventParams } from '../../../src/managers/eventManager/core/defines';


/**
 * 3D系统的通用事件
 */
export const APP_EVENTS: { [name: string]: [list: Array<any>] | [] } = {

    OBJECT_ADDED: [], // 添加物体到场景事件

    OBJECT_REMOVED: [],// 物体从场景移除事件

    OBJECT_SELECTED: [],// 选中了物体触发的事件

    SYSTRM_INIT_BEFORE: [],// 系统初始化前事件，早于场景初始化

    SCENE_INIT_START: [],// 场景初始化前事件

    SCENE_INIT_PENDING: [],// 场景初始化中

    SCENE_INIT_END: [],// 场景初始化结束

    SCENE_LEVEL_CHANGE: [], //场景层级发生变化
}


type EditorEventParams =
    {
        name: "OBJECT_ADDED",
        params: [object: ObjectType]
    } |
    {
        name: "OBJECT_REMOVED",
        params: [object: ObjectType]
    } |
    {
        name: "OBJECT_SELECTED",
        params: [object: ObjectType | null],
    } |
    {
        name: "SYSTRM_INIT_BEFORE",
        params: [],
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
    {
        name: "SCENE_LEVEL_CHANGE",
        params: [cur: ObjectType, pre?: ObjectType],
    } |
    EventParams;

type ToEventManagerOnType<Src> = Src extends { name: string, params: any[] } ?
    [name: Src["name"], func: (...params: Src["params"]) => void, options?: Options] : never;

export type EventManagerOnType = ToEventManagerOnType<EditorEventParams>;

type ToEventManagerDispatchType<Src> = Src extends { name: string, params: any[] } ?
    [name: Src["name"], params: Src["params"]] : never;

export type EventManagerDispatchType = ToEventManagerDispatchType<EditorEventParams>;

