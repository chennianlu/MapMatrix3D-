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
    this.textureLoader.setPath(this._publicResourcePath);

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

  async loadOriginGLTF(uri: string, useCache: boolean = true) {
    const modelBlob = useCache ? await this.browserCache.get<Blob>(uri) : null;
    if (modelBlob) {
      uri = URL.createObjectURL(modelBlob);
    }
    return new Promise<GLTF>((resolve, reject) => {
      this.gltfLoader.load(
        uri,
        gltf => {
          resolve(gltf);
        },
        progressEvent => {
          //加载进度
        },
        errorEvent => {
          console.warn('资源初始化失败：' + uri);
          reject(false);
        }
      );
    });
  }

  async loadGLTF(url: string, path?: string): Promise<THREE.Object3D> {
    const _this = this;
    const uri = (path ?? '') + url;
    const cacheMesh = _this.modelCache.get(uri);

    const objHasMesh = (object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) return true;
      if (object instanceof THREE.Object3D) {
        const children = object.children;
        for (let i = 0; i < children.length; i++) {
          if (children[i] instanceof THREE.Mesh) {
            return true;
          }
        }
      }
      return false;
    };

    return new Promise(function (resolve, reject) {
      if (cacheMesh) {
        //TODO  模型本身的材质怎么处理
        resolve(cacheMesh.clone());
      }
      try {
        _this.loadOriginGLTF(uri).then(gltf => {
          let getNeedFlag = false;
          let node: any = gltf.scene;
          node.traverse(cur => {
            const hasMesh = objHasMesh(cur);
            if (getNeedFlag === false && hasMesh) {
              getNeedFlag = true;
              node = cur;
            }
            //开启深度检测
            if (cur instanceof THREE.Mesh) {
              cur.material.depthTest = true;
              cur.material.depthWrite = true;
            }
          });
          _this.modelCache.set(uri, node);

          resolve(node);
        });
      } catch (error) {
        console.warn('资源初始化失败：' + path + url);
        reject(false);
      }
    });
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
