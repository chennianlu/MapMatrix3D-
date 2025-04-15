import * as THREE from 'three';
import { loader } from '../tools/loader';
import materialManager from '../managers/materialManager';
import { GeometryObject3D } from './GeometryObject3D';

import { LINE_TYPE } from '../constants';
import { animationManager } from '../managers/animationManager';

import { BaseInitOptions, BaseObject3D } from './BaseObject3D';
import { MeshObject3D } from './MeshObject3D';
import { Object3D } from 'three';
import { Group3D } from './Group3D';

export interface LineObjectOptions extends BaseInitOptions {
  lineType?: LINE_TYPE;
  points?: Array<number[]>;
  corner?: number;
  radius?: number;
  url?: string;
  color?: string;
  opacity?: number;
  repeat?: number;
  imageRepeat?: any;
  animation?: AnimationOptions;
  sprite?: SpriteOptions;
}

export interface AnimationOptions {
  state?: boolean;
  speed?: number;
  direction?: string; //'plus' | 'Minus'
}

export interface SpriteOptions {
  url?: string;
  size?: number;
  count?: number;
  color?: string;
}

/**
 * @class TubeNormal
 * @des 基础管道
 */
export class TubeNormal extends BaseObject3D {
  public override readonly type: string = 'Line';

  public lineType: LINE_TYPE;
  public radius: number;
  points: number[][];

  tubeRadius: number = 1;
  tubeGeometry: THREE.TubeGeometry;
  spriteCount: number = 1;
  animationStep: number = 0.005;
  particlePoints: any[] = []; //如果创建粒子的话存储粒子的数组
  controlPoints: any[] = []; //管线控制点
  lineOptions: LineObjectOptions;

  constructor(options: LineObjectOptions = {}) {
    super(options);
    this.lineType = LINE_TYPE.UV_TUBE;
    this.url = options.url;
    if (typeof options.radius === 'number') {
      this.radius = options.radius;
    } else {
      this.radius = 0.2;
    }
  }

  /**
   * 计算当前线路生成的点位总长度
   * @param points
   * @returns
   */
  static calcutePointLength(points: Array<Array<number>>): number {
    if (!Array.isArray(points) || points.length < 2) return 0;
    let lineSize = 0;
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();

    for (let index = 1; index < points.length; index++) {
      const element = points[index];
      const subElement = points[index - 1];
      v1.set(element[0], element[1], element[2]);
      v2.set(subElement[0], subElement[1], subElement[2]);
      lineSize += Math.abs(v1.distanceTo(v2));
    }
    return lineSize;
  }

  override async init(params: LineObjectOptions) {
    const { lineType, points } = params;
    this.points = points || [];
    this.lineOptions = { ...params, points: [...params.points] };
    switch (lineType) {
      case LINE_TYPE.UV_PATH:
        break;

      case LINE_TYPE.UV_TUBE:
        await this._initUVTube(params);
        break;

      case LINE_TYPE.PIXEL:
        await this._initPixelNode(params);
        break;

      default:
        break;
    }
    //挂载父节点
    let parent = params.parent;
    if (parent instanceof THREE.Object3D) {
      parent.attach(this);
    }
    return this;
  }

