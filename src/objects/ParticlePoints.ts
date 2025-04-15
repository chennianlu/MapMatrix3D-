/**
 * @format
 */
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  TextureLoader,
} from 'three';
// import * as THREE from 'three';

import { BaseInitOptions, BaseObject3D } from './BaseObject3D';
import { PARTICLE_TYPE } from '../constants';
import { animationManager } from '../managers/animationManager';
import { Easing, Tween } from '@tweenjs/tween.js';

export interface ParticleInitOptions extends BaseInitOptions {
  particleType?: PARTICLE_TYPE;
  particleCounts?: number;
  radius?: number;
  rotation?: number;
  position?: number[];
}

interface GeometryOps {
  magnification?: number;
  minVelocity?: number;
  particleCounts?: number;
  radius?: number;
  rotation?: number;
  position?: number[];
}
interface MaterialOps {
  textureUrl?: string;
  size?: number;
  materialColor?: string;
}

class ParticlePoints extends BaseObject3D {
  public override readonly type: string = 'ParticlePoints';
  particleCounts: number;
  node: Points | Sprite;
  radius: number;
  tweenGroup: Tween<unknown>[] = [];

  constructor(params: ParticleInitOptions) {
    super(params);

    this.particleCounts = params.particleCounts || 150;
    this.radius = params.radius || 500;
  }

  public override async init(params: ParticleInitOptions) {
    const { particleType, particleCounts, radius, rotation, position } = params;
    switch (particleType) {
      case PARTICLE_TYPE.RAIN:
        await this.initFloatDownParticles(
          {
            magnification: 8,
            minVelocity: 4,
            particleCounts,
            radius,
          },
          {
            materialColor: '#eeeeee',
            size: 20,
            textureUrl: 'assets/images/sprites/rain-fall.png',
          }
        );
        break;
      case PARTICLE_TYPE.SNOW:
        await this.initFloatDownParticles(
          {
            magnification: 5,
            minVelocity: 1,
            particleCounts,
            radius: radius || 200,
          },
          {
            textureUrl: 'assets/images/sprites/snowflake_alpha.png',
            size: 15,
            materialColor: '#ffffff',
          }
        );
        break;
      case PARTICLE_TYPE.FLAME:
        await this.initFlameParticles({ position });
        break;
      case PARTICLE_TYPE.SPRAY:
        await this.initSprayParticles(
          {
            magnification: 3,
            minVelocity: 6,
            particleCounts,
            radius: 4,
            rotation,
            position,
          },
          {
            materialColor: '#89bffe',
            size: 2,
            textureUrl: 'assets/images/sprites/water.png',
          }
        );
        break;
      default:
        throw new Error('Unknown ParticleType!');
    }
    return this;
  }

  /**
   * @description: 飘落效果
   * @param {GeometryOps} geometryOps
   * @param {MaterialOps} materialOps
   */
  private initFloatDownParticles(geometryOps: GeometryOps, materialOps: MaterialOps) {
    const geometry = this.initFloatDownGeometry(geometryOps);
    const material = this.initMaterial(materialOps);
    const particles = new Points(geometry, material);
    this.node = particles;
    this.add(particles);
    this.playFloatDownAnimation(geometryOps);
  }

