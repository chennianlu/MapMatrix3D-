import { shader as shieldVertexShader } from './shader/shield-vs.js';
import { shader as shieldFragmentShader } from './shader/shield-fs.js';
import * as THREE from 'three';
import { MeshObject3D } from '../../MeshObject3D';
import { animationManager } from '../../../managers/animationManager';
import { loader } from '../../../tools/loader';

export interface ShieldOptions {
  radius?: number;
  hemisphere?: boolean;
  color?: string;
}

export class Shield extends MeshObject3D {
  declare geometry: THREE.SphereGeometry;
  radius: number;
  hemisphere: boolean;
  constructor(options: ShieldOptions) {
    super();
    const { hemisphere, radius = 1, color = '#0000ff' } = options;
    const depth = new THREE.WebGLRenderTarget(1, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: true,
    });
    // 判断是否为半球
    const thetaLength = hemisphere === true ? Math.PI / 2 : Math.PI;
    this.geometry = new THREE.SphereGeometry(radius, 64, 32, 0, Math.PI * 2, 0, thetaLength);
    this.geometry.center();
    // TODO  路径问题
    loader.loadTexture('/images/noise.png').then(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          depthBuffer: { value: null },
          resolution: { value: new THREE.Vector2(1, 1) },
          bufColor: { value: null },
          u_tex: { value: null },
          time: { value: 0.0 },
          cellColor: { value: new THREE.Color().set(color) },
          cellOpacity: { value: 0.1 }, // 默认不对外暴露
        },
        vertexShader: shieldVertexShader,
        fragmentShader: shieldFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      this.material.uniforms.depthBuffer.value = depth.texture;
      this.material.uniforms.bufColor.value = depth.texture;
      this.material.uniforms.u_tex.value = texture;
      this.playRotation();
    });

    this._model = this;
  }

  /**
   * 播放默认旋转动画
   * @returns
   */
  playRotation() {
    const _this = this;

    const animation = time => {
      _this.material.uniforms.time.value = time;
    };
    animationManager.create('Shield_Rotation_Animation' + this.uuid, animation);
  }
}
