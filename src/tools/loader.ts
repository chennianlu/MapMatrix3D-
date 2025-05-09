/**
 * @format
 */
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import cache from '../managers/cache';

import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { browserCache } from '../managers/browserCache';

/**
 * 模型加载模块
 */
class Loader {
  //公共资源路径
  private _publicResourcePath: string;
  public gltfLoader: GLTFLoader;
  public textureLoader: THREE.TextureLoader;
  public HDRtextureLoader: RGBELoader;
  public HDRCubetextureLoader: HDRCubeTextureLoader;
  public cubeTextureLoader: THREE.CubeTextureLoader;
  public fileLoader: THREE.FileLoader;

  public modelCache: Map<string, any>;
  public browserCache: typeof browserCache;
  public textureCache: Map<string, any>;
  public dracoLoader: DRACOLoader;

  constructor() {
    this._publicResourcePath = '/public3D-resource';
    this.modelCache = cache.registerCache('Model');
    this.textureCache = cache.registerCache('Texture');
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();

    this.dracoLoader.setDecoderPath(this._publicResourcePath + 'draco-gltf');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.textureLoader = new THREE.TextureLoader();
    // this.textureLoader.setPath(this._publicResourcePath);

    this.HDRtextureLoader = new RGBELoader();
    this.HDRtextureLoader.setPath(this._publicResourcePath);

    this.HDRCubetextureLoader = new HDRCubeTextureLoader();

    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.fileLoader = new THREE.FileLoader();
    this.browserCache = browserCache;
  }

  set publicResourcePath(path: string) {
    this._publicResourcePath = path;
    this.textureLoader.setPath(this._publicResourcePath);
    this.HDRtextureLoader.setPath(this._publicResourcePath);

    this.dracoLoader.setDecoderPath(this._publicResourcePath + 'draco-gltf');
  }

  get publicResourcePath() {
    return this._publicResourcePath;
  }

  async loadOriginGLTF(uri: string, onProgress?: (progress: number) => void) {
    try {
      console.log('loader loadOriginGLTF start:', uri);
      const gltf = await this.gltfLoader.loadAsync(uri, (event) => {
        if (onProgress && event.total) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
      if (!gltf) {
        console.error('loader loadOriginGLTF: gltf is null');
        throw new Error('GLTF 加载失败');
      }
      console.log('loader loadOriginGLTF completed:', uri);
      return gltf;
    } catch (error) {
      console.error('loader loadOriginGLTF failed:', uri, error);
      throw error;
    }
  }

  async loadGLTF(uri: string, onProgress?: (progress: number) => void) {
    try {
      console.log('loader loadGLTF start:', uri);
      const gltf = await this.loadOriginGLTF(uri, onProgress);
      if (!gltf || !gltf.scene) {
        console.error('loader loadGLTF: gltf or scene is null');
        return null;
      }

      console.log('loader loadGLTF gltf loaded:', uri, gltf);
      const model = gltf.scene;
      model.traverse((node: any) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.transparent = true;
            node.material.depthWrite = false;
          }
        }
      });

      console.log('loader loadGLTF completed:', uri);
      return model;
    } catch (error) {
      console.error('loader loadGLTF failed:', uri, error);
      throw error;
    }
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    const _this = this;
    const cache = _this.textureCache.get(url);

    return new Promise(function (resolve) {
      if (cache) {
        resolve(cache.clone());
        return;
      }
      _this.textureLoader.load(url, function (texture) {
        _this.textureCache.set(url, texture);
        resolve(texture);
      });
    });
  }

  async loadHDRTexture(url: string): Promise<THREE.Texture> {
    const _this = this;
    const cache = _this.textureCache.get(url);

    return new Promise(function (resolve) {
      if (cache) {
        resolve(cache);
        return;
      }
      _this.HDRtextureLoader.loadAsync(url).then(texture => {
        _this.textureCache.set(url, texture);
        resolve(texture);
      });
    });
  }

  async loadHDRCubeTexture(url: string): Promise<THREE.Texture> {
    const _this = this;
    const cache = _this.textureCache.get(url);
    const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];

    return new Promise(function (resolve) {
      if (cache) {
        resolve(cache);
        return;
      }
      _this.HDRCubetextureLoader.setPath(_this._publicResourcePath + url).load(
        hdrUrls,
        function (hdrCubeMap) {
          _this.textureCache.set(url, hdrCubeMap);
          resolve(hdrCubeMap);
        }
      );
    });
  }

  async loadCubeTexture(url: string): Promise<THREE.Texture> {
    const _this = this;
    const cache = _this.textureCache.get(url);
    const ldrUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];

    return new Promise(function (resolve) {
      if (cache) {
        resolve(cache);
        return;
      }
      _this.cubeTextureLoader
        .setPath(_this._publicResourcePath + url)
        .load(ldrUrls, function (ldrCubeMap) {
          _this.textureCache.set(url, ldrCubeMap);
          resolve(ldrCubeMap);
        });
    });
  }

  /**
   * 请求数据方法
   * @param {string} url 请求地址
   * @param {Function} onProgress 进度回调函数，参数为0-100的进度值
   * @returns {Promise<any>} 返回数据或null（发生错误时）
   */
  async requestData(url: string, onProgress?: (progress: number) => void): Promise<any> {
    try {
      // 设置响应类型
      this.fileLoader.setResponseType('text');

      // 请求数据
      const data = await this.fileLoader.loadAsync(url, (event) => {
        const { loaded, total } = event;
        const progressValue = total ? Math.floor((loaded / total) * 100) : 0;
        if (onProgress) {
          onProgress(progressValue);
        }
      });

      if (!data) {
        console.error(`从 ${url} 加载的数据为空`);
        return null;
      }

      try {
        // 尝试将数据转换为JSON对象
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        return jsonData;
      } catch (parseError: unknown) {
        console.error(`解析JSON数据失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        // 如果解析失败，返回原始数据
        return data;
      }
    } catch (error: unknown) {
      console.error(`请求数据失败: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}
export const loader = new Loader();
