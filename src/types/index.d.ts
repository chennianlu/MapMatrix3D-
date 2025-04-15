import { BaseObject3D } from '../objects/BaseObject3D';
import { MeshObject3D } from '../objects/MeshObject3D';
import { GeometryObject3D } from '../objects/GeometryObject3D';
import { SpriteObject3D } from '../objects/SpriteObject3D';
import { WaterPlane } from '../objects/WaterPlane';
import { Pyramid } from '../objects/EffectObject3D/Pyramid';
import { Shield } from '../objects/EffectObject3D/Shield';
import { EffectGround } from '../objects/EffectObject3D/EffectGround';
import { Group3D } from '../objects/Group3D';
import { TubeNormal } from '../objects/TubeNormal';
import { Widget3D } from '../objects/Widget3D';

export type Object3DType =
  | BaseObject3D
  | GeometryObject3D
  | SpriteObject3D
  | MeshObject3D
  | WaterPlane
  | Pyramid
  | Shield
  | EffectGround
  | TubeNormal
  | Group3D
  | Widget3D;

export * from 'three';

export as namespace EnerV3D;
