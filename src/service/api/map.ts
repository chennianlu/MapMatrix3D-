import request from '../axios';

// 获取地图数据
export const getMapData = () => {
  return request.get({
    url: '/map/data'
  });
};

// 获取区域数据
export const getRegionData = (regionId: string) => {
  return request.get({
    url: `/map/region/${regionId}`
  });
};

// 获取区域分类
export const getRegionCategories = () => {
  return request.get({
    url: '/map/categories'
  });
};

// 创建区域分类
export const createRegionCategory = (data: { 
  parentId: string; 
  categoryName: string;
  sort: string;
}) => {
  return request.post({
    url: '/map/category/create',
    data
  });
};

// 更新区域分类
export const updateRegionCategory = (data: { 
  id: string; 
  categoryName: string;
  sort: string;
}) => {
  return request.post({
    url: '/map/category/update',
    data
  });
};

// 删除区域分类
export const deleteRegionCategory = (id: string) => {
  return request.post({
    url: '/map/category/delete',
    data: { id }
  });
}; 