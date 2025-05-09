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

// 示例配置
export const darkConfig = {
  "background": {
    "backgroundColor": "#c5d3dd"
  },
  "fog": {
    "enabled": true,
    "type": "linear",
    "color": "#ffffff",
    "near": 1,
    "far": 100,
    "density": 0.1
  },
  "ground": {
    "groundColor": "#ffffff",
    "markColor": "#ffffff",
    "groundOpacity": 0.8
  },
  "material": {
    "topFaceColor": "#ffffff",
    "topFaceOpacity": 0.2,
    "sideFaceColor": "#ffffff",
    "sideFaceOpacity": 0.9
  },
  "light": {
    "glowColor": "#cedce3",
    "glowWidth": 2,
    "glowIntensity": 1,
    "glowFalloff": 1.8,
    "showLightPillars": false
  },
  "topLine": {
    "lineColor": "#f7f8f8",
    "lineOpacity": 0.2,
    "glowColor": "#9ed8f5",
    "glowOpacity": 2,
    "glowSpeed": 1,
    "speedFactor1": 1.8,
    "speedFactor2": 1,
    "speedFactor3": -1.2
  },
  "bottomLine": {
    "lineColor": "#f7f7f7",
    "lineOpacity": 1,
    "glowColor": "#00ffff",
    "glowOpacity": 1,
    "glowSpeed": 0,
    "speedFactor1": 1.5,
    "speedFactor2": 0.7,
    "speedFactor3": -1
  }
}

// 示例配置
export const lightConfig = {
  "background": {
    "backgroundColor": "#c5d3dd"
  },
  "fog": {
    "enabled": true,
    "type": "linear",
    "color": "#ffffff",
    "near": 1,
    "far": 100,
    "density": 0.1
  },
  "ground": {
    "groundColor": "#ffffff",
    "markColor": "#ffffff",
    "groundOpacity": 0.8
  },
  "material": {
    "topFaceColor": "#ffffff",
    "topFaceOpacity": 0.2,
    "sideFaceColor": "#ffffff",
    "sideFaceOpacity": 0.9
  },
  "light": {
    "glowColor": "#cedce3",
    "glowWidth": 2,
    "glowIntensity": 1,
    "glowFalloff": 1.8,
    "showLightPillars": false
  },
  "topLine": {
    "lineColor": "#f7f8f8",
    "lineOpacity": 0.2,
    "glowColor": "#9ed8f5",
    "glowOpacity": 2,
    "glowSpeed": 1,
    "speedFactor1": 1.8,
    "speedFactor2": 1,
    "speedFactor3": -1.2
  },
  "bottomLine": {
    "lineColor": "#f7f7f7",
    "lineOpacity": 1,
    "glowColor": "#00ffff",
    "glowOpacity": 1,
    "glowSpeed": 0,
    "speedFactor1": 1.5,
    "speedFactor2": 0.7,
    "speedFactor3": -1
  }
}

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
