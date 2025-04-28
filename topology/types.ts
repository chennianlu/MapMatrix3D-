// TopoJSON 基础类型定义
export interface TopoJSONObject {
  type: 'Topology';
  objects: {
    [key: string]: TopoJSONGeometryObject;
  };
  arcs: number[][][];
  bbox?: number[];
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

// TopoJSON 几何对象类型
export interface TopoJSONGeometryObject {
  type: 'GeometryCollection' | 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';
  id?: string | number;
  properties?: Record<string, any>;
  geometries?: TopoJSONGeometryObject[];
  coordinates?: any;
  arcs?: number[] | number[][] | number[][][];
}

// 解析后的数据格式
export interface ResolvedTopoData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
    properties: {
      name: string;
      adcode?: string;
      level?: 'province' | 'city' | 'district';
      centroid?: [number, number];
      center?: [number, number];
      [key: string]: any;
    };
  }>;
  bbox?: number[];
} 