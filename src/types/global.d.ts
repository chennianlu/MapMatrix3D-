type GeometryType =
  | 'plane'
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'annulus'
  | 'circularRing'
  | 'icosahedron';
type ColorRGB = { r: number; g: number; b: number };

type Array2 = [number, number];
type Array3 = [number, number, number];
type Array4 = [number, number, number, number];
interface AABB {
  width: number;
  height: number;
  depth: number;
  center: Array<number>;
}
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.gltf';
declare module '*.tiff';
declare module '*.glb';
declare module '*.glsl';

interface EventDispatcher {
  on: () => any;
}

type Func = (...args: any[]) => any;