  async _initUVTube(params: LineObjectOptions) {
    const { points, radius, repeat = 1, color, opacity, sprite, animation } = params;
    let vct3s = points.map(arr => new THREE.Vector3(...arr));
    //计算曲线
    // vct3s = this.generateCorner(vct3s)

    const curve = new THREE.CatmullRomCurve3(vct3s, false, 'catmullrom', 0);
    // const curve = new THREE.CatmullRomCurve3(vct3s, false, 'chordal');

    const geometry = new THREE.TubeGeometry(curve, 128, radius, 8, false);
    const material = materialManager.create({ uuid: this.uuid, color: color, opacity: opacity });
    material.blending = THREE.CustomBlending;
    // 关闭深度
    material.depthTest = true;
    material.depthWrite = true;

    const object3D = new MeshObject3D(geometry, material);
    this._model = object3D;
    this.attach(object3D);
    if (this.url) {
      await this._loadTexture(object3D, repeat);
    }
    if (sprite && sprite.url) {
      const res = await this.initPartical(object3D, sprite);
      this.particlePoints = res;
    }
    if (this.url && animation) {
      this.play(animation);
    }
    return object3D;
  }
  async initPartical(object3D: MeshObject3D, sprite: SpriteOptions) {
    const { url, size, count = 1, color = '#ffffff' } = sprite;
    this.spriteCount = count;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const particlePoints: any[] = [];
    const spriteTex: THREE.Texture = await loader.loadTexture(url);

    for (let i = 0; i < count; i++) {
      //@ts-ignore
      const position = object3D.geometry.parameters.path.getPointAt(i / this.spriteCount);
      // let pos = this.getRandomPointPos(position.x,position.y-this.tubeRadius,position.z)
      vertices.push(position.x, position.y, position.z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const materials = new THREE.PointsMaterial({
      size,
      map: spriteTex,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      transparent: true,
      depthWrite: false,
    });
    materials.color.set(color);
    const particles = new THREE.Points(geometry, materials);
    particles.renderOrder = 2;

    let a = {
      particles,
      per: 0,
    };
    particlePoints.push(a);
    this._model = particles;
    this.add(particles);
    return particlePoints;
  }

  _particalAnimation(object3D: Object3D) {
    this.particlePoints.forEach((item: any, index: number) => {
      const geoPositon = item.particles.geometry.attributes.position;
      for (let i = 0; i < this.spriteCount; i++) {
        const i3 = i * 3;
        const tubePer = i / this.spriteCount + item.per;
        //@ts-ignore
        const position = object3D.geometry.parameters.path.getPointAt(
          tubePer > 1 ? tubePer - Math.floor(tubePer) : tubePer
        );

        item.per += this.animationStep;
        geoPositon.array[i3] = position.x;
        geoPositon.array[i3 + 2] = position.z;
        geoPositon.needsUpdate = true;
      }
    });
  }

  async _initPixelNode(params: LineObjectOptions) {
    const { points, color, opacity = 1 } = params;
    let vct3s = points.map(arr => new THREE.Vector3(...arr));
    vct3s = this.generateCorner(vct3s);
    const material = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(vct3s);
    //@ts-ignore
    const object3D = new THREE.Line(geometry, material);
    this.attach(object3D);
    this._model = object3D;
    if (this.url) {
      await this._loadTexture(object3D, 64);
    }
  }

  _betweenPoint(start: THREE.Vector3, end: THREE.Vector3, corner: number) {
    const v1 = new THREE.Vector3().copy(start);
    const v2 = new THREE.Vector3().copy(end);
    const normal = new THREE.Vector3().copy(end);
    normal.sub(v1).normalize();
    const distance = v1.distanceTo(v2);
    const progress = corner / distance;
    return normal.multiplyScalar(distance * progress).add(v1);
  }

  /**
   * 根据边角半径插值
   * @param vet3
   * @returns
   */
  generateCorner(vet3: THREE.Vector3[]) {
    if (vet3.length < 3) return vet3;
    let result = [];
    result.push(vet3[0]);
    const corner = 1;

    //去掉第一个点和最后一个点
    for (let i = 1; i < vet3.length - 1; i++) {
      const prePoint = vet3[i - 1];
      const curPoint = vet3[i];
      const nextPoint = vet3[i + 1];

      const point1 = this._betweenPoint(curPoint, prePoint, corner);
      const point2 = this._betweenPoint(curPoint, nextPoint, corner);

      // const v1 = new THREE.Vector3().copy(curPoint)
      // const shrinkPoint = v1.multiplyScalar(1 - (corner * .5 / curPoint.length()))
      // debugger;
      const curve = new THREE.CatmullRomCurve3([point1, curPoint, point2]);
      console.log(point1, curPoint, point2);
      const interpolation = curve.getPoints(16);
      result.push(...interpolation);
    }
    result.push(vet3[vet3.length - 1]);
    return result;
  }

  /**
   * 对物体资源加载
   * @param url
   */
  async _loadTexture(object3D: MeshObject3D | THREE.Line, repeat: number): Promise<void> {
    const texture: THREE.Texture = await loader.loadTexture(this.url);
    if (!texture) {
      throw new Error(this.url + '加载失败');
    }
    // 平铺数量根据管线的直径以及长度计算
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, 1);
    object3D.material.map = texture;
    object3D.material.needsUpdate = true;
    // object3D.material.wireframe = true
  }

  /**
   * 播放UV动画
   * @param animation
   */
  play(animation: AnimationOptions) {
    if (!this.url) return;
    this.lineOptions.animation = animation;
    this.lineOptions.animation.state = true;
    const { speed = animation.speed || 1, direction = animation.direction || 'Minus' } = animation;
    let spaceNode = speed * 0.1;
    this.animationStep = spaceNode;

    if (direction === 'Minus') spaceNode *= -1;
    const renderNode = this._model;
    animationManager.create('TubeUV_Animation' + this.id, () => {
      (renderNode as GeometryObject3D).material.map.offset.x += spaceNode;
      this._particalAnimation(renderNode);
    });
  }

  /**
   * 注销当前动画
   */
  stop() {
    this.lineOptions.animation.state = false;
    animationManager.remove('TubeUV_Animation' + this.id);
  }

  /**
   * 创建单个控制点位
   * @param position
   * @param number<index>
   * @returns Group3D
   */
  _createControlCell(position: number[], index: number): Group3D {
    const group = new Group3D();
    const radius = this.radius;
    const cylinder = new GeometryObject3D({
      geometryType: 'cylinder',
      geometryParam: {
        radius: radius * 1.2,
        height: 2 * radius * 1.2,
      },
    });
    group.add(cylinder);
    // 绑定当前控制点对应的位置下标
    group.userData.tubeIndex = index;
    // 点位是世界坐标
    group.setWorldPosition(position);
    this.add(group);
    this.controlPoints.push(group);
    return group;
  }

  /**
   * 显示当前线路控制点
   */
  showControlPoints() {
    // destroy
    this.destroyControlPoints();

    this.points.forEach((curPoint, index) => {
      this._createControlCell(curPoint, index);
    });
  }

  /**
   * 根据控制点的位置对当前管线重绘
   */
  _updateControlPoints() {
    //控制点移动过程更新点位坐标 线路重绘
    this.points = [];
    this.controlPoints.forEach(cur => {
      this.points.push(cur.position.toArray());
    });
    this.lineOptions.points = this.points;
    this.generateGeometry(this.lineOptions);
  }

  /**
   * 管线自身发生位移后需要同步更新真实点位
   */
  _updateRealPoints(newPos: number[], oldPos: number[]) {
    //控制点移动过程更新点位坐标 线路重绘
    console.log('oldPoints', this.points);

    const offset = new THREE.Vector3().fromArray(newPos).sub(new THREE.Vector3().fromArray(oldPos));
    const offsetLength = offset.length();
    const offsetNormal = offset.normalize();
    this.points.forEach((cur, index) => {
      const movePos = new THREE.Vector3()
        .fromArray(cur)
        .addScaledVector(offsetNormal, offsetLength);
      this.points[index] = movePos.toArray();
    });
    console.log('newPoints', this.points);

    this.lineOptions.points = this.points;
  }

  destroyControlPoints() {
    for (let i = 0; i < this.controlPoints.length; i++) {
      const curPoint = this.controlPoints[i];
      this.remove(curPoint);
    }
    this.controlPoints = [];
  }

  /**
   * 根据变更信息重新计算生成几何体对象进行挂载
   * @param params LineObjectOptions
   */
  generateGeometry(params: LineObjectOptions) {
    const overlayParams = Object.assign({}, this.lineOptions, params);

    const { points, radius, repeat = 1, color, opacity, animation = {}, sprite } = overlayParams;
    this.lineOptions = { ...overlayParams };

    const renderNode = this.children[0];
    let vct3s = points.map(arr => new THREE.Vector3(...arr));
    const curve = new THREE.CatmullRomCurve3(vct3s, false, 'catmullrom', 0);

    const geometry = new THREE.TubeGeometry(curve, 128, radius, 8, false);

    (renderNode as unknown as MeshObject3D).geometry = geometry;
  }

  /**
   * 根据变更信息重新生成材质进行挂载
   * @param params LineObjectOptions
   */
  generateMaterial(params: LineObjectOptions) {
    const overlayParams = Object.assign({}, params, this.lineOptions);
    const { points, radius, repeat = 1, color, opacity, animation = {}, sprite } = params;
    const renderNode = this.children[0];
    let vct3s = points.map(arr => new THREE.Vector3(...arr));
    const curve = new THREE.CatmullRomCurve3(vct3s, false, 'catmullrom', 0);

    const geometry = new THREE.TubeGeometry(curve, 128, radius, 8, false);

    (renderNode as unknown as MeshObject3D).geometry = geometry;
  }

  override copy(source: any, recursive: boolean = true) {
    const res = super.copy(source, (recursive = true));

    this.lineType = source.lineType;
    this.url = source.url;
    this.radius = source.radius;
    this.lineOptions = source.lineOptions;

    return res;
  }

  override setColor(color: string | null, deep?: boolean) {
    super.setColor(color, deep);
    this.lineOptions.color = color;
  }

  override setOpacity(opacity: number, deep?: boolean) {
    super.setOpacity(opacity, deep);
    this.lineOptions.opacity = opacity;
  }

  /**
   * 修改当前管线贴图
   * @param url
   */
  async setTexture(url: string) {
    const texture = await loader.loadTexture(url);
    this.url = url;
    this.lineOptions.url = url;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(this.lineOptions.repeat || 1, 1);
    // this.children
    (this._model as unknown as MeshObject3D).material.map = texture;
    (this._model as unknown as MeshObject3D).material.needsUpdate = true;
  }

  /**
   * 设置当前贴图平铺距离
   * @param repeat
   */
  setTextureRepeat(repeat: number) {
    if (!(this._model as unknown as MeshObject3D).material.map) return;
    (this._model as unknown as MeshObject3D).material.map.repeat.set(repeat, 1);
  }
}
