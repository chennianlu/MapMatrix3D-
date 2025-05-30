
export type transformType = 'position' | 'rotation' | 'scale';

export type axisName = 'x' | 'y' | 'z' | 'xz';

export type coordinate = 'world' | 'object';

//属性扩展
export type MeshExtend = THREE.Mesh &
{
    axis?: axisName,
    tag?: string,
    transMode?: string
};

export enum color { active = '0', normal = '2' }

export enum axisMap { x = 'width', y = 'height', z = 'depth' }

export enum runningState {
    NONE = 1,
    PENDING,
}