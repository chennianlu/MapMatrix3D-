import { ObjectType } from './index';


/**
 * @desc 对场景创建的物体统一管理，存储场景物体的扁平化id映射以及类型分组。方便对场景物体的获取和统计
 * @class Factory
 */
class Factory {

    public _IDMap: Map<string, ObjectType>;
    private _TypeMap: Map<string, Map<string, ObjectType>>;
    private _rootObjs: Map<string, ObjectType>;

    constructor() {

        /**
         * 用于根据ID获取物体  (扁平结构 一级)
         *  @private
         * @type {Map<string, Object>}
         */
        this._IDMap = new Map();


        /**
         * 根据类型管理 (两级树结构)
         *  @private
         * @type {Map<string, Array<Object>>}
         */
        this._TypeMap = new Map();

        /**
         * 存在于场景第一层根节点的对象
         *  @private
         * @type Array[objectType]
         */
        this._rootObjs = new Map();

    }

    /**
     * 向工厂中新增物体
     * @param object
     */
    add(object: ObjectType): void {
        const { id, type } = object;
        this._IDMap.set(String(id), object);
        let typeMap = this._TypeMap.get(type);
        if (!typeMap) {
            typeMap = new Map();
            this._TypeMap.set(type, typeMap);
        }
        typeMap.set(id, object);
    }

    /**
     * 从工厂中移除该物体
     * @param object
     * @param deep 是否深度清理
     */
    remove(object: ObjectType, deep = true): void {
        const _this = this;
        if (deep) {
            const children = object.children;
            for (let i = 0; i < children.length; i++) {
                // @ts-ignore
                const cur: ObjectType = children[i];
                _this._IDMap.delete(cur.id);
                let typeMap = _this._TypeMap.get(cur.type);
                if (typeMap) typeMap.delete(cur.id);
                //递归调用
                _this.remove(cur, deep);
            }

        }
        const { id, type } = object;
        _this._IDMap.delete(id);
        let typeMap = _this._TypeMap.get(type);
        if (typeMap) typeMap.delete(id);
    }

    /**
     * 根节点对象
     * 用于场景缓释加载、场景检索操作
     * @param object 
     */
    addRootObj(object: ObjectType) {
        const { id } = object;
        this._rootObjs.set(id, object);
    }
    /**
     * 根节点对象
     * 用于场景缓释加载、场景检索操作
     * @param object 
     */
    removeRootObj(object: ObjectType) {
        const { id } = object;
        this._rootObjs.get(id) && this._rootObjs.delete(id);
    }
    /**
     * 根据ID查找物体
     * @param id
     * @returns {*|null}
     */
    getObjectByID(id: string): ObjectType | null {
        if (!id) return null;

        const obj = this._IDMap.get(String(id));
        if (!obj) {
            // console.error(`找不到id为${id}的物体`);
        }
        return obj;
    }

    /**
     * 获取类型下所有物体
     * @param type
     * @returns {Map<any, any>}
     */
    getObjectsByType(type: string): Map<string, any> {
        const map = this._TypeMap.get(type);
        return map || new Map();
    }

    /**
     * 清除整个factory数据, 不删除物体，也可以理解成物体到factory的解除绑定
     */
    clear() {
        this._IDMap = new Map();
        this._TypeMap = new Map();
        this._rootObjs = new Map();
    }
}
export const factory = new Factory();