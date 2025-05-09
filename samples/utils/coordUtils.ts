import * as THREE from 'three';

    /**
     * 生成墨卡托坐标
     * @param longitude 经度
     * @param latitude 纬度
     * @returns 墨卡托坐标
     */
    // 墨卡托坐标系：展开地球，赤道作为x轴，向东为x轴正方，本初子午线作为y轴，向北为y轴正方向。
    // 数字20037508.34是地球赤道周长的一半：地球半径6378137米，赤道周长2*PI*r = 2 * 20037508.3427892，墨卡托坐标x轴区间[-20037508.3427892,20037508.3427892]
    export const geoMercatorCoord = (longitude: number, latitude: number): { x: number; y: number } => {
        const E = longitude;
        const N = latitude;
        const x = (E * 20037508.34) / 180;
        let y = Math.log(Math.tan(((90 + N) * Math.PI) / 360)) / (Math.PI / 180);
        y = (y * 20037508.34) / 180;
        return {
            x, // 墨卡托x坐标——对应经度
            y, // 墨卡托y坐标——对应维度
        };
    };

    /**
     * 生成球面坐标
     * @param R 球半径
     * @param longitude 经度
     * @param latitude 纬度
     * @returns 球面坐标
     */
    export const geoSphereCoord = (R: number, longitude: number, latitude: number): { x: number; y: number; z: number } => {
        let lon = (longitude * Math.PI) / 180; // 转弧度值
        const lat = (latitude * Math.PI) / 180; // 转弧度值
        lon = -lon; // three.js坐标系z坐标轴对应经度-90度，而不是90度

        // 经纬度坐标转球面坐标计算公式
        const x = R * Math.cos(lat) * Math.cos(lon);
        const y = R * Math.sin(lat);
        const z = R * Math.cos(lat) * Math.sin(lon);

        // 返回球面坐标
        return {
            x,
            y,
            z,
        };
    };

    /**
     * 计算包围盒
     * @param group Three.js对象组
     * @returns 包围盒信息
     */
    export const getBoundingBox = (group: THREE.Object3D): {
        box3: THREE.Box3;
        center: THREE.Vector3;
        size: THREE.Vector3;
    } => {
        // 包围盒计算模型对象的大小和位置
        const box3 = new THREE.Box3();
        box3.expandByObject(group); // 计算模型包围盒

        const size = new THREE.Vector3();
        box3.getSize(size); // 计算包围盒尺寸

        const center = new THREE.Vector3();
        box3.getCenter(center); // 计算一个层级模型对应包围盒的几何体中心坐标

        return {
            box3,
            center,
            size,
        };
    };

    /**
     * 设置网格的位置及姿态
     * @param mesh 要设置的网格
     * @param R 球半径
     * @param lon 经度
     * @param lat 纬度
     * @returns 设置后的网格
     */
    export const setMeshQuaternion = <T extends THREE.Object3D>(mesh: T, R: number, lon: number, lat: number): T => {
        const { x, y, z } = geoSphereCoord(R, lon, lat);
        mesh.position.set(x, y, z);

        // 姿态设置
        // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
        const meshVector = new THREE.Vector3(x, y, z).normalize();
        // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
        const normal = new THREE.Vector3(0, 0, 1);
        // 四元数属性.quaternion表示mesh的角度状态
        //.setFromUnitVectors();计算两个向量之间构成的四元数值
        mesh.quaternion.setFromUnitVectors(normal, meshVector);

        return mesh;
    };