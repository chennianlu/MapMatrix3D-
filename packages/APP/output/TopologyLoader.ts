/**
 * @format
 */
import { factory } from '../object/factory';

import { BaseObject } from '../object/BaseObject';
import { LineObjectOptions } from '../object/Line';
import { TopoLine, TopoLineOptions } from '../object/TopoLine';
import { TopoNode, TopoNodeOptions } from '../object/TopoNode';

import { VisualObject } from '../object/VisualObject';

import { LINE_TYPE, VISIUAL_TYPE } from '../../../src/constants';

interface GroundParams {
  visible: boolean;
  radius: number;
  markUrl: string;
  markColor: string;
  groundUrl: string;
  groundColor: string;
}

// TODO 端口创建
interface PortParams { }

interface TopoNodeParams {
  id: string;
  name?: string;
  type?: string;
  assetKey?: string;
  ports: any;
  size: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  angle?: number;
  args?: any;
}

interface TopoEdgeParams {
  id: string;
  name?: string;
  source?: {
    nodeId: string | null;
    portId: string | null;
  };
  target?: {
    nodeId: string | null;
    portId: string | null;
  };
}

interface TopoJson {
  topoId?: string;
  topoName?: string;
  version?: string;
  nodes: TopoNodeParams[];
  edges: TopoEdgeParams[];
}

/**
 * 创建拓扑
 * 已实现：line、TopoNode
 *
 * TODO: container容器类的创建
 * TODO: platform基座类的创建
 */
export class TopologyLoader {
  private root: BaseObject;
  public ground: BaseObject;
  private _ratio: number;
  private _lineRadius: number;

  constructor(root: BaseObject) {
    if (new.target !== TopologyLoader) {
      return;
    }
    if (!TopologyLoader._instance) {
      TopologyLoader._instance = this;

      //这里添加构造函数属性
      this.root = root;
      this.ground = null;
      this._ratio = 50; // 代表2D像素每50像素代表3D单位1m
      this._lineRadius = 0.02; // 默认创建的线半径
    }
    return TopologyLoader._instance;
  }

  static _instance: TopologyLoader;

