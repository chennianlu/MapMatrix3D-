/**
 * @file 发光形状工具
 * @description 提供创建具有内发光效果的多边形形状的功能。
 * 该工具可以从THREE.Shape对象生成发光网格对象，
 * 实现边缘内部渐变发光效果，适用于创建科技感界面元素。
 * 
 * 主要功能：
 * - 从Shape对象提取和标准化顶点
 * - 计算形状中心点并将几何体居中处理
 * - 标准化UV坐标以确保正确的发光效果
 * - 应用内发光材质并设置适当的缩放和位置
 */
import * as THREE from 'three';
import { MeshObject3D } from '@enerv-3d/core';
import { createGradientGlowMaterial } from './createGradientGlowMaterial';

interface GlowingShapeOptions {
  parentObject: THREE.Object3D;
  glowColor?: THREE.Color;
  glowWidth?: number;
  glowIntensity?: number;
  glowFalloff?: number;
  glowType?: 'edge' | 'center';
}

/**
 * 标准化UV坐标
 * @param geometry 几何体
 */
const normalizeUVs = (geometry: THREE.ShapeGeometry): void => {
  geometry.computeBoundingBox();
  if (!geometry.boundingBox) return;
  
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  const min = geometry.boundingBox.min;
  
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const newUVs = new Float32Array(uvs.count * 2);
  
  for (let i = 0; i < uvs.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    const normalizedX = (x - min.x) / size.x;
    const normalizedY = (y - min.y) / size.y;
    
    newUVs[i * 2] = normalizedX;
    newUVs[i * 2 + 1] = normalizedY;
  }
  
  geometry.setAttribute('uv', new THREE.BufferAttribute(newUVs, 2));
};

/**
 * 创建一个发光多边形
 * @param shape THREE.Shape对象
 * @param options 配置选项
 * @returns 创建的发光多边形网格
 */
export const createGlowingShape = (shape: THREE.Shape, options: GlowingShapeOptions): MeshObject3D => {
  // 设置默认值
  const {
    parentObject,
    glowColor = new THREE.Color(0, 0.5, 1),
    glowWidth = 0.3,
    glowIntensity = 1.0,
    glowFalloff = 2.0,
    glowType = 'edge'
  } = options;
  
  // 创建几何体
  const geometry = new THREE.ShapeGeometry(shape);
  
  // 标准化UV坐标
  normalizeUVs(geometry);
  
  // 提取顶点数据并转换为Vector2数组
  const vertices = shape.getPoints().map(point => new THREE.Vector2(point.x, point.y));
  
  // 创建发光材质
  const glowMaterial = createGradientGlowMaterial({
    glowColor,
    baseColor: new THREE.Color(1, 1, 1),
    glowIntensity,
    glowWidth,
    glowFalloff,
    glowType,
    vertices
  });
  
  // 设置材质属性
  glowMaterial.transparent = true;
  (glowMaterial as THREE.ShaderMaterial).depthTest = false;
  (glowMaterial as THREE.ShaderMaterial).depthWrite = false;
  
  // 创建网格
  const shapeMesh = new MeshObject3D(geometry, glowMaterial);
  shapeMesh.userData.shape = 'glowingShape';
  // 设置渲染顺序
  shapeMesh.renderOrder = -1;
  
  // 计算父对象的包围盒
  parentObject.updateMatrixWorld(true);
  const parentBoundingBox = new THREE.Box3().setFromObject(parentObject);
  const parentSize = new THREE.Vector3();
  parentBoundingBox.getSize(parentSize);
  
  
  // 更新材质
  (glowMaterial as any).updateFromGeometry(geometry);
  
  // 添加到父对象
  parentObject.add(shapeMesh);
  
  // 确保正确的渲染顺序
  if (parentObject.renderOrder >= shapeMesh.renderOrder) {
    parentObject.renderOrder = shapeMesh.renderOrder - 1;
  }
  
  return shapeMesh;
}; 