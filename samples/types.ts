import * as THREE from 'three';

export interface ProvinceData {
  features: Array<{
    geometry: {
      coordinates: number[][][][];
    };
    properties: {
      name: string;
      centroid?: [number, number];
      center?: [number, number];
    };
  }>;
}

export interface BoundingBox {
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export interface SequenceFrameConfig {
  image: string;
  width: number;
  height: number;
  frame: number;
  column: number;
  row: number;
  speed: number;
}

export interface SequenceFrameMesh extends THREE.Mesh {
  updateSequenceFrame: (time?: number) => void;
  speed?: number;
  bottomY?: number;
  topY?: number;
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
  lifecycle?: number;
  maxLifecycle?: number;
  startX?: number;
  startY?: number;
}

// 定义CSS2DObject的扩展接口
export interface CSS2DObjectExtended extends THREE.Object3D {
  show: (text: string, position: THREE.Vector3) => void;
} 