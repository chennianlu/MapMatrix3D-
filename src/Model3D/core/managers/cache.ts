/**
 * @description 缓存区，主要针对资源类文件缓存，例如材贴图、模型等；兼顾3D可复用类对象存储，例如geometry、material
 * @author cnl
 * Map（hash表实现）对比Object性能优势：
 * 1、插入性能：随着数据量增大，Map插值速度优于Object，因为Object内存分类和处理开销较大，而Map结构使用哈希表
 * 2、查找性能：基本相似，特殊情况下，当查找键值在数据结构下不存在时，Map优于Object，Map结构在内部通过哈希表可以快速定位空槽，而Object需要原型链查找
 * 3、删除性能：同查找，Map更优
 * 4、遍历性能： Map哈希表结构可以保证遍历顺序与插入顺序相同，且Map内置迭代器可以直接使用for...of；而Object本质是无序的（特殊情况：当object key为有序数值时）
 * 内存方面：因为Map键值对特点，大约比Object多存贮50%的键值对
 */

class Cache {
  cache: Map<string, Map<string, any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * 根据类型注册缓存区
   * @param type
   * @returns
   */
  registerCache(type: string): Map<string, any> {
    let storage = this.cache.get(type);
    if (storage) {
      console.warn(`type ${type} has been registered`);
    } else {
      storage = new Map();
      this.cache.set(type, storage);
    }
    return storage;
  }

  /**
   * 根据类型获取缓存对象
   * @param type
   * @returns
   */
  getCache(type: string) {
    return this.cache.get(type);
  }

  /**
   * 根据类型清空缓存区
   * @param type
   */
  clear(type: string) {
    this.cache.delete(type);
  }
}

export default new Cache();
