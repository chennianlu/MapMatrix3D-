/**
 * @file 地理数据处理工具
 * @description 提供GeoJSON数据处理和转换的功能。
 * 该工具主要用于处理和标准化GeoJSON格式的地理数据，
 * 确保数据结构一致性，便于地图渲染和地理特征的处理。
 * 
 * 主要功能：
 * - 转换和标准化GeoJSON数据(transformGeoJSON)
 * - 处理道路网络数据(transformGeoRoad)
 * - 定义地理数据相关的类型接口
 */

/**
 * GeoJSON特征类型
 */
export interface GeoJSONFeature {
    geometry: {
        type: string;
        coordinates: any[][][] | any[][] | any[];
    };
    properties?: any;
    [key: string]: any;
}

// 官方网站：https://geojson.org/
// 标准文档：https://datatracker.ietf.org/doc/html/rfc7946
// https://geojson.cn/docs/ref/geojson

const testGeoJSON = {
	"type": "FeatureCollection",
	"features": [{
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [125.6, 10.1]
		},
		"properties": {
			"name": "Dinagat Islands"
		}
	}]
}

/**
 * GeoJSON数据类型
 */
export interface GeoJSONData {
    features: GeoJSONFeature[];
    [key: string]: any;
}

/**
 * 转换geoJson数据,将单个数组转为多维数组
 * @param worldData geo数据
 * @param scaleFactor 缩放因子，可选参数，默认为1
 * @returns 转换后的数据或null（发生错误时）
 */
export function transformGeoJSON(worldData: any, scaleFactor: number = 1): GeoJSONData | null {
    try {
        if (!worldData || !worldData.features || !Array.isArray(worldData.features)) {
            console.error('无效的GeoJSON数据');
            return null;
        }

        // 深拷贝原始数据
        const result = JSON.parse(JSON.stringify(worldData));

        // 如果scaleFactor不为1，进行缩放处理
        if (scaleFactor !== 1) {
            // 提取所有坐标点计算中心点
            const allCoords: number[][] = [];
            const extractCoords = (arr: any[]) => {
                if (Array.isArray(arr[0])) {
                    arr.forEach(extractCoords);
                } else {
                    allCoords.push(arr);
                }
            };
            
            result.features.forEach((feature: GeoJSONFeature) => {
                extractCoords(feature.geometry.coordinates);
            });
            
            // 计算几何中心
            const [centerX, centerY] = calculateGeoCentroid(allCoords);
            
            // 坐标点缩放函数
            const scalePoint = (point: number[]): number[] => {
                const [x, y] = point;
                return [
                    centerX + (x - centerX) * scaleFactor,
                    centerY + (y - centerY) * scaleFactor
                ];
            };
            
            // 递归处理坐标
            const processCoordinates = (arr: any[]): any[] => {
                if (Array.isArray(arr[0])) {
                    return arr.map(processCoordinates);
                }
                return scalePoint(arr);
            };
            
            // 应用缩放
            result.features.forEach((feature: GeoJSONFeature) => {
                // 处理geometry坐标
                feature.geometry.coordinates = processCoordinates(feature.geometry.coordinates);
                
                // 处理properties中的centroid和center
                if (feature.properties) {
                    if (feature.properties.centroid) {
                        feature.properties.centroid = scalePoint(feature.properties.centroid);
                    }
                    if (feature.properties.center) {
                        feature.properties.center = scalePoint(feature.properties.center);
                    }
                }
            });
        }

        // 将Polygon处理跟MultiPolygon一样的数据结构
        result.features.forEach((feature: GeoJSONFeature) => {
            if (!feature.geometry) {
                console.warn(`特征缺少geometry属性`);
                return;
            }

            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates = [feature.geometry.coordinates];
            }
        });

        return result as GeoJSONData;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`转换GeoJSON数据失败: ${errorMessage}`);
        return null;
    }
}

/**
 * 转换路网数据，跟世界数据保持一致的格式
 * @param roadData 路网数据
 * @returns 转换后的路网数据
 */
