/**
 * @class GeometryObjectParam
 * @define 维护几何体类型和初始化参数
 * @version 1.0.0
 */
const UNIT = 1;
/**
 * 计算20面体的半径函数
 * @return {string}
 */
const icoRadius = function () {
  const x = 1 / 2;
  const a = (4 * x) / (1 + Math.sqrt(5));
  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(a / 2, 2)).toFixed(4);
  return r;
};
const GeometryObjectParam = {
  /**
   * 正方体
   */
  plane: {
    geometryParam: {
      width: UNIT,
      height: UNIT,
    },
  },
  /**
   * 正方体
   */
  box: {
    geometryParam: {
      width: UNIT,
      height: UNIT,
      depth: UNIT,
    },
  },
  /**
   * 圆柱
   */
  cylinder: {
    geometryParam: {
      // radius: UNIT / 2,
      height: UNIT,
      sides: 32,
      angle: 360,
    },
  },

  /**
   * 圆筒
   */
  annulus: {
    geometryParam: {
      radius: UNIT / 2,
      thickness: (1 / 8) * UNIT,
      sides: 32,
      angle: 360,
    },
  },
  /**
   * 球体
   */
  sphere: {
    geometryParam: {
      // radius: UNIT / 2,
      widthSegments: 32,
      heightSegments: 16,
    },
  },
  /**
   * 二十面体
   */
  icosahedron: {
    geometryParam: {
      radius: icoRadius(),
      detail: 0,
    },
  },

  /**
   * 圆锥
   */
  cone: {
    geometryParam: {
      sides: 32,
      radius: UNIT / 2,
      angle: 360,
    },
  },

  /**
   * 圆环
   */
  circularRing: {
    geometryParam: {
      radius: (3 * UNIT) / 8,
      ringRadius: UNIT / 8,
      radialSegments: 32,
      tubularSegments: 32,
      angle: 360,
    },
  },
};
export default GeometryObjectParam;
