import * as THREE from 'three';
import { BaseObject3D } from './BaseObject3D';

let _geometry;

const _intersectPoint = /*@__PURE__*/ new THREE.Vector3();
const _worldScale = /*@__PURE__*/ new THREE.Vector3();
const _mvPosition = /*@__PURE__*/ new THREE.Vector3();

const _alignedPosition = /*@__PURE__*/ new THREE.Vector2();
const _rotatedPosition = /*@__PURE__*/ new THREE.Vector2();
const _viewWorldMatrix = /*@__PURE__*/ new THREE.Matrix4();

const _vA = /*@__PURE__*/ new THREE.Vector3();
const _vB = /*@__PURE__*/ new THREE.Vector3();
const _vC = /*@__PURE__*/ new THREE.Vector3();

const _uvA = /*@__PURE__*/ new THREE.Vector2();
const _uvB = /*@__PURE__*/ new THREE.Vector2();
const _uvC = /*@__PURE__*/ new THREE.Vector2();

class SpriteObject3D extends BaseObject3D {
  isSprite: boolean;
  geometry: any;
  declare material: any;
  center: THREE.Vector2;

  constructor(material) {
    super({});

    this.isSprite = true;
    //@ts-ignore
    this.type = 'Sprite';

    if (_geometry === undefined) {
      _geometry = new THREE.BufferGeometry();

      const float32Array = new Float32Array([
        -0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 1,
      ]);

      const interleavedBuffer = new THREE.InterleavedBuffer(float32Array, 5);

      _geometry.setIndex([0, 1, 2, 0, 2, 3]);
      _geometry.setAttribute(
        'position',
        new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false)
      );
      _geometry.setAttribute(
        'uv',
        new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false)
      );
    }

    this.geometry = _geometry;
    this.material = material !== undefined ? material : new THREE.SpriteMaterial();

    this.center = new THREE.Vector2(0.5, 0.5);
  }

  override raycast(raycaster, intersects) {
    if (raycaster.camera === null) {
      console.error(
        'THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'
      );
    }

    _worldScale.setFromMatrixScale(this.matrixWorld);

    _viewWorldMatrix.copy(raycaster.camera.matrixWorld);
    this.modelViewMatrix.multiplyMatrices(raycaster.camera.matrixWorldInverse, this.matrixWorld);

    _mvPosition.setFromMatrixPosition(this.modelViewMatrix);

    if (raycaster.camera.isPerspectiveCamera && this.material.sizeAttenuation === false) {
      _worldScale.multiplyScalar(-_mvPosition.z);
    }

    const rotation = this.material.rotation;
    let sin, cos;

    if (rotation !== 0) {
      cos = Math.cos(rotation);
      sin = Math.sin(rotation);
    }

    const center = this.center;

    transformVertex(_vA.set(-0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vB.set(0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vC.set(0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);

    _uvA.set(0, 0);
    _uvB.set(1, 0);
    _uvC.set(1, 1);

    // check first triangle
    let intersect = raycaster.ray.intersectTriangle(_vA, _vB, _vC, false, _intersectPoint);

    if (intersect === null) {
      // check second triangle
      transformVertex(_vB.set(-0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);
      _uvB.set(0, 1);

      intersect = raycaster.ray.intersectTriangle(_vA, _vC, _vB, false, _intersectPoint);
      if (intersect === null) {
        return;
      }
    }

    const distance = raycaster.ray.origin.distanceTo(_intersectPoint);

    if (distance < raycaster.near || distance > raycaster.far) return;

    intersects.push({
      distance: distance,
      point: _intersectPoint.clone(),
      uv: new THREE.Vector2(
        (_intersectPoint.x - _vA.x) / (_vB.x - _vA.x),
        (_intersectPoint.y - _vA.y) / (_vC.y - _vA.y)
      ),
      face: null,
      object: this,
    });
  }

  override copy(source, recursive) {
    super.copy(source, recursive);

    if (source.center !== undefined) this.center.copy(source.center);

    this.material = source.material;

    return this;
  }
}

function transformVertex(vertexPosition, mvPosition, center, scale, sin, cos) {
  // compute position in camera space
  _alignedPosition.subVectors(vertexPosition, center).addScalar(0.5).multiply(scale);

  // to check if rotation is not zero
  if (sin !== undefined) {
    _rotatedPosition.x = cos * _alignedPosition.x - sin * _alignedPosition.y;
    _rotatedPosition.y = sin * _alignedPosition.x + cos * _alignedPosition.y;
  } else {
    _rotatedPosition.copy(_alignedPosition);
  }

  vertexPosition.copy(mvPosition);
  vertexPosition.x += _rotatedPosition.x;
  vertexPosition.y += _rotatedPosition.y;

  // transform to world space
  vertexPosition.applyMatrix4(_viewWorldMatrix);
}

export { SpriteObject3D };
