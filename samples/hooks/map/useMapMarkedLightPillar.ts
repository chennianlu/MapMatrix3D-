import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import useCoord from '../useCoord';
import { deepMerge, random } from '../../utils/index';

/**
 * 光柱配置选项接口
 */
interface MarkedLightPillarOptions {
    pointTextureUrl: string;
    lightHaloTextureUrl: string;
    lightPillarUrl: string;
    scaleFactor: number;
    pillarColor: number;  // 光柱颜色
    haloColor: number;    // 光圈颜色
}

/**
 * 动画参数接口
 */
interface TweenParams {
    scale: number;
    opacity: number;
}

/**
 * 带有动画属性的网格接口
 */
interface MeshWithTween extends THREE.Mesh {
    tween1?: any; // 使用any避免TWEEN类型问题
    tween2?: any; // 使用any避免TWEEN类型问题
    material: THREE.MeshBasicMaterial;
}

/**
 * 光柱标记生成Hook
 * @param options 配置选项
 * @returns 光柱相关方法
 */
export default function useMarkedLightPillar(options?: MarkedLightPillarOptions) {
    const { geoSphereCoord } = useCoord();
    // 默认参数
    let defaultOptions: MarkedLightPillarOptions = {
        pointTextureUrl: './assets/texture/标注.png',
        lightHaloTextureUrl: './assets/texture/标注光圈.png',
        lightPillarUrl: './assets/texture/光柱.png',
        scaleFactor: 1, // 缩放系数
        pillarColor: 0x00aaff, // 光柱颜色
        haloColor: 0x00ffff,   // 光圈颜色
    };
    defaultOptions = deepMerge(defaultOptions, options || {});
    // 纹理加载器
    const textureLoader = new THREE.TextureLoader();

    /**
     * 创建标记点
     * @returns 标记点网格
     */
    const createPointMesh = (): THREE.Mesh => {
        // 标记点：几何体，材质
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(defaultOptions.pointTextureUrl),
            color: defaultOptions.haloColor || 0x00ffff,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false, //禁止写入深度缓冲区数据
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 97;
        mesh.name = 'createPointMesh';
        // 缩放
        const scale = 0.15 * defaultOptions.scaleFactor;
        mesh.scale.set(scale, scale, scale);
        return mesh;
    };

    /**
     * 创建光圈
     * @returns 光圈网格
     */
    const createLightHalo = (): THREE.Mesh => {
        // 标记点：几何体，材质
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(defaultOptions.lightHaloTextureUrl),
            color: defaultOptions.haloColor || 0x00ffff,
            side: THREE.DoubleSide,
            opacity: 0,
            transparent: true,
            depthWrite: false, //禁止写入深度缓冲区数据
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 98;
        mesh.name = 'createLightHalo';
        // 缩放
        const scale = 0.3 * defaultOptions.scaleFactor;
        mesh.scale.set(scale, scale, scale);
        return mesh;
    };

    /**
     * 创建光柱
     * @param lon 经度
     * @param lat 纬度
     * @param heightScaleFactor 光柱高度的缩放系数
     * @returns 光柱组
     */
    const createLightPillar = (lon: number, lat: number, heightScaleFactor: number = 1): THREE.Group => {
        let group = new THREE.Group();
        // 柱体高度
        const height = heightScaleFactor;
        // 柱体的geo,6.19=柱体图片高度/宽度的倍数
        const geometry = new THREE.PlaneGeometry(height / 6.219, height);
        // 柱体旋转90度，垂直于Y轴
        geometry.rotateX(Math.PI / 2);
        // 柱体的z轴移动高度一半对齐中心点
        geometry.translate(0, 0, height / 2);
        // 柱子材质
        const material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(defaultOptions.lightPillarUrl),
            color: defaultOptions.pillarColor || 0x00ffff,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        // 光柱01
        let light01 = new THREE.Mesh(geometry, material);
        light01.renderOrder = 99;
        light01.name = 'createLightPillar01';
        // 光柱02：复制光柱01
        let light02 = light01.clone();
        light02.name = 'createLightPillar02';
        // 光柱02，旋转90°，跟 光柱01交叉
        light02.rotateZ(Math.PI / 2);
        // 创建底部标点
        const bottomMesh = createPointMesh();
        // 创建光圈
        const lightHalo = createLightHalo();
        // 将光柱和标点添加到组里
        group.add(bottomMesh, lightHalo, light01, light02);
        // 设置组对象的姿态
        // group = setMeshQuaternion(group, R, lon, lat)
        group.position.set(lon, lat, 0);
        return group;
    };

    /**
     * 设置光柱颜色
     * @param group 光柱组
     * @param color 颜色值
     */
    const setLightPillarColor = (group: THREE.Group, color: THREE.ColorRepresentation): void => {
        group.children.forEach(item => {
            if (item instanceof THREE.Mesh && item.material) {
                if (item.material instanceof THREE.MeshBasicMaterial) {
                    item.material.color = new THREE.Color(color);
                }
            }
        });
    };

    /**
     * 设置网格的位置及姿态
     * @param mesh 网格对象
     * @param R 球体半径
     * @param lon 经度
     * @param lat 纬度
     * @returns 设置后的网格对象
     */
    const setMeshQuaternion = <T extends THREE.Object3D>(mesh: T, R: number, lon: number, lat: number): T => {
        const { x, y, z } = geoSphereCoord(R, lon, lat);
        mesh.position.set(x, y, z);
        // 姿态设置
        // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
        let meshVector = new THREE.Vector3(x, y, z).normalize();
        // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
        let normal = new THREE.Vector3(0, 0, 1);
        // 四元数属性.quaternion表示mesh的角度状态
        //.setFromUnitVectors();计算两个向量之间构成的四元数值
        mesh.quaternion.setFromUnitVectors(normal, meshVector);
        return mesh;
    };



    return {
        createLightPillar,
        setLightPillarColor,
        setMeshQuaternion,
    };
} 