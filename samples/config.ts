/**
 * 地图配置文件
 * 用于管理省市区的映射关系
 */

export interface MapConfig {
  type: 'province' | 'city' | 'district';
  url: string;
}

export const mapConfig: Record<string, MapConfig> = {
  // 省份
  '福建': { type: 'province', url: './data/map/福建省.json' },
  '广东': { type: 'province', url: './data/map/广东省.json' },
  '四川': { type: 'province', url: './data/map/四川省.json' },
  
  // 城市
  '宁德市': { type: 'city', url: './data/map/宁德市.json' },
  '上海市': { type: 'city', url: './data/map/上海市.json' },
};

/**
 * 获取地图配置
 * @param name 地区名称
 * @returns 地图配置信息
 */
export const getMapConfig = (name: string): MapConfig | undefined => {
  return mapConfig[name];
};

/**
 * 获取所有省份配置
 * @returns 省份配置列表
 */
export const getProvinceConfigs = (): MapConfig[] => {
  return Object.entries(mapConfig)
    .filter(([_, config]) => config.type === 'province')
    .map(([_, config]) => config);
};

/**
 * 获取所有城市配置
 * @returns 城市配置列表
 */
export const getCityConfigs = (): MapConfig[] => {
  return Object.entries(mapConfig)
    .filter(([_, config]) => config.type === 'city')
    .map(([_, config]) => config);
};

/**
 * 获取所有区县配置
 * @returns 区县配置列表
 */
export const getDistrictConfigs = (): MapConfig[] => {
  return Object.entries(mapConfig)
    .filter(([_, config]) => config.type === 'district')
    .map(([_, config]) => config);
};
