import {
  Clock,
  Color,
  Matrix4,
  RepeatWrapping,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector4,
} from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { loader } from '../tools/loader';
import { MeshObject3D } from './MeshObject3D';

export interface WaterPlaneInit {
  color?: number | string;
  textureWidth?: number;
  textureHeight?: number;
  clipBias?: number;
  reflectivity?: number;
  uvScale?: number;
  opacity?: number;
  roughTexture?: string;
}

class WaterPlane extends MeshObject3D {
  isWater: boolean;
  public override readonly type: string = 'WaterPlane';

  constructor(geometry, options: WaterPlaneInit) {
    super(geometry);

    this.isWater = true;
    const defaultOption = {
      color: 0xffffff,
      textureWidth: 512,
      textureHeight: 512,
      clipBias: 0,
      opacity: 1,
      reflectivity: 0.02,
      uvScale: 1,
      roughTexture: '/images/t_floor_normal.webp',
    };
    const initOption = Object.assign({}, defaultOption, options);
    let {
      color,
      textureWidth,
      textureHeight,
      clipBias,
      reflectivity,
      uvScale,
      opacity,
      roughTexture,
    } = initOption;

    const scope = this;
    const shader = WaterPlane.WaterShader;
    const textureMatrix = new Matrix4();

    let normalMap;
    loader.loadTexture(roughTexture).then(tex => {
      normalMap = tex;
      normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
      // material

      this.material = new ShaderMaterial({
        uniforms: UniformsUtils.merge([UniformsLib['fog'], shader.uniforms]),
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: true,
        fog: true,
      });

      // maps

      this.material.uniforms['tReflectionMap'].value = reflector.getRenderTarget().texture;
      this.material.uniforms['tNormalMap'].value = normalMap;

      // water
      this.material.uniforms['opacity'].value = opacity;

      this.material.uniforms['color'].value = new Color(color);
      this.material.uniforms['reflectivity'].value = reflectivity;
      this.material.uniforms['textureMatrix'].value = textureMatrix;

      // inital values
      const cycle = 0.15; // a cycle of a flow map phase
      const halfCycle = cycle * 0.5;
      this.material.uniforms['config'].value.x = 0; // flowMapOffset0
      this.material.uniforms['config'].value.y = halfCycle; // flowMapOffset1
      this.material.uniforms['config'].value.z = halfCycle; // halfCycle
      this.material.uniforms['config'].value.w = uvScale; // scale

      this.rotation.x = Math.PI * -0.5;
      //

      this.onBeforeRender = function (renderer, scene, camera) {
        updateTextureMatrix(camera);

        scope.visible = false;

        reflector.matrixWorld.copy(scope.matrixWorld);

        reflector.onBeforeRender(renderer, scene, camera, undefined, undefined, undefined);

        scope.visible = true;
      };
    });

    // internal components

    if (Reflector === undefined) {
      console.error('THREE.Water: Required component Reflector not found.');
      return;
    }

    const reflector = new Reflector(geometry, {
      textureWidth: textureWidth,
      textureHeight: textureHeight,
      clipBias: clipBias,
    });

    reflector.matrixAutoUpdate = false;

    // functions

    function updateTextureMatrix(camera) {
      textureMatrix.set(
        0.5,
        0.0,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        0.0,
        0.0,
        0.0,
        1.0
      );

      textureMatrix.multiply(camera.projectionMatrix);
      textureMatrix.multiply(camera.matrixWorldInverse);
      textureMatrix.multiply(scope.matrixWorld);
    }
  }

  static WaterShader = {
    uniforms: {
      color: {
        type: 'c',
        value: null,
      },
      opacity: {
        type: 'f',
        value: 1.0,
      },
      reflectivity: {
        type: 'f',
        value: 0,
      },

      tReflectionMap: {
        type: 't',
        value: null,
      },

      tNormalMap: {
        type: 't',
        value: null,
      },

      textureMatrix: {
        type: 'm4',
        value: null,
      },

      config: {
        type: 'v4',
        value: new Vector4(),
      },
    },

    vertexShader: /* glsl */ `
    
            #include <common>
            #include <fog_pars_vertex>
            #include <logdepthbuf_pars_vertex>
    
            uniform mat4 textureMatrix;
    
            varying vec4 vCoord;
            varying vec2 vUv;
            varying vec3 vToEye;
    
            void main() {
    
                vUv = uv;
                vCoord = textureMatrix * vec4( position, 1.0 );
    
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vToEye = cameraPosition - worldPosition.xyz;
    
                vec4 mvPosition =  viewMatrix * worldPosition; // used in fog_vertex
                gl_Position = projectionMatrix * mvPosition;
    
                #include <logdepthbuf_vertex>
                #include <fog_vertex>
    
            }`,

    fragmentShader: /* glsl */ `
    
            #include <common>
            #include <fog_pars_fragment>
            #include <logdepthbuf_pars_fragment>
    
            uniform sampler2D tReflectionMap;
            uniform sampler2D tNormalMap;

    
            uniform vec3 color;
            uniform float opacity;

            uniform float reflectivity;
            uniform vec4 config;
    
            varying vec4 vCoord;
            varying vec2 vUv;
            varying vec3 vToEye;
    
            void main() {
    
                #include <logdepthbuf_fragment>
    
                float scale = config.w;
    
                vec3 toEye = normalize( vToEye );
    
                // sample normal maps (distort uvs with flowdata)
                vec4 normalColor = texture2D( tNormalMap, ( vUv * scale ) );
    
    
                // calculate normal vector
                vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
    
                // calculate the fresnel term to blend reflection and refraction maps==
                float theta = max( dot( toEye, normal ), 0.0 );
                float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );
    
                // calculate final uv coords
                vec3 coord = vCoord.xyz / vCoord.w;
                vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
    
                vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
    
                // multiply water color with the mix of both textures
                gl_FragColor = mix(vec4( color, opacity ) , reflectColor, reflectance );
                #include <tonemapping_fragment>
                // #include <colorspace_fragment>
                gl_FragColor = linearToOutputTexel( gl_FragColor );
                #include <fog_fragment>
    
            }`,
  };
}

export { WaterPlane };
