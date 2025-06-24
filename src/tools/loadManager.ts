import { loader } from './loader';
import { BaseObject3D } from '../objects/BaseObject3D';
import { BaseInitOptions } from '../types/init';

export class LoadManager {
  private static instance: LoadManager;
  private loadingQueue: Map<string, Promise<BaseObject3D>> = new Map();
  private retryTimes: Map<string, number> = new Map();
  private readonly maxRetryTimes = 3;
  private readonly retryDelay = 1000; // 重试延迟时间（毫秒）

  private constructor() {}

  static getInstance(): LoadManager {
    if (!LoadManager.instance) {
      LoadManager.instance = new LoadManager();
    }
    return LoadManager.instance;
  }

  async loadObject(object: BaseObject3D, options: BaseInitOptions): Promise<BaseObject3D> {
    const key = object.id.toString();
    
    // 如果已经在加载中，返回现有的 Promise
    const existingPromise = this.loadingQueue.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = this._loadWithRetry(object, options);
    this.loadingQueue.set(key, loadPromise);
    
    try {
      const result = await loadPromise;
      this.loadingQueue.delete(key);
      return result;
    } catch (error) {
      this.loadingQueue.delete(key);
      throw error;
    }
  }

  private async _loadWithRetry(object: BaseObject3D, options: BaseInitOptions): Promise<BaseObject3D> {
    const key = object.id.toString();
    let retryCount = this.retryTimes.get(key) || 0;

    while (retryCount < this.maxRetryTimes) {
      try {
        return await object.init(options);
      } catch (error) {
        retryCount++;
        this.retryTimes.set(key, retryCount);
        console.warn(`[${key}] 第 ${retryCount} 次重试加载`);
        
        if (retryCount >= this.maxRetryTimes) {
          throw new Error(`加载失败，已重试 ${this.maxRetryTimes} 次`);
        }
        
        // 等待一段时间后重试，重试间隔时间递增
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));
      }
    }
    
    throw new Error('加载失败，重试次数已用完');
  }

  async loadObjects(
    objects: BaseObject3D[], 
    options: BaseInitOptions, 
    onProgress?: (progress: number) => void
  ): Promise<BaseObject3D[]> {
    const total = objects.length;
    let loaded = 0;
    
    const results = await Promise.all(objects.map(async (object) => {
      try {
        const result = await this.loadObject(object, {
          ...options,
          onProgress: (progress: number) => {
            if (onProgress) {
              const totalProgress = (loaded + progress / 100) / total * 100;
              onProgress(totalProgress);
            }
          }
        });
        loaded++;
        return result;
      } catch (error) {
        console.error(`[${object.id}] 加载失败:`, error);
        return null;
      }
    }));
    
    return results.filter((result): result is BaseObject3D => result !== null);
  }

  // 清理加载队列和重试次数
  clear() {
    this.loadingQueue.clear();
    this.retryTimes.clear();
  }
}

export const loadManager = LoadManager.getInstance(); 