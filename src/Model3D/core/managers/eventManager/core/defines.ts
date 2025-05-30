import { Object3DType } from '../../../types';
//物体事件绑定类型
export type ObjectEventType = 'CLICK' | 'DBCLICK' | 'CORE_LEVEL_CHANGE';

//全局事件类型
export type EventParams =
  | {
      name: 'CORE_LEVEL_CHANGE';
      params: [cur: Object3DType, pre?: Object3DType, noFlight?: boolean];
    }
  | {
      name: 'CORE_OBJECT_SELECTED';
      params: [object: Object3DType | null, type: 'single' | 'multiple' | null];
    }
  | {
      name: 'CORE_CANVAS_RESIZE';
      params: [];
    }
  | {
      name: 'CLICK';
      params: [event: MouseEvent];
    }
  | {
      name: 'DBCLICK';
      params: [event: MouseEvent];
    }
  | {
      name: 'POINT_UP';
      params: [event: MouseEvent];
    }
  | {
      name: 'POINT_CANCEL';
      params: [];
    }
  | {
      name: 'POINT_DOWN';
      params: [event: MouseEvent];
    }
  | {
      name: 'POINT_MOVE';
      params: [event: MouseEvent];
    }
  | {
      name: 'POINT_OUT';
      params: [event: MouseEvent];
    }
  | {
      name: 'POINT_OVER';
      params: [];
    }
  | {
      name: 'WHEEL';
      params: [];
    }
  | {
      name: 'KEY_DOWN';
      params: [event: KeyboardEvent];
    }
  | {
      name: 'KEY_UP';
      params: [event: KeyboardEvent];
    };

//根据事件名称匹配正确传参
type ToEventManagerOnType<Src> = Src extends { name: string; params: any[] }
  ? [name: Src['name'], func: (...params: Src['params']) => void, options?: any]
  : never;

export type EventManagerOnType = ToEventManagerOnType<EventParams>;

type ToEventManagerDispatchType<Src> = Src extends { name: string; params: any[] }
  ? [name: Src['name'], params: Src['params']]
  : never;

export type EventManagerDispatchType = ToEventManagerDispatchType<EventParams>;
