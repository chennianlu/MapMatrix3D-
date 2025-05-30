import { EnerV3DCore } from '../../../Model3D/core';
import GeoGround from '../tools';
import { lightConfig } from '../config';
import * as THREE from 'three';

// 初始化地图核心
export const initMapCore = (container: HTMLElement): GeoGround => {
  const core = new EnerV3DCore(container);
  //@ts-ignore
  window.APP3D = core;
  
  // 设置摄像机位置
  core.camera.position.set(0, 30, 20);
  core.camera.lookAt(0, 0, 0);

  // 创建GeoGround实例
  const geoGround = new GeoGround(core);
  return geoGround;
};

// 加载地图数据
export const loadMap = async (geoGround: GeoGround, jsonPath: string, config: any = lightConfig) => {
  try {
    const mapGroup = await geoGround.init(jsonPath, config);
    const core = geoGround.core;

    if (core) {
      // 更新可点击对象
      core.selectionTool.setPickableObjects([mapGroup]);

      // 计算边界框
      const box = new THREE.Box3().setFromObject(mapGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 设置相机位置
      const camera = core.camera;
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // 调整距离

      // 设置相机位置和朝向
      camera.position.set(center.x, center.y + cameraZ, center.z);
      camera.lookAt(center);

      // 更新控制器
      const controls = core.cameraTool.orbitControl;
      controls.target.copy(center);
      controls.update();

      // 设置控制器限制
      controls.maxDistance = cameraZ * 2;
      controls.minDistance = cameraZ * 0.5;
    }
  } catch (error) {
    console.error('地图加载失败:', error);
    throw error;
  }
}; 