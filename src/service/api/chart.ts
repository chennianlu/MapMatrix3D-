import request from '../axios';

// 获取能源消耗趋势
export const getEnergyConsumption = (params: { startDate: string; endDate: string }) => {
  return request.get({
    url: '/chart/energy-consumption',
    params
  });
};

// 获取能源结构分布
export const getEnergyStructure = () => {
  return request.get({
    url: '/chart/energy-structure'
  });
};

// 获取区域能源对比
export const getRegionComparison = () => {
  return request.get({
    url: '/chart/region-comparison'
  });
};

// 获取能源效率分析
export const getEnergyEfficiency = () => {
  return request.get({
    url: '/chart/energy-efficiency'
  });
};

// 获取碳排放趋势
export const getCarbonEmission = (params: { startDate: string; endDate: string }) => {
  return request.get({
    url: '/chart/carbon-emission',
    params
  });
};

// 获取能源消耗排名
export const getEnergyRanking = () => {
  return request.get({
    url: '/chart/energy-ranking'
  });
};

// 获取能源结构预测
export const getEnergyForecast = () => {
  return request.get({
    url: '/chart/energy-forecast'
  });
}; 