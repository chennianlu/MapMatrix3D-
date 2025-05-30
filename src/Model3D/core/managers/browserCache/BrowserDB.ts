/**
 * @format
 */

interface BrowserDBOptions {
  name: string;
  version: number;
  storeName: string;
  keyPath: string;
}

const DEFAULT_OPTION: BrowserDBOptions = {
  name: 'cache',
  version: 1,
  storeName: 'model',
  keyPath: 'name',
};

class BrowserDB {
  static instance: BrowserDB;
  private global: Window;
  private options: BrowserDBOptions;

  private db: IDBDatabase | null;

  private constructor(options?: BrowserDBOptions) {
    this.options = Object.assign({}, DEFAULT_OPTION, options);
    this.open();
  }

  static getInstance(options?: BrowserDBOptions) {
    if (!this.instance) {
      this.instance = new BrowserDB(options);
    }
    return this.instance;
  }

  private open() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
      }
      const { name, version, storeName, keyPath } = this.options;
      const DBOpenRequest = indexedDB.open(name, version);
      DBOpenRequest.onsuccess = () => {
        this.db = DBOpenRequest.result;
        resolve(this.db);
      };
      DBOpenRequest.onupgradeneeded = () => {
        const db = DBOpenRequest.result;
        this.db = db;

        db.createObjectStore(storeName, { keyPath });
        resolve(this.db);
      };
      DBOpenRequest.onerror = () => {
        console.error('创建/升级数据库失败');
        reject(false);
      };
    });
  }

  close() {
    if (!this.db) {
      console.warn('不存在打开的数据库');
      return;
    }
    this.db.close();
    this.db = null;
  }

  /**
   * 获取缓存资源
   */
  public async get<T = unknown>(name: string): Promise<T> {
    if (!this.db) this.db = await this.open();
    return new Promise(resolve => {
      const { storeName } = this.options;
      try {
        const store = this.db.transaction(storeName, 'readonly').objectStore(storeName);
        const gltf = store.get(name);
        gltf.onsuccess = event => {
          const data = (gltf as IDBRequest<{ data?: T }>)?.result?.data;
          resolve(data);
        };
        gltf.onerror = ev => {
          console.warn('数据获取失败');
          resolve(null);
        };
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    });
  }

  /**
   * 批量设置缓存资源
   */
  public async setData<T = unknown>(data: [string, T][]) {
    if (!this.db) this.db = await this.open();
    const { storeName } = this.options;
    const trans = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
    for (const [name, resource] of data) {
      trans.put({ name, data: resource });
    }
    return true;
  }

  public delete() {
    const result = this.global.indexedDB.deleteDatabase(this.options.name);
    result.onerror = err => {
      console.error(err);
    };
  }
}

export const browserCache = BrowserDB.getInstance();