export function transformGeoRoad(roadData: any): GeoJSONData {
    if (!roadData || !roadData.features || !Array.isArray(roadData.features)) {
        console.error('无效的路网数据');
        return roadData;
    }

    let features = roadData.features;
    for (let i = 0; i < features.length; i++) {
        const element = features[i];
        if (!element.geometry) {
            console.warn(`第${i}个路网特征缺少geometry属性`);
            continue;
        }

        // LineString处理跟MultiLineString一样的数据结构
        if (element.geometry.type === 'LineString') {
            element.geometry.coordinates = [[element.geometry.coordinates]];
        } else {
            element.geometry.coordinates = [element.geometry.coordinates];
        }
    }

    return roadData as GeoJSONData;
}

/**
 * 计算GeoJSON数据的几何中心
 * @param coordinates GeoJSON坐标数组
 * @returns 中心点坐标 [x, y]
 */
function calculateGeoCentroid(coordinates: any[]): [number, number] {
    const allPoints: number[][] = [];
    
    // 递归提取所有坐标点
    const extractPoints = (arr: any[]) => {
        if (Array.isArray(arr[0])) {
            arr.forEach(extractPoints);
        } else {
            allPoints.push(arr);
        }
    };
    
    extractPoints(coordinates);
    
    // 计算中心点
    const sum = allPoints.reduce((acc, [x, y]) => {
        acc.x += x;
        acc.y += y;
        return acc;
    }, { x: 0, y: 0 });
    
    return [
        sum.x / allPoints.length,
        sum.y / allPoints.length
    ];
}

/**
 * GeoJSON数据缩放函数
 * @param geojson GeoJSON数据
 * @param scaleFactor 缩放因子
 * @returns 缩放后的GeoJSON数据
 */
export function scaleGeoJSON(geojson: GeoJSONData, scaleFactor: number): GeoJSONData {
    // 深拷贝原始数据
    const result = JSON.parse(JSON.stringify(geojson));
    
    // 提取所有坐标点计算中心点
    const allCoords: number[][] = [];
    const extractCoords = (arr: any[]) => {
        if (Array.isArray(arr[0])) {
            arr.forEach(extractCoords);
        } else {
            allCoords.push(arr);
        }
    };
    
    result.features.forEach((feature: GeoJSONFeature) => {
        extractCoords(feature.geometry.coordinates);
    });
    
    // 计算几何中心
    const [centerX, centerY] = calculateGeoCentroid(allCoords);
    
    // 坐标点缩放函数
    const scalePoint = (point: number[]): number[] => {
        const [x, y] = point;
        return [
            centerX + (x - centerX) * scaleFactor,
            centerY + (y - centerY) * scaleFactor
        ];
    };
    
    // 递归处理坐标
    const processCoordinates = (arr: any[]): any[] => {
        if (Array.isArray(arr[0])) {
            return arr.map(processCoordinates);
        }
        return scalePoint(arr);
    };
    
    // 应用缩放
    result.features.forEach((feature: GeoJSONFeature) => {
        feature.geometry.coordinates = processCoordinates(feature.geometry.coordinates);
    });
    
    return result;
}

/**
 * 坐标点缩放函数（保留原有功能）
 * @param points 二维坐标数组
 * @param scaleFactor 缩放因子
 * @returns 缩放后的坐标数组
 */
export function scalePoints(points: any[], scaleFactor: number) {
    // 防御性编程：确保输入合法性
    if (!Array.isArray(points) || points.length === 0) {
        throw new Error('Invalid points format: expected non-empty array');
    }
    
    // 深拷贝原数组避免污染原始数据
    return points.map(point => {
        if (!Array.isArray(point) || point.length !== 2) {
            throw new Error('Invalid point format: expected [x, y]');
        }
        
        // 使用 Number 转换确保数字类型
        const x = Number(point[0]) * scaleFactor;
        const y = Number(point[1]) * scaleFactor;
        
        return [x, y];
    });
}
  
//   /* 使用示例 */
//   const originalPoints = [
//     [1, 1],
//     [2, 1],
//     [2, 2],
//     [1, 2]
//   ];
  
//   // 放大10倍
//   const scaledPoints = scalePoints(originalPoints, 10);
  
//   console.log('原始坐标:', originalPoints);
//   console.log('放大后坐标:', scaledPoints);
  