import { BaseObject3D, GeometryObject3D, TubeNormal, Group3D } from "@enerv-3d/core";
import { Object3DType } from '../../../../src/types'

import { event } from '../../event'

interface SceneTreeNode {
    id?: number,
    name?: string,
    type?: string,
    locked?: boolean,
    children?: SceneTreeNode[]
}

interface SceneJSON {
    userData?: any,
    name: string,
    class_id: string,
    pickedEnable?: boolean,
    bloom?: boolean,
    productCode?: string,
    opacity?: number,
    color?: string,
    position: number[],
    scale: number[],
    rotation: number[],
    children: SceneJSON[],
    lineData?: any,
    parent?: Object3DType

}

/**
 * 编辑器场景对象的管理
 */
export class SceneManager {
    // 场景中所有的物体都会被添加到sceneRoot下面
    sceneRoot: BaseObject3D;
    public scene: THREE.Scene
    public helperScene: THREE.Scene
    public stage: THREE.Object3D
    public helperBox: GeometryObject3D;



    constructor(options: {
        scene: THREE.Scene,
        helperScene: THREE.Scene,
    }) {
        if (new.target !== SceneManager) {
            return;
        }
        if (!SceneManager._instance) {
            SceneManager._instance = this;
            //这里添加构造函数属性
            const { scene, helperScene } = options;
            this.scene = scene;
            this.helperScene = helperScene;
            // 创建编辑器物体根节点
            this.sceneRoot = new BaseObject3D({
                name: 'SceneRoot'
            });
            this.scene.add(this.sceneRoot);
            // 初始化辅助工具
            this._createBox();
            this._registEvent();

        }
        return SceneManager._instance;
    }

    static _instance: SceneManager;


    /**
     * 创建辅助盒子
     */
    _createBox() {
        const box = new GeometryObject3D({
            geometryType: "box",
        });
        box.name = 'helper-box'
        box.setOpacity(0.2);
        box.showBorder({ color: '#ffffff' })
        // 默认设置辅助盒子无穷远
        this.helperScene.add(box);

        this.helperBox = box;
        this.helperBox.hide();
    }

    /**
     * 获取当前场景树状结构
     * @returns 
     */
    getSceneTree(): SceneTreeNode[] {
        let treeData = [];
        const rootData = {
            id: this.sceneRoot.id,
            name: this.sceneRoot.name,
            type: this.sceneRoot.type,
            locked: false,
            children: []
        }
        // 添加场景根节点
        treeData.push(rootData);

        const loop = (list: any[], data: any) => {
            const dataChildren = data.children;
            for (let i = 0; i < list.length; i++) {
                const cur = list[i];
                if (!cur.appKey) continue;
                const curData = {
                    id: cur.id,
                    name: cur.name,
                    type: cur.type,
                    locked: cur.lockedStatus,
                    children: []
                }

                dataChildren.push(curData);
                if (!(cur instanceof TubeNormal)) {
                    loop(cur.children, curData)
                }

            }
        }
        loop(this.sceneRoot.children, rootData)

        console.log(treeData);
        return treeData
    }

    /**
     * 获取当前场景json
     * @params isEport 是否以文件形式导出
     * @returns 
     */
    getSceneJSON(isEport: boolean): SceneJSON[] {
        let sceneJSON = [];

        const getObjInfo = (object) => {
            const resObject = {
                name: object.name,
                class_id: object.type,
                position: object._getWorldPosition(),
                scale: object.scale.toArray(),
                rotation: object.getRotation(),
                bloom: object.bloomStatus,
                productCode: object.userData.productCode,
                opacity: object.overrideOpacity,
                color: object.overrideColor,
                userData: object.userData,
                children: [],

            }
            return resObject;
        }


        const rootData = getObjInfo(this.sceneRoot);
        // 添加场景根节点
        sceneJSON.push(rootData);

        const loop = (list: any[], data: any) => {
            const dataChildren = data.children;
            for (let i = 0; i < list.length; i++) {
                const cur = list[i];
                if (!cur.appKey) continue;
                const curData: SceneJSON = getObjInfo(cur);
                if (cur instanceof TubeNormal) {
                    curData.lineData = cur.lineOptions;
                    // 管线的子节点没有意义 制空
                    curData.children = [];
                }
                dataChildren.push(curData);
                loop(cur.children, curData)
            }
        }
        loop(this.sceneRoot.children, rootData)

        console.log(sceneJSON);

        if (isEport) {
            let ele = document.createElement('a');
            ele.download = 'scene.json';
            ele.style.display = 'none';
            let blob = new Blob([JSON.stringify(sceneJSON, undefined, 4)], {
                type: 'text/json'
            })
            ele.href = URL.createObjectURL(blob);
            document.body.appendChild(ele);
            ele.click();
            document.body.removeChild(ele)
        }
        return sceneJSON
    }

