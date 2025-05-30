import { EnerV3DCore } from '../Model3D/core';
import GeoGround from '../components/GraphGIS/tools';
import { EffectGround } from '../Model3D/core/objects/EffectObject3D/EffectGround';
import * as THREE from 'three';

let globalCore: EnerV3DCore | null = null;
let geoGround: GeoGround | null = null;

export const initMapCore = (container: HTMLDivElement) => {
  if (!globalCore) {
    globalCore = new EnerV3DCore(container);
    globalCore.camera.position.set(0, 30, 20);
    globalCore.camera.lookAt(0, 0, 0);
  }
  return globalCore;
};

export const loadMap = async (jsonPath: string, config?: any) => {
  if (!globalCore) return null;

  // 清理之前的实例
  if (geoGround) {
    geoGround.dispose();
    geoGround = null;
  }

  // 创建新实例
  geoGround = new GeoGround(globalCore);

  const customGround = new EffectGround({
    radius: 200,
    groundColor: config?.ground?.groundColor || '#ffffff',
    markColor: config?.ground?.markColor || '#ffffff',
    groundOpacity: config?.ground?.groundOpacity || 0.8,
    animation: true,
    markUrl: './assets/texture/光1.png',
    groundUrl: './assets/texture/地板线01.png',
    glowEffect: {
      glowColor: config?.light?.glowColor || '#00aaff',
      glowWidth: config?.light?.glowWidth || 0.6,
      glowIntensity: config?.light?.glowIntensity || 0.7,
      glowFalloff: config?.light?.glowFalloff || 1.6
    }
  });

  globalCore.scene.add(customGround);
  globalCore.sceneEffectTool.setBackground({
    type: 'color',
    color: config?.background?.backgroundColor || '#eeeeee'
  });

  try {
    const mapGroup = await geoGround.init(jsonPath, config);
    if (globalCore) {
      // 更新可点击对象
      globalCore.selectionTool.setPickableObjects([mapGroup]);

      // 计算边界框
      const box = new THREE.Box3().setFromObject(mapGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 设置相机位置
      const camera = globalCore.camera;
      if (camera instanceof THREE.PerspectiveCamera) {
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5;

        // 设置相机位置和朝向
        camera.position.set(center.x, center.y + cameraZ, center.z);
        camera.lookAt(center);

        // 更新控制器
        const controls = globalCore.cameraTool.orbitControl;
        if (controls) {
          controls.target.copy(center);
          controls.update();

          // 设置控制器限制
          controls.maxDistance = cameraZ * 2;
          controls.minDistance = cameraZ * 0.5;
        }
      }
    }
    return mapGroup;
  } catch (error) {
    console.error('地图加载失败:', error);
    return null;
  }
}; 