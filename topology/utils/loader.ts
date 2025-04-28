import { SystemAPP, selectionTool, coreEvent } from '../../packages/APP';
import { TopoJSONObject, ResolvedTopoData } from '../types';

// 拓扑节点类型
interface TopoNode {
    id: string;
    name: string;
    shape: string;
    version?: string;
    [key: string]: any;
}

// 拓扑边类型
interface TopoEdge {
    source: string;
    target: string;
    [key: string]: any;
}

// 拓扑数据输入类型
interface TopoInputData {
    nodes: TopoNode[];
    edges: TopoEdge[];
}

// 解析后的拓扑数据类型
interface ResolvedTopoResult {
    topoId: string;
    topoName: string;
    version: string;
    nodes: TopoNode[];
    edges: TopoEdge[];
}
export const resourceMappiing = {
    "PHOTOVOLTAIC": {
        "label": "光伏",
        "value": "PHOTOVOLTAIC",
        "product3D": "Photovolatic"
    }
}
export const modelMapping_3D = {
    "ChgU": {
        product3D: 'data/topo/ElectricalBox'
    },
    "PVU": {
        product3D: 'data/topo/PV'
    },
    "ESS": {
        product3D: 'data/topo/ES'
    }
}

export const initCore = async (APP: SystemAPP, json: any) => {
    // 初始化核心功能
    APP.core.loader.publicResourcePath ='/data/topo/'
    // const modelAssets = '/data/topo';
    const topoJson = resolveTopoData(json);
    const res = await APP.topologyLoader.initTopology({
        assetUrl: '/',
        json: topoJson,
        lineParams: {
            points:[],
            color: '#00bFFF',
            radius: 0.05,
            opacity: 0.2,
            url:'line6.png'
        }
    });

   

};

export const resolveTopoData = (json: TopoInputData) => {
    const result: any = {
        topoId: '',
        topoName: '',
        version: '',
        nodes: [],
        edges: []
    };

    const { nodes, edges } = json;

    // 处理节点数据
    for (let i = 0; i < nodes.length; i++) {
        const curNodeData = nodes[i];
        if (curNodeData.shape === 'enerv-topo-node-info-panel') continue;
        const dataAttr = curNodeData.data?.dataAttr || {};
        const attrs = curNodeData.attrs || {};
        const relationDevice = curNodeData.data?.deviceList || [];
        const productKey = relationDevice[0]?.modelLabel || '';
        const sourceModelId = relationDevice[0]?.sourceModelId || '';
        const product3DBySourceModelId = modelMapping_3D[sourceModelId as keyof typeof modelMapping_3D]?.product3D;

        result.nodes.push({
            id: curNodeData.id,
            size: curNodeData.size,
            position: curNodeData.position,
            angle: curNodeData.angle || -90,
            ports: {},
            name: attrs?.test?.text || '',
            assetKey: product3DBySourceModelId || 'data/topo/Default',
            args: {
                ...dataAttr,
                modellable: productKey
            }
        })
    }
    const isMockBus = (i) => {
        return edges[i] && edges[i].id === 'mockBus';
    }

    for (let i = 0; i < edges.length; i++) {
        const curEdgeData = edges[i];
        if (curEdgeData.attrs.line?.stroke === '#000000') {
            delete curEdgeData.attrs.line.stroke;
        }
        result.edges.push({
            id: curEdgeData.id,
            source: {
                nodeId: curEdgeData.source.cell,
                portId: curEdgeData.source.port
            },
            target: {
                nodeId: curEdgeData.target.cell,
                portId: curEdgeData.target.port
            },
            pathPoints: curEdgeData.pathPoints,
            attrs: {
                line: {
                    ...curEdgeData.attrs.line,
                    strokeWidth: isMockBus(i) ? 1.2 : 0.5,
                    stroke: isMockBus(i) ? '#9E9E9E' : '#00bFFF',
                    direction: isMockBus(i) ? 0 : 1
                }
            }
        })

    }

    return result;
};

