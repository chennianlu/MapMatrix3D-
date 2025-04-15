import { BaseObject, BaseInitOptions } from "./BaseObject";
import { LineObject } from './Line'

export interface TopoNodeOptions extends BaseInitOptions {
    ratio: number
}

export class TopoNode extends BaseObject {
    public override readonly type: string = "TopoNode";
    static override readonly type: string = "TopoNode";

    private _ratio: number;
    public relationLine: LineObject[]

    constructor(options: TopoNodeOptions) {
        super(options);
        this.relationLine = [];
        this._ratio = options.ratio || 50 // 代表2D像素每50像素代表3D单位1m
    }

    /**
      * 初始化物体，挂载3D实例节点
      * 继承类尽量不要重写init函数
      * @param params 
      */
    public override async init(params?: TopoNodeOptions, transformOptions?: {
        position: {
            x: number,
            y: number
        }, size: {
            width: number,
            height: number
        },
        angle?: number
    }): Promise<TopoNode> {
        await super.init(params)
        this.transformPosition(transformOptions)

        return this;
    }


    /**
     * 将二维坐标转换为三维坐标
     * @param position 
     */
    transformPosition(transformOptions?: {
        position: {
            x: number,
            y: number
        }, size: {
            width: number,
            height: number
        },
        angle?: number
    }
    ) {
        const { position, size, angle } = transformOptions
        if (angle) {
            this.setAngle([0, angle, 0]);
        }
        const aabb = this.getWorldAABB();
        const { width, height, depth, center } = aabb;

        // 按照宽度一米为单位制缩放  scaleRatio目标值
        const scaleRatio = (size.width / this._ratio) / width;

        this.setScale([scaleRatio, scaleRatio, scaleRatio])
        const layout = [
            (position.x + (size.width / 2)) / this._ratio - center[0] * scaleRatio,
            height / 2 - center[1],
            (position.y + (size.height / 2)) / this._ratio - center[2] * scaleRatio,
        ]

        this.setPosition(layout);
    }


}
