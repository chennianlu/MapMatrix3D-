
import { BaseObject, BaseInitOptions, Layout } from "./BaseObject";
import { GeometryObject3D } from "@enerv-3d/core";
import CanvasTextureWrap from '../extra/heatMap/canvasTexture'

export interface BatteryPackOptions extends BaseInitOptions {
    packIndex: number, // 当前pack下标  根据下表顺序从下往上排列
    cellInfo: {
        productCode: string,
        size: number[],
        layout: {
            rows: number,
            cols?: number
        },//row col  行列排布也可能是串并关系，不完善
        offset: number, //电芯之间的排列间隔
        count: number  //电芯数量
    }
}


/**
 * @class Pack
 * @description 电池包
 * @description 
 * 进入该层级后：
 *      判断当前是否已经加载过cell ，如果已经创建直接显示，否则：
 *      1、获取当前pack主键，根据主键获取pack内cell数据
 *      2、加载cell模型
 * 退出层级：
 *      隐藏cell
 * 
 */
export class BatteryPack extends BaseObject {
    public override readonly type: string = "BatteryPack";
    static override readonly type: string = "BatteryPack";

    public cellVisibleState: boolean;
    public cellInitStatus: boolean;
    public heatMap: GeometryObject3D;
    public heatMapStatus: boolean;
    public cellInfo: {
        productCode: string,
        size: number[],
        layout: {
            rows: number,
            cols?: number
        },//row col  行列排布也可能是串并关系，不完善
        offset: number, //电芯之间的排列间隔
        count: number  //电芯数量
    };
    public packIndex: number; // 当前pack下标  根据下表顺序从下往上排列

    constructor(options: BatteryPackOptions) {
        super(options);
        this.cellInitStatus = false;
        this.cellVisibleState = false;
        this.cellInfo = options.cellInfo;
        this.packIndex = options.packIndex;
    }

    /**
     * 初始化物体，挂载3D实例节点
     * 继承类尽量不要重写init函数
     * @param params 
     */
    public override async init(params?: BatteryPackOptions): Promise<BatteryPack> {
        await super.init(params);
        //根据packindex设置位置
        this._calculateSize();
        return this;
    }

    private _calculateSize() {
        const { size, layout, count } = this.cellInfo;
        // 电芯之间的间隔
        const offset = Math.min(size[0], size[2]) / 10;
        const width = size[0] + offset;
        const height = size[1];
        const depth = size[2] + offset;
        const { rows, cols } = layout;

        this.setSize(width * cols + offset, 'x');
        this.setSize(depth * rows + offset, 'z');
        this.setSize(height, 'y');
        const index = this.packIndex;
        const parentPos = this.parent.getWorldPosition();
        // 间隔默认高出1/5
        this.setWorldPosition([parentPos[0], parentPos[1] + index * (size[1] * 1.2), parentPos[2]])
        // this.node.translateY(index * (height + 0.04));

    }


    async showCell() {
        if (this.cellInitStatus) {
            this._showCell();
            return;
        }
        const { layout, count, size, productCode } = this.cellInfo;
        const { rows, cols } = layout
        // 电池包规格 后续走标准电池包规格数据
        // 电芯尺寸（X，Z）
        const productSize = [size[0], size[2]];
        const selfAABB = this.getSelfAABB();
        const { width, depth } = selfAABB;
        // 电芯之间的排列间隔
        const offset = Math.min(size[0], size[2]) / 10;
        // 确定左上角位置
        let posX = -width / 2 + productSize[0] / 2 + offset
        let posZ = -depth / 2 + productSize[1] / 2 + offset
        //index <= count
        let index = 0;
        const splitArr = this.productCode.split('/');
        const splitStr = splitArr.splice(0, splitArr.length - 2);
        const packPos = this.getWorldPosition();
        // X
        for (let i = 0; i < rows; i++) {
            posX = -width / 2 + productSize[0] / 2 + offset
            for (let j = 0; j < cols; j++) {
                if (index >= count) break;
                const element: any = {};  // TODO  如果能拿到电芯数据需要在这关联
                element.parent = this;
                element.path = `${splitStr.join('/')}/${productCode}/`;

                const cell = new BaseObject(element);
                await cell.init(element);
                this.add(cell);
                const position = [packPos[0] + posX, packPos[1] + offset, packPos[2] + posZ];
                cell.setWorldPosition(position);

                cell.setSize(size[0], 'x');
                cell.setSize(size[2], 'z');
                cell.setSize(size[1], 'y');

                posX += size[0] + offset;
                index++;
            }
            posZ += size[2] + offset;
        }

        this.cellInitStatus = true;

    }

    _showCell() {
        if (this.cellVisibleState) return;
        this.children.forEach(cell => cell.show(true))
        this.cellVisibleState = true;

    }

    hideCell() {
        this.children.forEach(cell => cell.hide(true));
        this.cellVisibleState = false;
    }

    /**
 * 创建热力图节点
 * @param params 
 * @returns 
 */
    showHeatMap(params: {
        data?: any,
        coord?: 'x' | 'y' | 'z'
    }): void {
        const { data, coord = 'y' } = params
        const aabb = this.getSelfAABB();
        const { width, height, depth, center } = aabb;

        if (this.heatMap) {
            //更新热力图数据
            this.heatMap.show();
        } else {
            // 新建热力图
            this._createHeatMap(params);
        }
        //设置自身透明度
        this.setOpacity(0.4, true);
        this.heatMapStatus = true;
    }

    /**
     * 隐藏热力图
     */
    hideHeatMap() {
        this.heatMap && this.heatMap.hide();
        // this.setOpacity(1, true);
        this.heatMapStatus = false;

    }

    /**
* 创建温度云图
* @param params 
* @returns 
*/
    _createHeatMap(params: {
        data?: any,
        coord?: 'x' | 'y' | 'z'
    }): void {
        const { data, coord = 'y' } = params
        const aabb = this.getSelfAABB();
        const { width, height, depth, center } = aabb;

        if (this.heatMap) return;
        let w, h;
        switch (coord) {
            case 'x':
                w = depth;
                h = height;
                break;
            case 'y':
                w = width;
                h = depth;
                break;
            case 'z':
                w = width;
                h = height;
                break;

            default:
                break;
        }
        //根据物体自身包围盒计算温度云图
        const geoNode = new GeometryObject3D({
            geometryType: 'plane',
            geometryParam: {
                width: w,
                height: h,
            }
        });
        this.heatMap = geoNode;
        const canvasTextureWrap = new CanvasTextureWrap(w, h);
        const texture = canvasTextureWrap.createHeatMap();
        geoNode.setColor(null);
        geoNode.setOpacity(1);
        geoNode.setTexture(texture)
        geoNode.roll(90);
        geoNode.setWorldPosition([center[0], center[1] + height / 2, center[2]])
        geoNode.setRenderTopmost(true);
        this.node.attach(geoNode);
    }

}