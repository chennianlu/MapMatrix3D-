import * as THREE from 'three';
import { deepMerge } from '../utils';
import { SequenceFrameMesh, SequenceFrameOptions } from '../utils/sequenceFrameUtils';

export default function useSequenceFrameAnimate() {
    const textureLoader = new THREE.TextureLoader(); // 纹理贴图加载器

    /**
     * 创建序列帧动画
     * @param opt 配置选项
     * @returns 带有updateSequenceFrame方法的mesh
     */
    const createSequenceFrame = (opt: Partial<SequenceFrameOptions>): SequenceFrameMesh => {
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

        const geometry = new THREE.PlaneGeometry(options.width, options.height); // 矩形平面
        const texture = textureLoader.load(options.image); // 加载图片
        texture.repeat.set(1 / options.column, 1 / options.row); // 从图像上截图第一帧

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false, // 是否对深度缓冲区有任何的影响
        });

        const mesh = new THREE.Mesh(geometry, material) as SequenceFrameMesh;

        let r = 0; // 当前行
        let c = 0; // 当前列
        let t = 0; // 时间

        mesh.updateSequenceFrame = (time: number): void => {
            t += options.speed;
            if (t > options.frame) t = 0;
            c = options.column - Math.floor(t % options.column) - 1;
            r = Math.floor((t / options.column) % options.row);
            texture.offset.x = c / options.column; // 动态更新纹理偏移 播放关键帧动画
            texture.offset.y = r / options.row; // 动态更新纹理偏移 播放关键帧动画
        };

        // 预设粒子属性
        mesh.speed = 0;
        mesh.lifecycle = 0;
        mesh.maxLifecycle = 0;
        mesh.startY = 0;
        mesh.startX = 0;

        return mesh;
    };

    return {
        createSequenceFrame,
    };
} 