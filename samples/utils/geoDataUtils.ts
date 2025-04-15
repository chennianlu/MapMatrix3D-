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
 * @returns 转换后的数据或null（发生错误时）
 */
export function transformGeoJSON(worldData: any): GeoJSONData | null {
    try {
        if (!worldData || !worldData.features || !Array.isArray(worldData.features)) {
            console.error('无效的GeoJSON数据');
            return null;
        }

        let features = worldData.features;
        for (let i = 0; i < features.length; i++) {
            const element = features[i];

            if (!element.geometry) {
                console.warn(`第${i}个特征缺少geometry属性`);
                continue;
            }

            // 将Polygon处理跟MultiPolygon一样的数据结构
            if (element.geometry.type === 'Polygon') {
                element.geometry.coordinates = [element.geometry.coordinates];
            }
        }

        return worldData as GeoJSONData;
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