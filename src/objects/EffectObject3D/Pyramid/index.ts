import * as THREE from 'three';
// 使用TS文件导入着色器代码，而不是.glsl文件
import { vertexShader as PyramidVert, fragmentShader as PyramidFragment } from './shaders';
import { MathUtils, Object3D } from 'three';
import { MeshObject3D } from '../../MeshObject3D';
import { cameraTool } from '../../../tools/cameraTool';
import { animationManager } from '../../../managers/animationManager';

export interface PyramidOptions {
  radius?: number;
  color?: string;
}

// new THREE.Color(0 / 256, 0 / 256, 0 / 256) },
//     glow_color2: { type: 'v3f', value: new THREE.Color(165 / 256, 255 / 256, 244 / 256)
export class Pyramid extends MeshObject3D {
  declare geometry: THREE.ConeGeometry;
  radius: number;
  height: number;
  radialSegments: number;
  uniforms: any = {
    view_vector: { type: 'v3f', value: new THREE.Vector3(0, 0, 0) },
    c: { type: 'f', value: 2.1 },
    p: { type: 'f', value: 2.0 },
    glow_color: { type: 'v3f', value: new THREE.Color(0 / 256, 0 / 256, 0 / 256) },
    glow_color2: { type: 'v3f', value: new THREE.Color('blue') },
    time: { type: 'f', value: 0.0 },
  } as any;
  constructor(options: PyramidOptions) {
    super();
    const { radius = 1, color } = options;
    this.initGeometry(radius);
    this.initShader(color);
    this.load();
    this.playRotation();
    this._model = this;
  }
  private initGeometry = (radius: number) => {
    const height = radius * 3;
    this.geometry = new THREE.ConeGeometry(radius, height, 4, 1, true);
  };

  private load = () => {
    this.rotateX(MathUtils.degToRad(180));
    // 获取平面网格的边界框
    // const boundingBox = new THREE.Box3().setFromObject(this);

    // // 计算边界框的中心点
    // const center = boundingBox.getCenter(new THREE.Vector3());

    // // 计算平面网格的左下角顶点的位置
    // const bottomLeft = new THREE.Vector3(
    //   center.x,
    //   boundingBox.min.y,
    //   (boundingBox.min.z + boundingBox.max.z) / 2
    // );
    // // 计算从平面网格的中心点到左下角顶点的向量
    // const offset = bottomLeft.sub(center);

    // // 将平面网格沿着这个向量平移，使左下角顶点成为新的原点
    // this.position.sub(offset);
  };
  private initShader = (color: string) => {
    if (color) this.uniforms.glow_color2.value = new THREE.Color(color);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      opacity: 1,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true,
      vertexShader: PyramidVert,
      fragmentShader: PyramidFragment,
    });
  };

  /**
   * 播放默认旋转动画
   * @returns
   */
  playRotation() {
    const camera = cameraTool.camera;
    if (!camera) return;
    const _this = this;

    const animation = () => {
      _this.rotation.y += 0.03;
      _this.uniforms.time.value += 0.005;
      _this.uniforms.view_vector.value = camera.position;
    };
    animationManager.create('Pyramid_Rotation_Animation' + this.id, animation);
  }
}
