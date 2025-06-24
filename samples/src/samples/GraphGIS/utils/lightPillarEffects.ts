/**
 * @file 光柱效果工具
 * @description 提供创建和管理光柱、光环等光效的功能。
 * 该工具使用着色器技术实现动态光效，如上升光柱、扩散光环、
 * 波动效果等，适用于地图标记、数据可视化和科技感界面。
 * 
 * 主要功能：
 * - 创建动态光柱效果，支持波动和渐变
 * - 创建环形光效，用于标记或强调位置
 * - 提供光效动画更新函数
 * - 支持自定义颜色、尺寸、位置和动画参数
 */
import * as THREE from 'three';
import { createGradientGlowMaterial } from './createGradientGlowMaterial';

/**
 * 创建光柱效果
 * @param options 光柱配置选项
 * @returns 光柱网格对象
 */
export const createLightPillar = (options: {
  position?: THREE.Vector3; // 光柱位置
  color?: THREE.Color | string; // 光柱颜色
  height?: number; // 光柱高度
  width?: number; // 光柱宽度
  duration?: number; // 动画持续时间
}) => {
  const {
    position = new THREE.Vector3(0, 0, 0),
    color = new THREE.Color(0x00ffff),
    height = 100,
    width = 10,
    duration = 2000
  } = options;

  // 创建光柱几何体 (简单的平面)
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.rotateX(Math.PI / 2); // 使平面竖直向上
  
  // 创建光柱材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      
      void main() {
        vUv = uv;
        // 添加一些波动效果
        vec3 pos = position;
        pos.y += sin(position.x * 10.0 + time * 2.0) * 0.2;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 color;
      uniform float time;
      
      void main() {
        // 创建从下到上渐变消失的效果
        float alpha = 1.0 - vUv.y;
        
        // 添加一些闪烁效果
        alpha *= 0.8 + 0.2 * sin(time * 3.0);
        
        // 边缘渐变效果
        float edge = 0.1;
        alpha *= smoothstep(0.0, edge, vUv.x) * smoothstep(1.0, 1.0 - edge, vUv.x);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  // 创建光柱网格
  const pillar = new THREE.Mesh(geometry, material);
  pillar.position.copy(position);
  
  // 添加更新方法
  const startTime = Date.now();
  pillar.userData.update = () => {
    const elapsed = (Date.now() - startTime) % duration / 1000;
    material.uniforms.time.value = elapsed;
  };

  return pillar;
};

/**
 * 创建光环效果
 * @param options 光环配置选项
 * @returns 光环网格对象
 */
export const createLightRing = (options: {
  position?: THREE.Vector3; // 光环位置
  color?: THREE.Color | string; // 光环颜色
  radius?: number; // 光环半径
  thickness?: number; // 光环厚度
  rotation?: THREE.Euler; // 光环旋转
}) => {
  const {
    position = new THREE.Vector3(0, 0, 0),
    color = new THREE.Color(0x00ffff),
    radius = 20,
    thickness = 2,
    rotation = new THREE.Euler(Math.PI / 2, 0, 0) // 默认水平放置
  } = options;

  // 创建环形几何体
  const geometry = new THREE.RingGeometry(radius - thickness / 2, radius + thickness / 2, 64);
  
  // 创建发光材质
  const material = createGradientGlowMaterial({
    glowColor: new THREE.Color(color),
    glowIntensity: 1.0,
    glowWidth: 0.5,
    glowFalloff: 3.0
  });
  
  // 创建光环网格
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.rotation.copy(rotation);
  
  return ring;
};

/**
 * 更新光柱效果
 * @param lightPillars 光柱数组
 */
export const updateLightPillars = (lightPillars: THREE.Mesh[]) => {
  lightPillars.forEach(pillar => {
    if (pillar.userData.update && typeof pillar.userData.update === 'function') {
      pillar.userData.update();
    }
  });
}; 