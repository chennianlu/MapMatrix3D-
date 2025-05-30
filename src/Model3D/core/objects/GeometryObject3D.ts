import * as THREE from 'three';
import materialManager from '../managers/materialManager';
import geometryManager from '../managers/geometryManager';
import geometryObjectParam from '../managers/geometryManager/geometryObjectParam';
import { MeshObject3D } from './MeshObject3D';
import { BaseInitOptions } from './BaseObject3D';

export interface GeometryObject3DInit extends BaseInitOptions {
  geometryType: GeometryType;
  geometryParam?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    widthSegments?: number;
    heightSegments?: number;
    sides?: number;
    thickness?: number;
    ringRadius?: number;
    radialSegments?: number;
    tubularSegments?: number;
    angle?: number;
    threshold?: number;
  };
  color?: string;
  opacity?: number;
}

export class GeometryObject3D extends MeshObject3D {
  public override readonly type: string = 'Geometry';

  constructor(options: GeometryObject3DInit) {
    const geometryType = options.geometryType ?? 'box';
    const defaultOptions = geometryObjectParam[geometryType] || { geometryParam: {} };
    const geometryParam = Object.assign({}, defaultOptions.geometryParam, options.geometryParam);

    // 生成几何体
    const generator = geometryManager.create(geometryType, geometryParam);
    if (!generator || !generator.geometry) {
      console.error(
        '创建基本几何体失败，基本几何体类型：',
        geometryType,
        '基本几何体参数：',
        geometryParam
      );
      return;
    }
    const geometry = generator.geometry;
    const material = materialManager.create();
    super(geometry, material);
    this.castShadow = true;
    this.receiveShadow = true;
    this.geometry = geometry;
    this.material = material;

    if (options.color) this.setColor(options.color);
    if (options.opacity) this.setOpacity(options.opacity);
    this.updateMorphTargets();
  }

  /**
   * 几何体类型不需要初始化资源
   */
  public override init(): any {}

  /**
   * 设置材质颜色
   * @param color
   */
  override setColor(color: string | null) {
    // TODO   颜色默认支持16进制字符串  其他常用格式例如RGB后续支持
    const opacity = this.getOpacity();
    //设置材质
    this.material = materialManager.create({
      color,
      opacity,
    });
  }

  getColor() {
    return (this.material as THREE.MeshBasicMaterial).color;
  }

  /**
   * 设置透明度
   * @param opacity
   */
  override setOpacity(opacity: number) {
    const color = '#' + this.getColor().getHexString();

    this.material = materialManager.create({
      opacity,
      color,
    });
  }

  getOpacity() {
    return (this.material as THREE.Material).opacity;
  }

  /**
   * 设置贴图
   * @param texture
   */
  setTexture(texture: THREE.Texture) {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  /**
   * 通过取消深度检测渲染到最上方
   * @param bool
   */
  setRenderTopmost(bool: boolean) {
    this.material.depthTest = !bool;
  }
  showBorder(params: { color: string }) {
    const { color } = params;
    const edges = new THREE.EdgesGeometry(this.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: color }));
    this.attach(line);
  }
}
