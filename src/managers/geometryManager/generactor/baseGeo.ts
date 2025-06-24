import * as THREE from 'three';
import { GeneratorSTL } from '../generator';

/**
 * 基本几何体生成器
 */
export default class BaseGeo {
  public type: string;

  public points: Array<THREE.Vector3>;
  public lines: number[][];
  public faces: number[][];
  public triangles: number[][][];
  public faceNormals: Array<THREE.Vector3> | undefined;
  public facePointNormalShareFaceIndexes: Array<Array<number>> | undefined;

  public geometry: THREE.BufferGeometry | null;
  protected threshold: number;
  private generator: GeneratorSTL;

  constructor(
    options: {
      threshold?: number | undefined;
      points?: Array<THREE.Vector3>;
      faces?: Array<Array<number>>;
    } = {}
  ) {
    this.type = 'baseGeo';
    this.threshold = options.threshold || 40;
    this.points = options.points || [];
    this.faces = options.faces || [];
    this.geometry = null;
    this.generator = new GeneratorSTL();
  }

  generate() {
    const result = this.generator.generate({
      points: this.points,
      faces: this.faces,
      threshold: this.threshold,
    });
    //@ts-ignore
    result.geometry.type = this.type;
    this.geometry = result.geometry;
    this.lines = result.lines;
    this.triangles = result.triangles;
    this.faceNormals = result.faceNormals;
    this.facePointNormalShareFaceIndexes = result.facePointNormalShareFaceIndexes;
  }
}