    /**
     * 加载场景数据
     * @param data 
     */
    loadScene(data: {
        json: SceneJSON[],
        assetUrl: string,
    }) {
        const { json, assetUrl } = data;
        event.dispatch('SCENE_INIT_START', []);
        const objectLength = this._getSceneMember(json);
        let loadingProcess = 0;
        // 逐级加载的前提是需要等待当前父节点全部创建结束后挂载子节点
        const loader = async (d, parent?: Object3DType) => {
            const loadPromises = [];
            const childrenList = [];

            for (let i = 0; i < d.length; i++) {
                const options = d[i];
                if (parent) options.parent = parent;
                const { children } = options;
                const promiseLoader = this._create({
                    assetUrl,
                    options
                })
                    .then((object: Object3DType) => {
                        console.log(object);
                        // 如果还有子节点 统一收集放到下一轮
                        if (Array.isArray(children) && children.length > 0) {
                            children.forEach((cur) => (cur.parent = object));
                        }
                    })
                    .finally(() => {
                        // 获取当前加载loading process
                        loadingProcess++;
                        event.dispatch('SCENE_INIT_PENDING', [loadingProcess / objectLength]);

                        // 如果还有子节点 统一收集放到下一轮
                        if (Array.isArray(children) && children.length > 0) {
                            childrenList.push(...children);
                        }
                    });

                loadPromises.push(promiseLoader);
            }

            //保证当前层级创建结束后逐级加载
            Promise.allSettled(loadPromises)
                .then((results) => {
                    // results.forEach((result) => console.log(result.status));
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    // 判断当前层级还有children节点没有，没有就认为加载结束了
                    if (childrenList.length === 0) {
                        //场景加载结束行为
                        event.dispatch('SCENE_INIT_END', []);
                    } else {
                        //继续加载
                        loader(childrenList);
                    }
                });
        };
        loader(json, this.sceneRoot);

    }

    /**
     * 创建物体 type: ObjType, options: ObjectInitParam
     */
    async _create(params: {
        assetUrl: string,
        options: SceneJSON
    }): Promise<any> {
        const { assetUrl, options } = params;
        const {
            class_id,
            name,
            bloom,
            productCode,
            opacity,
            color,
            position,
            scale,
            rotation,
            lineData,
            parent,
            userData
        } = options
        const path = assetUrl + productCode + '/';
        let model;

        if (class_id === 'Base') {
            model = new BaseObject3D({
                name: name
            });
            await model.init({
                path: path,
                url: 'index.gltf',
            })
            model.setBloomEffect(bloom);
            if (color && typeof color === 'string') model.setColor(color);
            if (opacity && typeof opacity === 'number') model.setOpacity(opacity);
            model.setPosition(position);
            model.setScale(scale);
            model.setRotation(rotation, 'degrees');

        } else if (class_id === 'Group') {
            model = new Group3D({
                name: name
            });
            await model.init({});
        } else if (class_id === 'Line') {
            const params = {
                name,
                lineType: lineData.lineType,
                points: lineData.points || [],
                radius: lineData.radius,
                url: lineData.url,
                color: lineData.color,
                opacity: lineData.opacity,
                repeat: lineData.repeat,
                animation: lineData.animation
            }
            model = new TubeNormal(params);
            await model.init(params);
            model.setBloomEffect(bloom);
            model.setOpacity(opacity);
            model.setPosition(position);
            model.setScale(scale);
            model.setRotation(rotation, 'degrees');
            if (lineData.animation?.state) model.play(lineData.animation);

        }
        model.userData = userData;
        parent.attach(model);
        event.dispatch('OBJECT_ADDED', [model]);

        return model;

    }

    /**
     * 根据id查找子物体
     * TODO  大量场景节点下的查询速度优化
     * @param id 
     * @returns 
     */
    getObjectByID(id: number): BaseObject3D | null {
        const object = this.sceneRoot.getObjectById(id)
        return object as BaseObject3D;
    }


    /**
     * 注册摄影机相关事件
     */
    _registEvent() {

    }
    /**
     * 获取当前场景数据总物体数量
     * @param json 
     * @returns 
     */
    _getSceneMember(json: SceneJSON[]) {
        let memberLength = 0;
        const loop = (data: SceneJSON[]) => {
            for (let i = 0; i < data.length; i++) {
                memberLength++;
                const { children } = data[i];
                if (children.length > 0) {
                    loop(children)
                }
            }
        }
        loop(json);
        return memberLength;

    }

}