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
import { SequenceFrameOptions } from './sequenceFrameUtils';

// 随机数生成函数
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// 定义带有updateSequenceFrame方法的接口
export interface SequenceFrameMesh extends THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  updateSequenceFrame: (time: number) => void;
  speed?: number; // 上升速度
  lifecycle?: number; // 生命周期
  maxLifecycle?: number; // 最大生命周期
  startY?: number; // 初始Y位置
  startX?: number; // 初始X位置
  startZ?: number; // 初始Z位置
}

/**
 * 初始化粒子
 * @param container THREE.Group粒子容器
 * @param bound 粒子生成区域的中心和大小
 * @param createSequenceFrame 创建序列帧的函数
 * @returns 初始化的粒子数组
 */
export const initParticles = (
  container: THREE.Group, 
  bound: { center: THREE.Vector3, size: THREE.Vector3 },
  createSequenceFrame: (options: Partial<SequenceFrameOptions>) => SequenceFrameMesh
): SequenceFrameMesh[] => {
  // 获取中心点和中间地图大小
  let { center, size } = bound;
  
  // 获取地图边界盒子的最大边长
  const maxSize = Math.max(size.x, size.y, size.z);
  
  // 粒子密度控制参数
  const DENSITY_FACTOR = 0.5; // 密度因子，控制粒子数量
  const MIN_PARTICLES = 16;   // 最小粒子数量
  const MAX_PARTICLES = 50;   // 最大粒子数量
  
  // 根据最大边长计算粒子数量
  const baseParticleCount = MIN_PARTICLES;
  const additionalParticles = Math.floor((maxSize / 50) * DENSITY_FACTOR);
  const totalParticles = Math.min(baseParticleCount + additionalParticles, MAX_PARTICLES);

  // 使用最大边长创建立方体空间
  const cubeSize = maxSize;
  const halfSize = cubeSize / 2;
  
  // 构建立方体空间范围
  let minX = center.x - halfSize;
  let maxX = center.x + halfSize;
  let minY = center.y - halfSize;
  let maxY = center.y + halfSize;
  let minZ = center.z - halfSize;
  let maxZ = center.z + halfSize;

  // 粒子大小控制参数
  const BASE_SIZE = 1; // 基础大小
  const SIZE_FACTOR = 0.5; // 大小因子
  const MAX_SIZE_FACTOR = 2; // 最大大小因子
  
  // 粒子速度控制参数
  const BASE_SPEED = 0.002;
  const SPEED_FACTOR = 0.5;  // 速度因子
  const MAX_SPEED_FACTOR = 2; // 最大速度因子

  let particles: SequenceFrameMesh[] = [];
  for (let i = 0; i < totalParticles; i++) {
    // 根据最大边长调整粒子大小
    const sizeFactor = Math.min(maxSize / 100, MAX_SIZE_FACTOR);
    const particleSize = BASE_SIZE * (1 + sizeFactor * SIZE_FACTOR);

    const particle = createSequenceFrame({
      image: "./data/map/上升粒子1.png",
      width: particleSize,
      height: particleSize,
      frame: 9,
      column: 9,
      row: 1,
      speed: 0.5,
    });
    
    particle.rotation.y = Math.PI / 2;

    // 在立方体空间内随机生成位置
    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let z = random(minZ, maxZ);

    particle.position.set(x, y, z);

    // 添加粒子上升动画的属性
    const speedFactor = Math.min(maxSize / 100, MAX_SPEED_FACTOR);
    particle.speed = random(BASE_SPEED, BASE_SPEED * (1 + speedFactor * SPEED_FACTOR));
    
    // 优化生命周期，根据地图大小调整
    const baseLifecycle = 100;
    const maxLifecycle = 200;
    const lifecycleFactor = Math.min(maxSize / 100, 2);
    particle.lifecycle = 0;
    particle.maxLifecycle = random(
      baseLifecycle,
      maxLifecycle * (1 + lifecycleFactor * 0.5)
    );
    
    particle.startY = y;
    particle.startX = x;
    particle.startZ = z;

    container.add(particle);
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
        particle.startY !== undefined && particle.startX !== undefined && particle.startZ !== undefined) {

        // 增加生命周期
        particle.lifecycle += 1;

        // 向上移动
        particle.position.y += particle.speed;

        // 当达到最大生命周期时，重置粒子位置
        if (particle.lifecycle >= particle.maxLifecycle) {
          particle.position.y = particle.startY;
          particle.position.x = particle.startX;
          particle.position.z = particle.startZ;
          particle.lifecycle = 0;
        }
      }
    }
  });
}; 