  /**
   * 初始化场景
   * @param sceneData
   */
  async initTopology(data: { assetUrl: string; json: TopoJson; lineParams: LineObjectOptions }) {
    const _this = this;

    const { json, assetUrl, lineParams } = data;
    const { nodes, edges } = json;
    this._lineRadius = lineParams.radius;
    // 第一步解析拓扑节点
    const nodeList = nodes;
    // 第二步解析连线
    const edgeList = edges;

    // 创建父节点
    const topoRoot = new BaseObject({
      name: 'topology_root',
    });
    await topoRoot.init({
      parent: this.root,
    });

    const loaderEdges = async (d) => {
      return new Promise(function (resolve, reject) {
        const loadPromises = [];

        for (let i = 0; i < d.length; i++) {
          let element = d[i];
          let { id, name, source, target, pathPoints, attrs } = element;
          let points;
          if (Array.isArray(pathPoints) && pathPoints.length > 0) {
            points = _this.getPathPoints(pathPoints);
          } else {
            // 根据source和target计算线路点位  现在暂时没用了  走不进来
            points = _this.getLogicalPoints(source, target);
          }
          if (!points) continue;
          const initParam = {
            ...lineParams,
            id,
            name,
            points,
            lineType: LINE_TYPE.UV_TUBE,
            repeat: 1,
            parent: topoRoot,
            animation: {
              speed: 0.1,
              direction: 'Minus',
            },
            attrs,
          };

          const promiseLoader = _this.createLine(initParam, {
            source,
            target,
          });
          loadPromises.push(promiseLoader);
        }

        //保证当前层级创建结束后逐级加载
        Promise.allSettled(loadPromises)
          .then((results) => { })
          .catch((error) => {
            // console.log(error);
          })
          .finally(() => {
            resolve(true);
          });
      });
    };
    const nodeLoader = async (d: TopoNodeParams[]) => {
      return new Promise((resolve, reject) => {
        const loadPromises = [];
        for (let i = 0; i < d.length; i++) {
          let element = d[i];
          let { id, name, assetKey, type, ports, size, position, args, angle } = element;
          // TODO size 以及端口处理
          const initParam = {
            id,
            name,
            ratio: this._ratio,
            parent: topoRoot,
            path: assetUrl + assetKey + '/',
            url: 'index.gltf',
            data: { ...args },
          };

          const promiseLoader = this.createNode(initParam, { position, size, angle });
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
            // 加载线
            resolve(true);
          });
      });
    };
    await nodeLoader(nodeList as unknown as TopoNodeParams[]);
    await loaderEdges(edgeList as unknown as TopoEdgeParams[]);
    const aabb = topoRoot.getWorldAABB();
    const layout = [-aabb.center[0], 0, -aabb.center[2]];
    topoRoot.setWorldPosition(layout);
    // selectionTool.setSceneLevel(topoRoot.node, true);
    return topoRoot;
  }

  /**
   * 创建底座
   * @date 2024/1/25 - 13:54:41
   *
   * @async
   * @param {GroundParams} params
   * @returns {unknown}
   */
  async createGround(params: GroundParams) {
    const obj = new VisualObject({
      type: VISIUAL_TYPE.GROUND,
      ...params,
      parent: this.root,
    });
    await obj.init({
      type: VISIUAL_TYPE.GROUND,
      ...params,
      parent: this.root,
    });
    if (this.ground) this.root.remove(this.ground);
    this.ground = obj;
    return obj;
  }

  /**
   * 创建拓扑节点
   * @param params
   * @returns BaseObject
   */
  async createNode(
    params: TopoNodeOptions,
    transformOptions?: {
      position: {
        x: number;
        y: number;
      };
      size: {
        width: number;
        height: number;
      };
      angle?: number;
    },
  ) {
    const node = new TopoNode(params);
    await node.init(params, transformOptions);
    return node;
  }

  /**
   * 创建拓扑连接线
   * @param params
   * @returns LineObject
   */
  async createLine(
    params: TopoLineOptions,
    relation: {
      source?: {
        nodeId: string;
        portId: string;
      };
      target?: {
        nodeId: string;
        portId: string;
      };
    },
  ) {
    const newTube = new TopoLine(params);
    await newTube.init(params);
    // 默认开启泛光
    newTube.node.setBloomEffect(true);
    // 设置连线关系
    const { source, target } = relation;
    //绑定关系线路  这里最好是创建拓扑节点类  方法类进行挂载
    if (source) {
      const sourceObject = factory.getObjectByID(source.nodeId);
      sourceObject && (sourceObject as TopoNode).relationLine.push(newTube);
      newTube.sourceNode = sourceObject as TopoNode;
    }
    if (target) {
      const targetObject = factory.getObjectByID(target.nodeId);
      targetObject && (targetObject as TopoNode).relationLine.push(newTube);
      newTube.targetNode = targetObject as TopoNode;
    }

    return newTube;
  }

  /**
   * 将二维坐标转换为三维坐标
   * @param position
   */
  transformPosition(
    object: BaseObject,
    position: {
      x: number;
      y: number;
    },
    size: {
      width: number;
      height: number;
    },
    angle?: number,
  ) {
    if (angle) {
      object.setAngle([0, angle, 0]);
    }
    const aabb = object.getWorldAABB();
    const { width, height, depth, center } = aabb;

    // 按照宽度一米为单位制缩放  scaleRatio目标值
    const scaleRatio = size.width / this._ratio / width;

    object.setScale([scaleRatio, scaleRatio, scaleRatio]);
    const layout = [
      (position.x + size.width / 2) / this._ratio - center[0] * scaleRatio,
      height / 2 - center[1] + this._lineRadius * 2,
      (position.y + size.height / 2) / this._ratio - center[2] * scaleRatio,
    ];

    object.setPosition(layout);
  }

  /**
   * 自动生成路径点
   * @date 2024/1/25 - 13:53:36
   *
   * @param {{
   *         nodeId: string,
   *         portId: string
   *     }} source
   * @param {{
   *         nodeId: string,
   *         portId: string
   *     }} target
   * @returns {(null | any[])}
   */
  getLogicalPoints(
    source: {
      nodeId: string;
      portId: string;
    },
    target: {
      nodeId: string;  
      portId: string;
    },
  ): null | any[] {
    const sourceObject = factory.getObjectByID(source.nodeId);
    const targetObject = factory.getObjectByID(target.nodeId);
    if (!sourceObject || !targetObject) {
      console.error(
        `object not found: ${!sourceObject && source.nodeId}、${!targetObject && target.nodeId}`,
      );
      return null;
    }
    const aabb1 = sourceObject.getWorldAABB();
    const aabb2 = targetObject.getWorldAABB();

    // 获取两个物体的中心点
    const position1 = sourceObject.getWorldPosition();
    const position2 = targetObject.getWorldPosition();
    const center = [
      (position1[0] + position2[0]) / 2,
      (position1[1] - aabb1.height / 2 + (position2[1] - aabb2.height / 2)) / 2,
      (position1[2] + position2[2]) / 2,
    ];
    // 0.001临时为了避免两个点位完全重合 这里最好是写个去重
    const points = [
      [position1[0], position1[1] - aabb1.height / 2 + 0.001, position1[2]],
      [position1[0], position1[1] - aabb1.height / 2, center[2]],
      [...center],
      [position2[0], position2[1] - aabb2.height / 2, center[2]],
      [position2[0], position2[1] - aabb2.height / 2 + 0.001, position2[2]],
    ];
    return points;
  }

  /**
   * 转换实际线路坐标点位
   * @date 2024/2/5 - 14:22:07
   *
   * @param {{x: number, y: number}[]} point
   * @returns {{}}
   */
  getPathPoints(point: { x: number; y: number }[]) {
    const result = [];
    // 添加random为了将相同高度的先错开避免z-fighting
    let randomNum = Math.random() * 0.01;
    for (let i = 0; i < point.length; i++) {
      const position = point[i];
      result.push([
        position.x / this._ratio,
        this._lineRadius * 2 + randomNum,
        position.y / this._ratio,
      ]);
    }
    return result;
  }
}