  private initFloatDownGeometry(geometryOps: GeometryOps) {
    const { particleCounts, radius, magnification, minVelocity } = geometryOps;
    const geometry = new BufferGeometry();
    const vertices: number[] = [];
    const velocityYs: number[] = [];
    for (let i = 0; i < particleCounts; ++i) {
      const x = this.getRandomPosition(radius);
      const y = this.getRandomPosition(radius);
      const z = this.getRandomPosition(radius);
      const velocityY = this.getRandomVelocity(magnification, minVelocity);
      vertices.push(x, y, z);
      velocityYs.push(velocityY);
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('speed', new Float32BufferAttribute(velocityYs, 1));
    return geometry;
  }

  private initMaterial(materialOps: MaterialOps) {
    const { textureUrl, size, materialColor } = materialOps;
    const texture = new TextureLoader().load(textureUrl);
    const material = new PointsMaterial({
      size: size,
      sizeAttenuation: true,
      map: texture,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      color: materialColor,
    });
    return material;
  }

  private getRandomVelocity(magnification: number, minVelocity: number) {
    return Math.random() * magnification + minVelocity;
  }
  private getRandomPosition(radius: number) {
    return (Math.random() * 2 - 1) * radius;
  }

  private playFloatDownAnimation(geometryOps: GeometryOps) {
    const { magnification, minVelocity, radius, particleCounts } = geometryOps;
    const { node, getRandomVelocity } = this;
    const { position, speed } = node.geometry.attributes;

    animationManager.create('ParticlePoints', () => {
      for (let i = 0; i < particleCounts; ++i) {
        let movingY = position.getY(i) - speed.getX(i);
        if (movingY < -radius) {
          movingY = radius;
          speed.setX(i, getRandomVelocity(magnification, minVelocity));
        }
        position.setY(i, movingY);
      }
      node.rotateY(0.001);
      position.needsUpdate = true;
    });
  }

  /**
   * @description: 喷水效果
   * @param {GeometryOps} geometryOps
   * @param {MaterialOps} materialOps
   */
  private initSprayParticles(geometryOps: GeometryOps, materialOps: MaterialOps) {
    const { position } = geometryOps;
    const geometry = this.initWaterGeometry(geometryOps);
    const material = this.initMaterial(materialOps);
    const particles = new Points(geometry, material);
    this.node = particles;
    particles.rotateY(geometryOps.rotation);
    particles.position.fromArray(position);
    this.add(particles);
    this.playSprayAnimation(geometryOps);
  }
  private playSprayAnimation(geometryOps: GeometryOps) {
    const { particleCounts } = geometryOps;
    const { node, PositionDistributionFunction } = this;
    const { position } = node.geometry.attributes;

    const tween = animationManager.createTween({
      startValue: { offset: 0 },
      endValue: { offset: 10 },
      animationType: Easing.Linear.None,
      name: 'Spray Animation',
      callback: ({ offset }) => {
        for (let i = 0; i < particleCounts; ++i) {
          const movingX = position.getX(i) + offset;
          const [x, y, z] = PositionDistributionFunction(movingX);
          position.setXYZ(i, x, y, z);
        }
        position.needsUpdate = true;
      },
      repeat: Infinity,
      time: 8000,
    });
    this.tweenGroup.push(tween);
    tween.start();
  }
  private PositionDistributionFunction = (x: number): number[] => {
    const validX = (x + 100) % 100;
    const bias = this.getRandomPosition(validX / 10);
    return [validX, (-(validX - 100) * validX) / 100 + bias, bias];
  };
  private initWaterGeometry(geometryOps: GeometryOps) {
    const { particleCounts } = geometryOps;

    const geometry = new BufferGeometry();
    const vertices: number[] = [];

    for (let i = 0; i < particleCounts; ++i) {
      const [x, y, z] = this.PositionDistributionFunction(i);
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    return geometry;
  }

  /**
   * @description: 火焰效果
   * @param {GeometryOps} geometryOps
   * @param {MaterialOps} materialOps
   */
  private initFlameParticles(geometryOps: GeometryOps) {
    const { position } = geometryOps;

    const material = this.initShaderMaterial();

    const particles = new Sprite(material as unknown as SpriteMaterial);
    particles.position.fromArray(position);

    this.node = particles;
    this.add(particles);
    this.playFlameAnimation();
  }

  private initShaderMaterial() {
    // Threejs-sprite shader原理：https://www.jianshu.com/p/629afb694778
    const vertexShader = `
      uniform float size;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ); // 只取得位移信息；
          // 获取缩放信息: 
          // scale.x = length( vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z) );
          // scale.y = length( vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z) );
          mvPosition.xy += position.xy;
          gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragmentShader = `
      uniform float iTime;
      varying vec2 vUv;

      // procedural noise from IQ
      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
          const float K1 = 0.366025404; // (sqrt(3)-1)/2;
          const float K2 = 0.211324865; // (3-sqrt(3))/6;

          vec2 i = floor(p + (p.x + p.y) * K1);

          vec2 a = p - i + (i.x + i.y) * K2;
          vec2 o = a.x > a.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec2 b = a - o + K2;
          vec2 c = a - 1.0 + 2.0 * K2;

          vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);

          vec3 n =
              h *
              h *
              h *
              h *
              vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

          return dot(n, vec3(70.0));
      }
      // 分形布朗运动 Fractal Brown Motion
      float fbm(vec2 uv) {
          float f;
          mat2 m = mat2(
              1.6,  1.2,
              -1.2,  1.6
          );
          f = 0.5 * noise(uv);
          uv = m * uv;
          f += 0.25 * noise(uv);
          uv = m * uv;
          f += 0.125 * noise(uv);
          uv = m * uv;
          f += 0.0625 * noise(uv);
          uv = m * uv;
          f = 0.5 + 0.5 * f;
          return f;
      }
      
      void main() {
        vec2 uv = vUv;
        uv.x = uv.x - 0.5;
        uv.y -= 0.25;

        float strength = 3.0;
        float T3 = strength * iTime; // T3：强度最高 3.0
        float noise1 = fbm(strength * uv - vec2(0, T3)); // 用于火焰效果
        float noise2 = fbm(strength * uv * 1.25 - vec2(0, T3)); // 将火焰 uv 略微偏移，生成烟雾所用的波形

        // noise 后面的函数使图像在 uv.y > 0.4427 时，图像为负，因此保持黑色
        float grayLevel = noise1 * (1.5 - pow(4.0 * uv.y, 4.0));
        grayLevel = clamp(grayLevel, 0.0, 1.0);

        // 通过 RGB 三色通道 + 灰度图 调节输出的颜色
        vec3 color = vec3(
            1.5 * grayLevel,
            1.5 * pow(grayLevel, 3.0),
            pow(grayLevel, 6.0)
        );
        // 混合火焰和烟雾效果
        color = mix(
            color,
            vec3(pow(noise2, 6.0)),
            0.75 - (color.x + color.y + color.z) / 3.0
        );

        // 生成一个系数，进而计算出 a 的值，最终控制火焰的宽度范围
        float c =
            1.0 -
            16.0 *
                pow(
                    max(
                        0.0,
                        length(uv * vec2(1.8 + uv.y * 1.5, 0.75)) -
                            noise1 * max(0.0, uv.y + 0.5)
                    ),
                    1.2
                );
        float flameWidth = c * (1.0 - pow(uv.y + 0.25, 3.0));
        vec4 fragColor = vec4(mix(vec3(0.0), color, flameWidth), 1.0);
        gl_FragColor = fragColor;
      }
    `;
    // 初始值
    const uniforms = {
      iTime: {
        value: 1.0,
      },
      size: {
        value: 15,
      },
    };
    const material = new ShaderMaterial({
      name: 'Flame Shader',
      uniforms,
      blending: AdditiveBlending,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    return material;
  }

  private playFlameAnimation() {
    const node = this.node;

    const { iTime } = (node.material as ShaderMaterial).uniforms;
    const startTime = Date.now();

    animationManager.create('ParticlePointsFrame', () => {
      iTime.value = (Date.now() - startTime) / 1000; // 控制变化速率
    });
  }
}

export { ParticlePoints };
