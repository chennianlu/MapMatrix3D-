/**
 * @format
 * @Description  : MetaBall 对象
 * @LastEditors  : 黄鹏 huangp08@catl.com
 * @LastEditTime : 2023-09-26 14:50:00
 */
import {
  AdditiveBlending,
  BackSide,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
} from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';

import { BaseInitOptions, BaseObject3D } from './BaseObject3D';
import { animationManager } from '../managers/animationManager';

export interface MetaBallInitOptions extends BaseInitOptions {
  subSphereCounts?: number;
  energyColor?: string;
  percentage?: number;
}

class MetaBall extends BaseObject3D {
  public override readonly type: string = 'MetalBall';
  energySphere: Mesh<SphereGeometry, ShaderMaterial>;
  mainEnergyShaderMaterial: ShaderMaterial;
  subEnergySphere: MarchingCubes;
  private percentage: number = 0.4;

  constructor(params: MetaBallInitOptions) {
    super(params);
  }

  public override async init(options: MetaBallInitOptions) {
    const {
      subSphereCounts = 3,
      energyColor = '#7ee85c',
      position = [0, 0, 0],
      scale = [1, 1, 1],
    } = options;

    const chargingEffect = this.createChargingEffect(energyColor);
    // 一般 x、y、z 缩放比一致，可能导致圆变形
    chargingEffect.scale.fromArray(scale);
    chargingEffect.position.fromArray(position);
    this.add(chargingEffect);
    this.play(subSphereCounts, energyColor);
    return this;
  }

  /**
   * @description: 更新能量球百分比
   * @param {number} percent 百分比值，取值范围：[0, 1]
   * @return {void}
   */
  public updateEnergyPercentage(percent: number) {
    // 运行 play() 后，每帧均会更新相应uniform
    this.percentage = percent < 0 ? 0 : percent > 1 ? 1 : percent;
  }

  private createChargingEffect(energyColor: string) {
    const group = new Group();
    // 主能量球
    this.createMainEnergySphere(group, energyColor);
    // 子能量球 ———— 包含 MetaBall 效果
    this.createSubEnergy(group);
    return group;
  }

  private createMainEnergySphere(group: Group, energyColor: string) {
    const mainGeometry = new SphereGeometry(1.5);
    const mainMaterial = this.createShaderMaterial(energyColor);
    const energySphere = new Mesh(mainGeometry, mainMaterial);
    energySphere.position.setY(3.0);
    this.energySphere = energySphere;
    this.mainEnergyShaderMaterial = mainMaterial;
    group.add(energySphere);
  }

  private createSubEnergy(group: Group) {
    const subMaterial = new MeshBasicMaterial({
      transparent: true,
      vertexColors: true,
      blending: AdditiveBlending,
      opacity: 0.5,
    });
    const effect = new MarchingCubes(28, subMaterial, true, true, 100000);
    effect.position.set(0, 0, 0);
    effect.scale.set(2, 2, 2);
    this.subEnergySphere = effect;
    group.add(effect);
  }

  private createShaderMaterial(energyColor) {
    const material = new ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        electricQuantity: { value: this.percentage },
        themeColor: { value: new Color(energyColor).toArray() },
        noiseTex: {
          value: new TextureLoader().load('assets/images/noise.png'),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: BackSide, // 设置 DoubleSide 不生效
    });
    return material;
  }

  private play(blobsNum: number, colorStr: string) {
    const startOffSets = Array<number>();
    const stepLen = -0.8;
    for (let i = 0; i < blobsNum; ++i) {
      startOffSets.push(stepLen * i);
    }
    const marchingCubes = this.subEnergySphere;
    const subtract = 12;
    const strength = 1.2 / ((Math.sqrt(blobsNum) - 1) / 4 + 1);
    const centerX = 0.5;
    const centerZ = 0.5;
    const energyColor = new Color(colorStr);
    // ShaderMaterial
    const material = this.mainEnergyShaderMaterial;

    let prevTime = 0;
    animationManager.create('MetaBall', (time: number) => {
      // Delta Time
      const deltaTime = time - prevTime;
      prevTime = time;

      // Animation
      marchingCubes.reset();

      // 底部
      marchingCubes.addBall(centerX, 0, centerZ, strength, subtract, energyColor);
      marchingCubes.addPlaneY(2, 12);

      for (let i = 0; i < blobsNum; i++) {
        let ballY = startOffSets[i] + deltaTime / 1000;
        if (ballY > 1) {
          ballY = 0;
        }
        startOffSets[i] = ballY;
        marchingCubes.addBall(centerX, ballY, centerZ, strength, subtract, energyColor);
      }

      marchingCubes.update();

      // Update ShaderMaterial Uniforms
      const { electricQuantity, iTime } = material.uniforms;
      electricQuantity.value = this.percentage;
      iTime.value = time / 1000;
      material.needsUpdate = true;
    });
  }
}

// !!! 引入 ShaderChunk 解决 ShaderMaterial 在开启了 对数深度缓冲 后的，深度测试错误问题！
const vertexShader = `
  uniform float iTime;
  varying vec2 vUv;
  ${ShaderChunk.common}
  ${ShaderChunk.logdepthbuf_pars_vertex}

  void main() {
    vUv = uv;
    
    vec3 myPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(myPosition, 1.0);
    ${ShaderChunk.logdepthbuf_vertex}
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float iTime;
  uniform float electricQuantity;
  uniform vec3 themeColor;
  uniform sampler2D noiseTex;

  ${ShaderChunk.logdepthbuf_pars_fragment}

  #define amplitude (0.02)
 
  void main() {
    vec2 uv = vUv;

    vec2 dUV = uv + iTime / 10.0;
    dUV = fract(dUV);
    
    float percent = clamp(electricQuantity, 0.1, 1.0);
    float undulate = sin(uv.x * 25.0 + iTime * 2.5) * amplitude * 1.5;
    float smoothDivideLine = smoothstep(percent - amplitude, percent + amplitude,  uv.y + undulate);
    float noiseDivideLine = step(percent - amplitude, uv.y + undulate);
    float noiseCol = texture2D(noiseTex, dUV).r * step(dUV.y, noiseDivideLine);
    noiseCol *= noiseCol;
    float channelVal = 1.0 - smoothDivideLine;
    float mixAlpha = channelVal + noiseCol;
    vec3 color = mixAlpha * themeColor;

    gl_FragColor = vec4(color, clamp(mixAlpha, 0.0, 0.6));
    ${ShaderChunk.logdepthbuf_fragment}
  }
  `;

export { MetaBall };
