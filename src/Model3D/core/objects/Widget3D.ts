import * as THREE from 'three';
import { loader } from '../tools/loader';
import { GeometryObject3D, SpriteObject3D } from '../index';
import { BaseObject3D, BaseInitOptions, Layout } from './BaseObject3D';
import { CSS3DObject, CSS3DSprite } from './CSSObject3D';

import { WIDGET, LAYOUT_X, LAYOUT_Y, LAYOUT_Z } from '../constants';
interface TextStyle {
  fontSize: number;
  color: string;
  text: string;
}

export interface WidgetOptions extends BaseInitOptions {
  type?: WIDGET;
  text?: string;
  dom?: HTMLElement;
  width?: number;
  height?: number;
  textParam?: TextStyle;
  canvas?: null | HTMLCanvasElement;
}

export class Widget3D extends BaseObject3D {
  public override readonly type: string = 'Widget';

  public widgetType: WIDGET;
  public width: number;
  public height: number;
  public textParam: TextStyle;
  public canvas: null | HTMLCanvasElement;
  public domEle: HTMLElement;
  public defaultLayout: Layout;

  constructor(options: WidgetOptions) {
    super(options);
    this.url = options.url;
    this.widgetType = options.type;
    this.width = options.width;
    this.height = options.height;
    this.textParam = options.textParam;
    this.defaultLayout = {
      rule: [LAYOUT_X.CENTER, LAYOUT_Y.TOP, LAYOUT_Z.CENTER],
    };
    this.canvas = options.canvas || null;
    this.domEle = options.dom;
  }

  override async init() {
    let node;
    switch (this.widgetType) {
      case WIDGET.IMG_2D:
        //Img2D
        node = await this._createImg2D();
        break;
      case WIDGET.IMG_3D:
        //Img3D
        node = await this._createImg3D();
        break;
      case WIDGET.TEXT_2D:
        //Text2D
        node = await this._createText2D();
        break;
      case WIDGET.TEXT_3D:
        //Text3D
        node = await this._createText3D();
        break;
      case WIDGET.PANEL_2D:
        node = await this._createPanel2D();
        break;
      case WIDGET.PANEL_3D:
        node = await this._createPanel3D();
        break;
    }
    this.attach(node);
    this.loadStatus = true;
    return this;
  }

  public override getWorldAABB() {
    const aabb = super.getWorldAABB();
    if (this.widgetType === WIDGET.PANEL_2D || this.widgetType === WIDGET.PANEL_3D) {
      aabb.width = this.width;
      aabb.height = this.height;
    }
    return aabb;
  }

  private async _createImg2D() {
    if (!this.url) return null;
    const texture = await loader.loadTexture(this.url);
    const material = new THREE.SpriteMaterial({
      map: texture as THREE.Texture,
    });
    // material.transparent = true;
    const width = material.map!.image.width;
    const height = material.map!.image.height;
    const ratio = width / height;

    const img2D = new SpriteObject3D(material);
    img2D.scale.set(this.width || 1, this.height || this.width / ratio, 1);

    return img2D;
  }

  private async _createImg3D() {
    if (!this.url) return null;
    const texture: THREE.Texture = await loader.loadTexture(this.url);
    if (!texture) {
      throw new Error(this.url + '加载失败');
    }
    const width = texture.image.width;
    const height = texture.image.height;
    const ratio = width / height;

    const plane = new GeometryObject3D({
      geometryType: 'plane',
      geometryParam: {
        width: this.width || 1,
        height: this.height || this.width / ratio,
      },
    });
    plane.material.map = texture;
    // TODO  设置透明度方法针对贴图的处理
    plane.material.transparent = true;
    plane.material.needsUpdate = true;
    return plane;
  }

  private async _createText2D() {
    //创建canvas
    this.canvas = this.createCanvas();
    this.drawText(this.textParam);
    // TODO  材质和贴图的管理整合到core
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
      map: texture as THREE.Texture,
    });
    // material.transparent = true;
    material.depthWrite = false;
    const width = material.map!.image.width;
    const height = material.map!.image.height;
    const ratio = width / height;

    const text2D = new SpriteObject3D(material);
    text2D.scale.set(this.width || 1, this.height || this.width / ratio, 1);

    return text2D;
  }

  createCanvas() {
    //TODO 需要管理器收集canvas
    return document.createElement('canvas');
  }

  // TODO 作为canvas封装API  而不是正在公告板类
  drawText(options: TextStyle) {
    if (!this.canvas) return;
    const { fontSize, color, text } = options;
    const width = text.length * fontSize * 2;
    const height = fontSize * 2;
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    ctx!.beginPath();
    ctx!.font = `${fontSize}px 微软雅黑`;
    ctx!.fillStyle = color;
    //居中文本
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    ctx!.fillText(text, width / 2, height / 2, 320);
    ctx!.closePath();
  }

  private async _createText3D() {
    //创建canvas
    this.canvas = this.createCanvas();
    this.drawText(this.textParam);

    const texture = new THREE.CanvasTexture(this.canvas);
    const width = texture.image.width;
    const height = texture.image.height;
    const ratio = width / height;
    texture.needsUpdate = true;
    const plane = new GeometryObject3D({
      geometryType: 'plane',
      geometryParam: {
        width: this.width || 1,
        height: this.height || this.width / ratio,
      },
    });
    plane.material.map = texture;
    // TODO  设置透明度方法针对贴图的处理
    plane.material.transparent = true;
    plane.material.needsUpdate = true;

    return plane;
  }

  private async _createPanel2D() {
    const object = new CSS3DSprite(this.domEle);
    const width = object.element.offsetWidth;
    // const height = object.element.offsetHeight;
    // const ratio = width / height;
    object.scale.set(this.width / width, this.height / width, 1);

    return object;
  }

  private async _createPanel3D() {
    const object = new CSS3DObject(this.domEle as HTMLDivElement);
    const width = object.element.offsetWidth;
    // const height = object.element.offsetHeight;
    // const ratio = width / height;
    object.scale.set(this.width / width, this.height / width, 1);

    return object;
  }
}
