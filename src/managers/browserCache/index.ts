/**
 * @format
 */

export * from './BrowserDB';

/**
 * 预加载给定的列表资源到浏览器缓存
 * @param model path 或者 path[]
 * @returns 操作结果
 */
export const preloadModelToBrowserCache = async (model: string | string[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof model === 'string') {
      model = [model];
    }
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.postMessage(model);
    worker.onerror = e => {
      reject(false);
    };
    worker.onmessage = e => {
      resolve(true);
    };
  });
};
