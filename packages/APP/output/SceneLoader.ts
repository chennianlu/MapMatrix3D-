/**
 * @format
 */
import { event } from '../event';

import {
  BaseObject,
  BuildingObject,
  Cabinet,
  Geometry,
  LineObject,
  ObjectManagerOnType,
  ObjectType,
  BatteryPack,
  BatteryCluster,
  ParticleObject,
  TopoLine,
  VisualObject,
  WaterPlane,
  Widget,
} from '../object';
import { selectionTool } from '@enerv-3d/core';

interface ObjectData {
  name?: string;
  class_id: string;
  position?: number[];
  rotation?: number[];
  scale?: number[];
  bloom?: boolean;
  productCode?: string;
  opacity?: number;
  color?: string | null;
  userData?: any;
  children?: ObjectData[];
  gradualLoad?: boolean; // 是否启用逐级加载 开启逐级加载后加载时机由父节点决定
  pickedEnable?: boolean;
  lineData?: any;
  parent?: any;
}

interface SceneData {
  json: ObjectData[];
  assetUrl: string;
}

const ObjectLib = {
  Base: BaseObject,
  Group: BaseObject,
  Geometry: Geometry,
  Widget: Widget, //不需要
  Cabinet: Cabinet,
  BatteryCluster: BatteryCluster,
  BatteryPack: BatteryPack,
  Building: BuildingObject,
  Line: LineObject,
  TopoLine: TopoLine,
  Particle: ParticleObject, // 不需要
  VisualObject: VisualObject, // 不需要
  WaterPlane: WaterPlane,
};

/**
 * 场景加载器：
 * 根据场景树对象初始化场景：
 * 1、确认根节点物体，一般指的是园区
 * 2、确认层级关系
 * 3、提供层级切换飞入飞出动画
 * 4、提供场景初始化后回调事件
 * 5、提供层级切换事件
 */
export class SceneLoader {
  private _scene: EnerV3D.Scene;
  sceneRoot: BaseObject;
  constructor(core: any) {
    if (new.target !== SceneLoader) {
      return;
    }
    if (!SceneLoader._instance) {
      SceneLoader._instance = this;
      //这里添加构造函数属性
      this._scene = core.scene;
      this.sceneRoot = new BaseObject();
      this.sceneRoot
        .init({
          name: 'SceneRoot',
        })
        .then((res) => {
          this._scene.add(res.node);
        });
    }
    return SceneLoader._instance;
  }

  static _instance: SceneLoader;

  /**
   * 创建物体 type: ObjType, options: ObjectInitParam
   */
  async _create(...[type, params]: ObjectManagerOnType): Promise<any> {
    const createType = type;
    //默认指定父节点为根节点
    if (!params.parent) params.parent = this.sceneRoot;
    const generate = ObjectLib[createType];
    const obj: ObjectType = new generate(params as never);
    await obj.init();
    const { opacity, color } = params;
    if (color && typeof color === 'string') obj.setColor(color);
    if (opacity && typeof opacity === 'number') obj.setOpacity(opacity);
    return obj;
  }

  /**
   * 初始化场景
   * @param data 
   */
  async initScene(data: SceneData) {
    const { json, assetUrl } = data;
    //场景开始加载，进行事件通知
    event.dispatch('SCENE_INIT_START', []);
    console.time('SCENE_INIT_TIME');
    const _this = this;
    const objectLength = this._getSceneMember(json);
    let loadingProcess = 0;
    // 逐级加载的前提是需要等待当前父节点全部创建结束后挂载子节点
    return new Promise((res, rej) => {
      const loader = async (d) => {
        const loadPromises = [];
        const childrenList = [];

        for (let i = 0; i < d.length; i++) {
          let element = d[i];
          let { class_id, children, productCode, gradualLoad } = element;
          // 处理模型路径
          if (productCode) element.path = assetUrl + productCode + '/';

          //单独处理线   TODO
          if (class_id === 'Line') {
            element = Object.assign(element, element.lineData);
            children = element.children = [];
          }
          const promiseLoader = this._create(class_id, {
            ...element,
          })
            .then((object: ObjectType) => {
              // 如果还有子节点 统一收集放到下一轮
              if (Array.isArray(children)) {
                children.forEach((cur) => (cur.parent = object));
              }
              // 获取当前加载loading process
              loadingProcess++;
              event.dispatch('SCENE_INIT_PENDING', [loadingProcess / objectLength]);
              // 如果还有子节点 统一收集放到下一轮
              // 需要判断是否是渐进渲染对象
              if (gradualLoad) {
                object.childrenData = children;
              } else {
                if (Array.isArray(children)) {
                  childrenList.push(...children);
                }
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
            rej(error);
          })
          .finally(() => {
            // 判断当前层级还有children节点没有，没有就认为加载结束了
            if (childrenList.length === 0) {
              event.dispatch('SCENE_INIT_END', []);
              console.timeEnd('SCENE_INIT_TIME');
              selectionTool.setSceneLevel(_this.sceneRoot.node, true);
              res(_this.sceneRoot);
            } else {
              //继续加载
              loader(childrenList);
            }
          });
      };
      loader(json);
    })

  }

  /**
   * 获取当前场景数据总物体数量
   * @param json
   * @returns
   */
  _getSceneMember(json: ObjectData[]) {
    let memberLength = 0;
    const loop = (data: ObjectData[]) => {
      for (let i = 0; i < data.length; i++) {
        memberLength++;
        const { children } = data[i];
        if (children.length > 0) {
          loop(children);
        }
      }
    };
    loop(json);
    return memberLength;
  }

  clear() {
    const childs = this.sceneRoot.children;
    for (let i = 0; i < childs.length; i++) {
      const element = childs[i];
      element.destroy();
      i--;
    }
  }
}
