/**
 * @file 序列帧动画工具
 * @description 提供创建和控制序列帧动画的功能。
 * 该工具用于生成具有序列帧动画能力的网格对象，能够实现
 * 精灵动画效果，适用于粒子特效、UI动画和游戏角色等场景。
 * 
 * 主要功能：
 * - 创建序列帧动画网格(createSequenceFrame)
 * - 控制动画播放速度和循环
 * - 管理UV坐标自动更新
 * - 提供动画更新方法和扩展属性
 */
import * as THREE from 'three';
import { deepMerge } from './index.ts';

/**
 * 序列帧动画配置选项
 */
export interface SequenceFrameOptions {
    image: string;
    width: number;
    height: number;
    frame: number;
    column: number;
    row: number;
    speed: number;
}

/**
 * 增强的序列帧Mesh，包含更新方法和粒子属性
 */
export interface SequenceFrameMesh extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    updateSequenceFrame: (time: number) => void;
    speed?: number; // 上升速度
    lifecycle?: number; // 当前生命周期
    maxLifecycle?: number; // 最大生命周期
    startY?: number; // 初始Y位置
    startX?: number; // 初始X位置
}

/**
 * 生成序列帧动画
 * @param opt 配置选项
 * @returns 带有updateSequenceFrame方法的mesh
 */
export function createSequenceFrame(opt: Partial<SequenceFrameOptions>): SequenceFrameMesh {
    // 创建纹理加载器
    const textureLoader = new THREE.TextureLoader();

    // 默认参数
    const options = deepMerge<SequenceFrameOptions, Partial<SequenceFrameOptions>>(
        {
            image: '',
            width: 200, // 显示的宽度
            height: 200, // 显示的高度
            frame: 60, // 总共的帧数
            column: 10, // 序列图的列
            row: 6, // 序列图的行
            speed: 0.5, // 速度
        },
        opt
    );

    // 创建几何体
    const geometry = new THREE.PlaneGeometry(options.width, options.height); // 矩形平面

    // 加载纹理
    const texture = textureLoader.load(options.image);
    texture.repeat.set(1 / options.column, 1 / options.row); // 从图像上截图第一帧

    // 创建材质
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        depthWrite: false, // 是否对深度缓冲区有任何的影响
    });

    // 创建网格并进行类型扩展
    const mesh = new THREE.Mesh(geometry, material) as SequenceFrameMesh;

    // 动画状态变量
    let r = 0; // 当前行
    let c = 0; // 当前列
    let t = 0; // 时间

    // 添加更新序列帧的方法
    mesh.updateSequenceFrame = (time: number) => {
        t += options.speed;
        if (t > options.frame) t = 0;
        c = options.column - Math.floor(t % options.column) - 1;
        r = Math.floor((t / options.column) % options.row);
        texture.offset.x = c / options.column; // 动态更新纹理偏移 播放关键帧动画
        texture.offset.y = r / options.row; // 动态更新纹理偏移 播放关键帧动画
    };

    // 预先设置粒子可能需要的属性
    mesh.speed = 0; // 上升速度
    mesh.lifecycle = 0; // the current lifecycle
    mesh.maxLifecycle = 0; // 最大生命周期
    mesh.startY = 0; // 初始Y位置
    mesh.startX = 0; // 初始X位置

    return mesh;
} 