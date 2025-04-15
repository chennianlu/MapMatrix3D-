import { event } from '../event'
import { EnerV3D_CONST } from '../constants';

(function () {
    // 注册机柜默认事件
    let cabinetCollect = [];




    event.on('SCENE_LEVEL_CHANGE', (cur, pre) => {
        console.log('当前级别', cur)
        console.log('上一级别', pre)

        if (pre?.type === EnerV3D_CONST.CLASS_ID.Cabinet) {
            // 从机柜返回到根节点
            if (cur === pre.parent) {
                cabinetCollect.forEach(cur => cur.hideCluster());
                cabinetCollect = [];
            }
        }


        if (cur?.type === EnerV3D_CONST.CLASS_ID.Cabinet) {
            // 下钻到机柜
            if (cur.parent === pre) {
                cabinetCollect.push(cur)
                cur.loadCluster();
            }

        }

        if (cur?.type === EnerV3D_CONST.CLASS_ID.BatteryPack) {
            // 电池蔟  下钻到pack
            if (pre?.type === EnerV3D_CONST.CLASS_ID.BatteryCluster) {
                cur.showCell();
                // cur.showHeatMap({})
            }
        }
        if (pre?.type === EnerV3D_CONST.CLASS_ID.BatteryPack) {
            // 从pack返回电池蔟
            if (cur?.type === EnerV3D_CONST.CLASS_ID.BatteryCluster) {
                pre.hideCell();
                // cur.showHeatMap({})
            }
        }
    }, {
        des: '机柜层级切换事件'
    })

})();