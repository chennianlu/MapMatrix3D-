/**
 * @format
 */
import { TubeNormal } from '@enerv-3d/core';
import { LineObject, LineObjectOptions } from './Line';
import { TopoNode } from './TopoNode';

enum LineDirection {
  POSITIVE = 1,
  NEGATIVE = -1,
  ALL = 2,
  NONE = 0,
}

export interface TopoLineOptions extends LineObjectOptions {
  attrs?: {
    line?: {
      direction?: LineDirection;
      strokeDasharray?: number[];
      stroke?: string;
      strokeWidth?: number;
    };
  };
}

export class TopoLine extends LineObject {
  public override readonly type: string = 'TopoLine';
  static override readonly type: string = "TopoLine";

  public sourceNode: TopoNode | null;
  public targetNode: TopoNode | null;

  private topoLineOptions: TopoLineOptions;

  constructor(options: TopoLineOptions) {
    super(options);
    this.topoLineOptions = options;
  }

  /**
   * 处理拓扑图数据，适配：正向/反向/无、实线/虚线、颜色、粗细
   */
  public override async init(params?: TopoLineOptions): Promise<LineObject> {
    const initConfig = Object.assign(this.topoLineOptions, params);
    const { direction, strokeDasharray, stroke, strokeWidth } = initConfig?.attrs?.line || {};
    // 1. 更新线的方向
    updateDirection(initConfig, direction);

    // 2. 更新实线/虚线
    updateLineType(initConfig, strokeDasharray ? 'dash' : 'solid');

    // 3. 更新颜色
    if (stroke) {
      initConfig.color = stroke;
    }

    // 4. 更新线条粗细
    if (strokeWidth) {
      initConfig.radius = initConfig.radius * strokeWidth;
    }

    return super.init(initConfig);
  }
}

function updateDirection(params: TopoLineOptions | null, direction: LineDirection) {
  // 正向、反向通过设置 points 数据中节点的顺序； 无：去除 url 属性
  if (params) {
    switch (direction) {
      case LineDirection.NEGATIVE:
        params.points?.reverse();
        break;
      case LineDirection.NONE:
        delete params.animation;
        break;
      default:
        break;
    }
  }
}

function updateLineType(params: TopoLineOptions | null, lineType: 'dash' | 'solid') {
  // 替换线条的纹理贴图为特制的虚线纹理
  // 后期可以考虑根据 strokeDasharray 生成对应的纹理
  if (lineType === 'dash') {
    params.url = '/images/line/line2-1.png';
    const length = TubeNormal.calcutePointLength(params.points);
    params.repeat = length * 2;
  }
}
