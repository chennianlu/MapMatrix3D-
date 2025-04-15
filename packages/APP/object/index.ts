/**
 * @format
 */
import { BaseInitOptions, BaseObject } from './BaseObject';
import { BuildingObject, BuildingOptions } from './Building';
import { Cabinet, CabinetOptions } from './BatteryCabinet';
import { BatteryClusterOptions, BatteryCluster } from './BatteryCluster';
import { BatteryPack, BatteryPackOptions } from './BatteryPack';

// import { ChargingStatus, ChargingStatusInitOptions } from './ChargingStatus';
import { GeoInitOptions, Geometry } from './Geometry';
import { LineObject, LineObjectOptions } from './Line';
import { ParticleObject, ParticleObjectInitOptions } from './Particle';
import { VisualObject } from './VisualObject';
import { WaterPlane, WaterPlaneInitOptions } from './WaterPlane';
import { Widget, WidgetOptions } from './Widget';
import { TopoLine, TopoLineOptions } from './TopoLine';
import { TopoNode, TopoNodeOptions } from './TopoNode';

export type ObjectType =
  | BaseObject
  | Widget
  | BuildingObject
  | Cabinet
  | BatteryPack
  | BatteryCluster
  | LineObject
  | VisualObject
  | Geometry
  // | ChargingStatus
  | TopoLine
  | TopoNode
  | WaterPlane;

export type ObjectInitOptions =
  | {
    type: 'Base';
    params: BaseInitOptions;
    object: BaseObject;
  }
  | {
    type: 'Geometry';
    params: GeoInitOptions;
    object: Geometry;
  }
  | {
    type: 'Widget';
    params: WidgetOptions;
    object: Widget;
  }
  | {
    type: 'Line';
    params: LineObjectOptions;
    object: LineObject;
  }
  | {
    type: 'Building';
    params: BuildingOptions;
    object: BuildingObject;
  }
  | {
    type: 'Cabinet';
    params: CabinetOptions;
    object: Cabinet;
  }
  | {
    type: 'BatteryPack';
    params: BatteryPackOptions;
    object: BatteryPack;
  }
  | {
    type: 'BatteryCluster';
    params: BatteryClusterOptions;
    object: BatteryCluster;
  }
  | {
    type: 'Particle';
    params: ParticleObjectInitOptions;
    object: ParticleObject;
  }
  | {
    type: 'VisualObject';
    params: any;
    object: any;
  }
  // | {
  //   type: 'ChargingStatus';
  //   params: ChargingStatusInitOptions;
  //   object: ChargingStatus;
  // }
  | {
    type: 'WaterPlane';
    params: WaterPlaneInitOptions;
    object: WaterPlane;
  }
  | {
    type: 'TopoLine';
    params: TopoLineOptions;
    object: TopoLine;
  }
  | {
    type: 'TopoNode';
    params: TopoNodeOptions;
    object: TopoNode;
  };

//根据事件名称匹配正确传参
type ToObjectManagerOnType<T> = T extends { type: string; params: any }
  ? // [type: T["type"], params: T["params"], func: (...params: T["params"]) => T['object']] : never;
  [type: T['type'], params: T['params']]
  : never;

export type ObjectManagerOnType = ToObjectManagerOnType<ObjectInitOptions>;

export {
  BaseObject,
  Geometry,
  LineObject,
  Widget,
  Cabinet,
  BatteryCluster,
  BatteryPack,
  BuildingObject,
  ParticleObject,
  VisualObject,
  // ChargingStatus,
  WaterPlane,
  TopoLine,
  TopoNode,
};
