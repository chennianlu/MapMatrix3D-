import * as THREE from 'three';
import { MeshObject3D } from '../../MeshObject3D';
import { BaseInitOptions } from '../../BaseObject3D';
import { animationManager } from '../../../managers/animationManager';
import { loader } from '../../../tools/loader';

export interface GroundParams extends BaseInitOptions {
  visible?: boolean;
  radius?: number;
  markUrl?: string;
  markColor?: string;
  groundUrl?: string;
  groundColor?: string;
  animation?: boolean;
  groundOpacity?: number;
}

export class EffectGround extends MeshObject3D {
  declare geometry: any;
  radius: number;
  hemisphere: boolean;
  constructor(options: GroundParams) {
    super();
    const {
      radius,
      markUrl,
      groundUrl,
      markColor = '#018cff',
      groundColor = '#018cff',
      animation = true,
      groundOpacity = 0.7,
    } = options;
    let lighTexture, code_default;
    // TODO  路径问题
    loader.loadTexture(markUrl).then(tex => {
      lighTexture = tex;
      lighTexture.wrapS = lighTexture.wrapT = THREE.RepeatWrapping;
      loader.loadTexture(groundUrl).then(tex => {
        code_default = tex;
        code_default.wrapS = code_default.wrapT = THREE.RepeatWrapping;
        const defaultGroundShader = {
          uniforms: {
            color: { value: new THREE.Color(markColor) },
            fadeDistance: { value: radius * 0.5 },
            fadeStrength: { value: 2.0 },

            opacity: {
              value: 0.7,
            },
            map: {
              value: code_default,
            },
            time: { value: 0 },
            alpha: { value: groundOpacity },
            repeatFactor: { value: radius * 0.5 },
            maskMap: {
              value: lighTexture,
            },
            glowFactor: { value: 2.3 },
            speed: { value: 0.2 },
            flowColor: { value: new THREE.Color(groundColor) },
          },

          vertexShader: `
                        uniform float repeatFactor;
                        varying vec4 worldPosition;
                        varying vec3 localPosition;
                        uniform float fadeDistance;
        
                        varying vec2 vUv;
                        varying vec2 mapUv;
                            
                        void main() {
                            localPosition = position.xzy;
                            worldPosition =  vec4(localPosition, 1.0);
        
        
        
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                                
                            vUv= uv;
                            mapUv=uv*repeatFactor;
                        }
                    `,

          fragmentShader: `
                        varying vec2 vUv;
                        varying vec2 mapUv;
                        varying vec4 worldPosition;
        
                        uniform sampler2D map;
                        uniform sampler2D maskMap;
                        uniform float time;
                        uniform float opacity;
                        uniform float alpha;
                        uniform vec3 color;
                        uniform vec3 flowColor;
                        uniform float glowFactor;
                        uniform float speed;
                        uniform vec3 worldCamProjPosition;
                        uniform float fadeDistance;
                        uniform float fadeStrength;
        
                        void main() {
                            float t=mod(time*speed*1.,1.);
                            vec2 uv=abs((vUv-vec2(0.5))*2.0);
                            float dis = length(uv);
                            float r = t-dis;
                            vec4 col=texture2D( map, mapUv );
                            vec3 finalCol;
                            vec4 mask = texture2D(maskMap, vec2(0.5,r));
                            finalCol = mix(color,flowColor,clamp(0.,1.,mask.a*glowFactor));
                            
                            float dist = distance(worldCamProjPosition, worldPosition.xyz);
                            float d = 1.0 - min(dist / fadeDistance, 1.0);
        
                            gl_FragColor= vec4(finalCol.rgb,(alpha+mask.a*glowFactor)*col.a*(1.-dis)*pow(d, fadeStrength));
                        }
               `,
        };
        const material = new THREE.ShaderMaterial({
          uniforms: defaultGroundShader.uniforms,
          vertexShader: defaultGroundShader.vertexShader,
          fragmentShader: defaultGroundShader.fragmentShader,
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
        });

        this.geometry = new THREE.PlaneGeometry(radius, radius);
        this.geometry.center();
        this.geometry.rotateX(Math.PI / 2);
        this.material = material;
        // this.material.blending = THREE.CustomBlending;
        if (animation) this.playRotation();
        this._model = this;
      });
    });
  }

  /**
   * 播放默认旋转动画
   * @returns
   */
  playRotation() {
    const _this = this;
    let time = 0;

    const animation = (_, delta: any) => {
      time += delta;
      _this.material.uniforms.time.value = time;
    };
    animationManager.create('EffectGround_Animation' + this.uuid, animation);
  }
}
