/**
 * @file 梯度发光材质生成工具
 * @description 提供创建内发光边缘效果材质的功能。
 * 该工具使用自定义着色器实现沿多边形边缘向内部渐变的发光效果，
 * 能够自动检测几何体边缘并创建平滑的发光过渡，适用于UI元素、
 * 高亮对象和科技风格界面。
 * 
 * 主要功能：
 * - 创建自定义着色器材质用于内发光效果
 * - 从几何体中提取顶点信息
 * - 支持多种参数配置（颜色、强度、宽度、衰减）
 * - 提供几何体顶点更新方法
 * - 支持透明度和双面渲染
 */
import * as THREE from 'three';

interface GradientGlowMaterialOptions {
  glowColor?: number | string | THREE.Color;
  baseColor?: number | string | THREE.Color;
  glowIntensity?: number;
  glowWidth?: number; // 边缘发光宽度，值为0-1，默认0.2表示边缘20%区域
  glowFalloff?: number; // 控制发光衰减曲线的陡峭程度，默认为2.0
  vertices?: THREE.Vector2[]; // 在UV空间的多边形顶点数组
  debugMode?: boolean; // 调试模式
  glowType?: 'edge' | 'center'; // 发光效果类型：边缘发光或中心发光
}

// 创建一个简单的棋盘格纹理（调试用）
const createCheckerTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  // 设置棋盘格的大小
  const squareSize = 64; // 每个格子的大小
  
  // 绘制棋盘格
  for (let y = 0; y < size; y += squareSize) {
    for (let x = 0; x < size; x += squareSize) {
      // 交替填充黑白色
      const isEven = ((x / squareSize) + (y / squareSize)) % 2 === 0;
      ctx.fillStyle = isEven ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, squareSize, squareSize);
    }
  }
  
  // 添加红色边框标记UV边界
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  
  // 添加中心标记
  ctx.fillStyle = '#ff00ff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // 添加坐标轴指示
  ctx.fillStyle = '#ff0000'; // X轴为红色
  ctx.fillRect(0, size / 2 - 2, size, 4); // 水平线
  
  ctx.fillStyle = '#00ff00'; // Y轴为绿色
  ctx.fillRect(size / 2 - 2, 0, 4, size); // 垂直线
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// 从几何体提取顶点并转换到UV空间
const extractVerticesFromGeometry = (geometry: THREE.BufferGeometry): THREE.Vector2[] => {
  // 创建直接从Shape中提取顶点的函数
  const extractVerticesFromShape = (shape: THREE.Shape): THREE.Vector2[] => {
    const vertices: THREE.Vector2[] = [];
    
    // 先添加第一个点
    if (shape.curves.length > 0) {
      const firstPoint = shape.curves[0].getPoint(0);
      vertices.push(new THREE.Vector2(firstPoint.x, firstPoint.y));
    }
    
    // 然后添加每条曲线的终点
    shape.curves.forEach(curve => {
      const endPoint = curve.getPoint(1);
      vertices.push(new THREE.Vector2(endPoint.x, endPoint.y));
    });
    
    return vertices;
  };
  
  // 检查是否是ShapeGeometry
  if ((geometry as any)._shapeGeo) {
    const shapeGeo = (geometry as any)._shapeGeo;
    
    if (shapeGeo && shapeGeo.shapes) {
      // 是ShapeGeometry且有shapes属性，直接提取顶点
      let shapeVerts: THREE.Vector2[] = [];
      
      if (Array.isArray(shapeGeo.shapes)) {
        // 多个Shape情况
        shapeGeo.shapes.forEach((shape: THREE.Shape) => {
          shapeVerts = shapeVerts.concat(extractVerticesFromShape(shape));
        });
      } else {
        // 单个Shape情况
        shapeVerts = extractVerticesFromShape(shapeGeo.shapes);
      }
      
      // 计算边界框进行归一化
      const bounds = new THREE.Box2();
      shapeVerts.forEach(v => bounds.expandByPoint(v));
      
      // 归一化顶点坐标到UV空间（0-1范围）
      const normalizedVerts = shapeVerts.map(v => {
        return new THREE.Vector2(
          (v.x - bounds.min.x) / (bounds.max.x - bounds.min.x),
          (v.y - bounds.min.y) / (bounds.max.y - bounds.min.y)
        );
      });
      
      return normalizedVerts;
    }
  }
  
  // 如果不是ShapeGeometry或无法访问其Shape，用标准方法提取
  
  // 获取顶点位置
  const positions = geometry.getAttribute('position');
  const vertexCount = positions.count;
  
  // 找出所有可能的边缘顶点
  const edgeVertices: THREE.Vector2[] = [];
  const tempPos = positions as THREE.BufferAttribute;
  
  // 创建边界框以计算UV转换
  const bounds = new THREE.Box3();
  bounds.setFromBufferAttribute(tempPos);
  
  const width = bounds.max.x - bounds.min.x;
  const height = bounds.max.y - bounds.min.y;
  
  // 用于检测边缘的辅助集合
  const edgeDetector = new Set<string>();
  
  // 首先，添加所有顶点到一个集合
  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // 只处理几乎在同一平面上的点（z接近0）
    if (Math.abs(z) < 0.01) {
      // 规范化坐标以减少浮点误差
      const xKey = Math.round(x * 1000) / 1000;
      const yKey = Math.round(y * 1000) / 1000;
      const key = `${xKey},${yKey}`;
      
      if (!edgeDetector.has(key)) {
        edgeDetector.add(key);
        
        // 转换到UV空间 (0-1)
        const uvX = (x - bounds.min.x) / width;
        const uvY = (y - bounds.min.y) / height;
        
        edgeVertices.push(new THREE.Vector2(uvX, uvY));
      }
    }
  }
  
  // 如果有索引，尝试通过索引检测边缘
  if (geometry.index) {
    const index = geometry.index;
    const indexCount = index.count;
    
    // 使用凸包算法或边缘检测来简化顶点集
    // 这里使用Graham扫描法计算凸包
    const grahamScan = (points: THREE.Vector2[]): THREE.Vector2[] => {
      if (points.length <= 3) return points;
      
      // 找到y坐标最小的点，如果有多个，取x最小的
      let bottomPoint = points[0];
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point.y < bottomPoint.y || (point.y === bottomPoint.y && point.x < bottomPoint.x)) {
          bottomPoint = point;
        }
      }
      
      // 计算每个点相对于底部点的极角
      const angles: {point: THREE.Vector2, angle: number}[] = [];
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point === bottomPoint) continue;
        
        const angle = Math.atan2(point.y - bottomPoint.y, point.x - bottomPoint.x);
        angles.push({point, angle});
      }
      
      // 按极角排序
      angles.sort((a, b) => a.angle - b.angle);
      
      // 把底部点和排序后的点组合
      const sortedPoints = [bottomPoint];
      angles.forEach(({point}) => sortedPoints.push(point));
      
      // Graham扫描法构建凸包
      const hull: THREE.Vector2[] = [];
      for (let i = 0; i < sortedPoints.length; i++) {
        while (hull.length >= 2) {
          const p1 = hull[hull.length - 2];
          const p2 = hull[hull.length - 1];
          const p3 = sortedPoints[i];
          
          // 计算叉积，判断是否需要删除上一个点
          const cross = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
          
          if (cross <= 0) {
            hull.pop(); // 删除上一个点
          } else {
            break;
          }
        }
        hull.push(sortedPoints[i]);
      }
      
      return hull;
    };
    
    // 计算凸包
    const hullVertices = grahamScan(edgeVertices);
    
    // console.log(`提取了${edgeVertices.length}个点，通过凸包算法简化为${hullVertices.length}个点`);
    return hullVertices;
  }
  
  return edgeVertices;
};

