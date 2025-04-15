import { BaseObject3D, BaseInitOptions } from './BaseObject3D';

interface Group3DInit extends BaseInitOptions {}

/**
 * 组
 */
export class Group3D extends BaseObject3D {
  public override readonly type: string = 'Group';

  constructor(options: Group3DInit = {}) {
    super(options);
  }

  splitGroup() {}
}
