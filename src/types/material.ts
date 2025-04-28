import { MeshBasicMaterial } from 'three';

export interface ExMaterial extends MeshBasicMaterial {
  uniforms?: any;
  color: THREE.Color;
  opacity: number;
  transparent: boolean;
  wireframe: boolean;
  needsUpdate: boolean;
  clone(): this;
} 