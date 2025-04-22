/**
 * @file 粒子效果工具
 * @description 提供创建和管理粒子效果的功能，支持序列帧动画和空间运动。
 * 该工具可用于生成各种粒子特效，如上升粒子、飘动粒子等，
 * 适用于增强场景的动态效果和视觉体验。
 * 
 * 主要功能：
 * - 在指定区域内随机生成粒子
 * - 管理粒子生命周期和运动轨迹
 * - 更新粒子动画和位置
 * - 提供随机数生成和粒子属性设置工具
 */
import * as THREE from 'three';
import { MeshObject3D } from '../../src/objects/MeshObject3D';

// 随机数生成函数
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// 定义带有updateSequenceFrame方法的接口
export interface SequenceFrameMesh extends MeshObject3D {
  updateSequenceFrame: (time: number) => void;
  speed?: number; // 上升速度
  lifecycle?: number; // 生命周期
  maxLifecycle?: number; // 最大生命周期
  startY?: number; // 初始Y位置
  startX?: number; // 初始X位置
}

/**
 * 初始化粒子
 * @param scene THREE.Scene场景
 * @param bound 粒子生成区域的中心和大小
 * @param createSequenceFrame 创建序列帧的函数
 * @returns 初始化的粒子数组
 */
export const initParticles = (
  scene: THREE.Scene, 
  bound: { center: THREE.Vector3, size: THREE.Vector3 },
  createSequenceFrame: (options: any) => SequenceFrameMesh
): SequenceFrameMesh[] => {
  // 获取中心点和中间地图大小
  let { center, size } = bound;
  // 构建范围，中间地图的2倍
  let minX = center.x - size.x;
  let maxX = center.x + size.x;
  let minY = center.y - size.y;
  let maxY = center.y + size.y;
  let minZ = -6;
  let maxZ = 6;

  let particles: SequenceFrameMesh[] = [];
  for (let i = 0; i < 16; i++) {
    const particle = createSequenceFrame({
      image: "./data/map/上升粒子1.png",
      width: 180,
      height: 189,
      frame: 9,
      column: 9,
      row: 1,
      speed: 0.5,
    });
    // 不参与射线检测
    particle.pickedEnable = false;
    let particleScale = random(5, 10) / 1000;
    particle.scale.set(particleScale, particleScale, particleScale);
    particle.rotation.y = Math.PI / 2;

    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let z = random(minZ, maxZ);

    particle.position.set(x, y, z);

    // 添加粒子上升动画的属性
    particle.speed = random(0.002, 0.01);  // 上升速度
    particle.lifecycle = 0;  // 当前生命周期
    particle.maxLifecycle = random(100, 200);  // 最大生命周期
    particle.startY = y;  // 初始Y位置
    particle.startX = x;  // 初始X位置

    scene.add(particle);
    particles.push(particle);
  }

  return particles;
};

/**
 * 更新粒子动画
 * @param particles 粒子数组
 * @param time 当前时间
 */
export const updateParticles = (particles: SequenceFrameMesh[], time: number): void => {
  particles.forEach(particle => {
    if (particle && particle.updateSequenceFrame) {
      // 更新序列帧
      particle.updateSequenceFrame(time);

      // 更新粒子位置 - 沿Y轴上升
      if (particle.speed && particle.lifecycle !== undefined && particle.maxLifecycle !== undefined &&
        particle.startY !== undefined && particle.startX !== undefined) {

        // 增加生命周期
        particle.lifecycle += 1;

        // 向上移动
        particle.position.y += particle.speed;

        // 当达到最大生命周期时，重置粒子位置
        if (particle.lifecycle >= particle.maxLifecycle) {
          particle.position.y = particle.startY;
          particle.position.x = particle.startX;
          particle.lifecycle = 0;
        }
      }
    }
  });
}; 