// 创建边缘发光着色器
const createEdgeGlowShader = (vertices: THREE.Vector2[]) => {
  // 限制最大顶点数以防性能问题
  const maxVertices = Math.min(vertices.length, 50);
  
  return {
    uniforms: {
      glowColor: { value: new THREE.Color(1.0, 0.0, 0.0) },
      baseColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      baseOpacity: { value: 1.0 }, // 添加基础颜色透明度控制
      glowIntensity: { value: 1.0 },
      glowWidth: { value: 0.2 },
      glowFalloff: { value: 2.0 },
      vertices: { value: vertices.slice(0, maxVertices) }
    },
    
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    
    fragmentShader: `
      #define EDGE_SEARCH_STEPS 50.0
      #define MAX_VERTICES ${maxVertices}
      
      uniform vec3 glowColor;
      uniform vec3 baseColor;
      uniform float baseOpacity;
      uniform float glowIntensity;
      uniform float glowWidth;
      uniform float glowFalloff;
      uniform vec2 vertices[MAX_VERTICES];
      
      varying vec2 vUv;
      
      // 射线法判断点是否在多边形内部
      bool isInside(vec2 pt) {
        if(MAX_VERTICES <= 0) return true;
        
        int crossings = 0;
        for(int i = 0; i < MAX_VERTICES; i++) {
          vec2 a = vertices[i];
          vec2 b = vertices[int(mod(float(i + 1), float(MAX_VERTICES)))];
          
          if((a.y > pt.y) != (b.y > pt.y)) {
            float t = (pt.y - a.y) / (b.y - a.y);
            float x = a.x + t * (b.x - a.x);
            if(x >= pt.x) crossings++;
          }
        }
        return (crossings % 2) == 1;
      }
      
      // 计算点到边的带符号距离 (SDF - Signed Distance Field)
      float sdSegment(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }
      
      // 计算点到所有边的最短距离，使用改进的SDF方法
      float findMinDistance(vec2 p) {
        if(MAX_VERTICES <= 0) return 0.1; // 默认距离值
        
        float minDist = 9999.0;
        
        for(int i = 0; i < MAX_VERTICES; i++) {
          vec2 a = vertices[i];
          vec2 b = vertices[int(mod(float(i + 1), float(MAX_VERTICES)))];
          
          // 使用SDF来计算到线段的最短距离
          float dist = sdSegment(p, a, b);
          minDist = min(minDist, dist);
        }
        
        // 返回归一化的距离，相对于指定的glowWidth
        return minDist;
      }
      
      // 更平滑的插值函数，使用三次贝塞尔曲线
      float smoothInterpolation(float x) {
        return x * x * (3.0 - 2.0 * x);
      }
      
      // 更平滑的发光强度计算
      float calculateGlowStrength(float dist, float width, float falloff) {
        // 使用平滑的插值函数
        float normalizedDist = dist / width;
        float glow = 1.0 - smoothInterpolation(clamp(normalizedDist, 0.0, 1.0));
        
        // 应用更平滑的衰减曲线
        return pow(glow, falloff);
      }
      
      void main() {
        // 默认使用基础颜色和透明度
        vec3 finalColor = baseColor;
        float alpha = baseOpacity;
        
        // 如果没有顶点，显示纯色
        if(MAX_VERTICES <= 0) {
          gl_FragColor = vec4(baseColor, alpha);
          return;
        }
        
        // 检查是否在多边形内部
        bool inside = isInside(vUv);
        
        // 如果不在多边形内部，完全透明
        if(!inside) {
          discard; // 完全不渲染这个片段
          return;
        }
        
        // 计算到最近边缘的距离
        float dist = findMinDistance(vUv);
        
        // 使用新的平滑发光强度计算
        float glowStrength = calculateGlowStrength(dist, glowWidth, glowFalloff);
        
        // 应用发光强度
        glowStrength *= glowIntensity;
        
        // 混合颜色 - 使用更平滑的过渡
        finalColor = mix(baseColor, glowColor, glowStrength);
        
        // 如果基础颜色是透明的，则alpha也受发光强度影响
        if(baseOpacity < 0.01) {
          alpha = glowStrength;
        } else {
          // 否则，发光区域完全不透明，其他区域使用baseOpacity
          alpha = max(baseOpacity, glowStrength);
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  };
};

// 创建中心发光着色器
const createCenterGlowShader = (vertices: THREE.Vector2[]) => {
  const maxVertices = Math.min(vertices.length, 50);
  
  return {
    uniforms: {
      glowColor: { value: new THREE.Color(1.0, 0.0, 0.0) },
      baseColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      baseOpacity: { value: 1.0 },
      glowIntensity: { value: 1.0 },
      glowWidth: { value: 0.2 },
      glowFalloff: { value: 2.0 },
      vertices: { value: vertices.slice(0, maxVertices) }
    },
    
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    
    fragmentShader: `
      #define MAX_VERTICES ${maxVertices}
      
      uniform vec3 glowColor;
      uniform vec3 baseColor;
      uniform float baseOpacity;
      uniform float glowIntensity;
      uniform float glowWidth;
      uniform float glowFalloff;
      uniform vec2 vertices[MAX_VERTICES];
      
      varying vec2 vUv;
      
      // 射线法判断点是否在多边形内部
      bool isInside(vec2 pt) {
        if(MAX_VERTICES <= 0) return true;
        
        int crossings = 0;
        for(int i = 0; i < MAX_VERTICES; i++) {
          vec2 a = vertices[i];
          vec2 b = vertices[int(mod(float(i + 1), float(MAX_VERTICES)))];
          
          if((a.y > pt.y) != (b.y > pt.y)) {
            float t = (pt.y - a.y) / (b.y - a.y);
            float x = a.x + t * (b.x - a.x);
            if(x >= pt.x) crossings++;
          }
        }
        return (crossings % 2) == 1;
      }
      
      // 计算多边形的中心点
      vec2 calculateCenter() {
        vec2 center = vec2(0.0);
        for(int i = 0; i < MAX_VERTICES; i++) {
          center += vertices[i];
        }
        return center / float(MAX_VERTICES);
      }
      
      // 计算到中心点的归一化距离
      float calculateNormalizedDistance(vec2 point) {
        vec2 center = calculateCenter();
        float maxDist = 0.0;
        
        // 计算到中心点的最大距离
        for(int i = 0; i < MAX_VERTICES; i++) {
          float dist = length(vertices[i] - center);
          maxDist = max(maxDist, dist);
        }
        
        // 计算当前点到中心点的距离并归一化
        float distToCenter = length(point - center);
        return distToCenter / maxDist;
      }
      
      // 平滑的插值函数
      float smoothInterpolation(float x) {
        return x * x * (3.0 - 2.0 * x);
      }
      
      void main() {
        // 默认使用基础颜色和透明度
        vec3 finalColor = baseColor;
        float alpha = baseOpacity;
        
        // 如果没有顶点，显示纯色
        if(MAX_VERTICES <= 0) {
          gl_FragColor = vec4(baseColor, alpha);
          return;
        }
        
        // 检查是否在多边形内部
        bool inside = isInside(vUv);
        
        // 如果不在多边形内部，完全透明
        if(!inside) {
          discard;
          return;
        }
        
        // 计算归一化的距离
        float normalizedDist = calculateNormalizedDistance(vUv);
        
        // 使用平滑的插值函数计算发光强度，并应用宽度和衰减
        float glowStrength = 1.0 - smoothInterpolation(clamp(normalizedDist / glowWidth, 0.0, 1.0));
        glowStrength = pow(glowStrength, glowFalloff);  // 添加衰减效果
        
        // 应用发光强度
        glowStrength *= glowIntensity;
        
        // 混合颜色
        finalColor = mix(baseColor, glowColor, glowStrength);
        
        // 设置透明度
        if(baseOpacity < 0.01) {
          alpha = glowStrength;
        } else {
          alpha = max(baseOpacity, glowStrength);
        }
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  };
};

// 根据类型选择着色器
const createGlowShader = (vertices: THREE.Vector2[], type: 'edge' | 'center' = 'edge') => {
  return type === 'edge' ? createEdgeGlowShader(vertices) : createCenterGlowShader(vertices);
};

/**
 * 创建内发光材质
 * 这个材质会沿着多边形边缘向内部产生渐变发光效果
 */
export const createGradientGlowMaterial = (options: GradientGlowMaterialOptions = {}): THREE.Material => {
  const {
    glowColor = new THREE.Color(0.0, 0.5, 1.0),  // 默认改为蓝色发光
    baseColor = new THREE.Color(1.0, 1.0, 1.0),  // 默认白色背景
    glowIntensity = 1.0,                         // 发光强度
    glowWidth = 0.15,                            // 默认边缘15%区域发光
    glowFalloff = 1.8,                           // 发光衰减曲线参数
    vertices = [],                               // 预处理的顶点（可选）
    debugMode = false,                           // 默认不启用调试模式
    glowType = 'edge'                            // 默认使用边缘发光效果
  } = options;

  // 确保颜色是THREE.Color类型
  const glowColorObj = glowColor instanceof THREE.Color ? glowColor : new THREE.Color(glowColor);
  const baseColorObj = baseColor instanceof THREE.Color ? baseColor : new THREE.Color(baseColor);

  // 如果开启调试模式，则显示棋盘格纹理
  if (debugMode) {
    const checkerTexture = createCheckerTexture();
    if (checkerTexture) {
      return new THREE.MeshBasicMaterial({
        map: checkerTexture,
        side: THREE.DoubleSide,
        transparent: true
      });
    }
  }

  // 创建着色器
  const shader = createGlowShader(vertices, glowType);
  
  // 创建自定义着色器材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: glowColorObj },
      baseColor: { value: baseColorObj },
      baseOpacity: { value: 0.0 },         // 默认背景完全透明
      glowIntensity: { value: glowIntensity },
      glowWidth: { value: glowWidth },
      glowFalloff: { value: glowFalloff },
      vertices: { 
        value: vertices.map(v => new THREE.Vector2(v.x, v.y))
      }
    },
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    side: THREE.DoubleSide,
    transparent: true                   // 启用透明
  });
  
  // 更新网格顶点数据
  (material as any).updateFromGeometry = (geometry: THREE.BufferGeometry) => {
    try {
      // 提取顶点
      const verts = extractVerticesFromGeometry(geometry);
      
      // 顶点排序，确保按照顺时针或逆时针顺序
      const sortVerticesClockwise = (vertices: THREE.Vector2[]): THREE.Vector2[] => {
        // 计算中心点
        const center = new THREE.Vector2();
        vertices.forEach(v => center.add(v));
        center.divideScalar(vertices.length);
        
        // 计算每个顶点与中心点连线的角度
        return vertices.slice().sort((a, b) => {
          const angleA = Math.atan2(a.y - center.y, a.x - center.x);
          const angleB = Math.atan2(b.y - center.y, b.x - center.x);
          return angleA - angleB;
        });
      };
      
      // 确保顶点数量充足且按顺序排列
      if (verts.length >= 3) {
        // 对顶点进行排序
        const sortedVerts = sortVerticesClockwise(verts);
        

        material.uniforms.vertices.value = sortedVerts;
        
        // 重新创建着色器以更新顶点数量
        const newShader = createGlowShader(sortedVerts, glowType);
        material.fragmentShader = newShader.fragmentShader;
        material.vertexShader = newShader.vertexShader;
        material.needsUpdate = true;
      } else {
        // 设置一个默认的多边形作为备用
        const defaultVerts = [
          new THREE.Vector2(0.1, 0.1),
          new THREE.Vector2(0.9, 0.1),
          new THREE.Vector2(0.9, 0.9),
          new THREE.Vector2(0.1, 0.9)
        ];
        material.uniforms.vertices.value = defaultVerts;
        
        // 使用默认顶点创建着色器
        const defaultShader = createGlowShader(defaultVerts, glowType);
        material.fragmentShader = defaultShader.fragmentShader;
        material.vertexShader = defaultShader.vertexShader;
        material.needsUpdate = true;
      }
    } catch (error) {
      console.error('更新内发光材质时出错:', error);
    }
    
    return material;
  };
  
  // 兼容旧API
  (material as any).updateMeshSize = (mesh: THREE.Mesh) => {
    if (mesh && mesh.geometry) {
      (material as any).updateFromGeometry(mesh.geometry);
    }
  };
  
  return material;
}; 