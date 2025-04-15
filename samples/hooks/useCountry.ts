import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { deepMerge } from '../utils/index.ts';

// 基础线条材质选项接口
interface BaseLineMaterialOptions {
    color?: THREE.Color | number | string;
    opacity?: number;
    transparent?: boolean;
    depthTest?: boolean;
}

// 光斑材质选项接口
interface GlowSpotMaterialOptions {
    color?: THREE.Color | number | string;
    speed?: number;
    totalLength?: number;
    opacity?: number;
    transparent?: boolean;
    depthTest?: boolean;
}

// 自定义的ShaderMaterial，添加updateTime方法
interface GlowingMaterial extends THREE.ShaderMaterial {
    updateTime: (time: number) => void;
}

// 自定义的Group，添加updateAnimation方法
interface AnimatedLineGroup extends THREE.Group {
    updateAnimation: (time: number) => void;
}

// 国家线条材质选项接口
interface CountryLineMaterialOptions {
    lineColor?: THREE.Color | number | string;
    linewidth?: number;
    lineOpacity?: number;
    glowColor?: THREE.Color | number | string;
    glowOpacity?: number;
    glowSpeed?: number;
    speedFactors?: number[];
    depthTest?: boolean;
}

// 国家线条类型
type LineType = 'Line' | 'LineLoop' | 'LineSegments' | 'Line2';

// GeoJSON接口
interface GeoJSONFeature {
    geometry: {
        coordinates: number[][][][];
    };
    properties: Record<string, any>;
}

interface GeoJSON {
    features: GeoJSONFeature[];
}

const useCountryLine = () => {
    /**
     * 创建流光效果
     * 采用双材质方法：基础线条 + 流光效果
     */

    // 基础线条着色器
    const baseLineVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const baseLineFragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    
    void main() {
      // 绘制更明显的亮灰色基础线条
      vec3 baseColor = vec3(0.7, 0.75, 0.8); // 亮灰色
      gl_FragColor = vec4(baseColor, opacity * 0.7);
    }
  `;

    // 流光点着色器 - 绝对简单版
    const glowingSpotVertexShader = `
    uniform float time;
    uniform float speed;
    uniform float totalLength;
    attribute float linePosition;
    varying float vIntensity;
    varying float vPosition; // 传递位置信息用于渐变效果
    
    void main() {
      // 计算光斑位置
      float spotPos = mod(time * speed, totalLength);
      
      // 计算当前点与光斑的距离
      float dist = abs(linePosition - spotPos);
      // 考虑环形
      dist = min(dist, abs(linePosition - (spotPos + totalLength)));
      dist = min(dist, abs(linePosition - (spotPos - totalLength)));
      
      // 计算强度
      float spotWidth = 1.2; // 稍微加宽光斑
      vIntensity = exp(-dist * dist / (2.0 * spotWidth * spotWidth));
      
      // 传递归一化位置给片元着色器，用于渐变效果
      vPosition = linePosition / totalLength;
      
      // 透明度小于0.05的片元直接丢弃，优化性能
      if (vIntensity < 0.05) {
        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
        return;
      }
      
      // 正常渲染
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const glowingSpotFragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    varying float vIntensity;
    varying float vPosition;
    
    void main() {
      // 丢弃低强度片元
      if (vIntensity < 0.05) discard;
      
      // 蓝色辉光渐变效果
      vec3 deepBlue = vec3(0.0, 0.3, 0.8);
      vec3 lightBlue = vec3(0.2, 0.8, 1.0);
      vec3 brightCyan = vec3(0.4, 0.9, 1.0);
      
      // 根据强度和位置调整颜色
      vec3 gradientColor = mix(deepBlue, lightBlue, vIntensity);
      // 添加一点随机感
      gradientColor = mix(gradientColor, brightCyan, sin(vPosition * 6.28) * 0.3 + 0.7);
      
      // 最终的辉光颜色
      vec3 glowColor = gradientColor;
      vec3 finalColor = glowColor * vIntensity;
      
      // 增强亮度，更柔和的辉光效果
      finalColor += glowColor * vIntensity * vIntensity * 1.5;
      
      // 应用用户指定的透明度
      gl_FragColor = vec4(finalColor, vIntensity * opacity);
    }
  `;

    /**
     * 创建基础线条材质
     */
    const createBaseLineMaterial = (options: BaseLineMaterialOptions = {}): THREE.ShaderMaterial => {
        const defaultOptions = {
            color: new THREE.Color(0xb0b8c0), // 亮灰色
            opacity: 0.6, // 提高不透明度
            transparent: true,
            depthTest: false,
        };

        const finalOptions = { ...defaultOptions, ...options };

        const material = new THREE.ShaderMaterial({
            vertexShader: baseLineVertexShader,
            fragmentShader: baseLineFragmentShader,
            transparent: true,
            depthTest: finalOptions.depthTest !== undefined ? finalOptions.depthTest : false,
            uniforms: {
                color: {
                    value:
                        finalOptions.color instanceof THREE.Color
                            ? finalOptions.color
                            : new THREE.Color(finalOptions.color),
                },
                opacity: { value: finalOptions.opacity },
            },
        });

        return material;
    };

    /**
     * 创建光斑材质
     */
    const createGlowSpotMaterial = (options: GlowSpotMaterialOptions = {}): GlowingMaterial => {
        const defaultOptions = {
            color: new THREE.Color(0x0080ff), // 更深蓝色
            speed: 5.0, // 降低默认速度
            totalLength: 100.0,
            opacity: 0.9, // 默认透明度
            transparent: true,
            depthTest: false,
        };

        const finalOptions = { ...defaultOptions, ...options };

        const material = new THREE.ShaderMaterial({
            vertexShader: glowingSpotVertexShader,
            fragmentShader: glowingSpotFragmentShader,
            transparent: true,
            depthTest: finalOptions.depthTest !== undefined ? finalOptions.depthTest : false,
            blending: THREE.AdditiveBlending, // 加法混合，让光点更亮
            uniforms: {
                color: {
                    value:
                        finalOptions.color instanceof THREE.Color
                            ? finalOptions.color
                            : new THREE.Color(finalOptions.color),
                },
                opacity: { value: finalOptions.opacity },
                time: { value: 0.0 },
                speed: { value: finalOptions.speed },
                totalLength: { value: finalOptions.totalLength },
            },
        }) as GlowingMaterial;

        // 添加更新方法
        material.updateTime = (time: number): void => {
            material.uniforms.time.value = time;
        };

        return material;
    };

    /**
     * 创建国家平面边线
     * @param data 地图数据
     * @param materialOptions 材质参数配置
     * @param lineType 线条类型：'LineLoop', 'Line', 'LineSegments'或'Line2'
     * @returns 线条组
     */
    const createCountryFlatLine = (
        data: GeoJSON,
        materialOptions: CountryLineMaterialOptions = {},
        lineType: LineType = 'LineLoop'
    ): AnimatedLineGroup => {
        // 使用标准材质(Line2需要特殊处理)
        if (lineType === 'Line2') {
            // Line2需要特殊处理，将新参数转换为Line2兼容的参数
            const lineOptions = {
                color: materialOptions.lineColor || 0xb0b8c0,
                linewidth: materialOptions.linewidth || 0.001,
                opacity: materialOptions.lineOpacity || 0.6,
                transparent: true,
                depthTest: materialOptions.depthTest !== undefined ? materialOptions.depthTest : false,
            };

            const material = new LineMaterial(lineOptions);

            let features = data.features;
            let lineGroup = new THREE.Group() as AnimatedLineGroup;

            for (let i = 0; i < features.length; i++) {
                const element = features[i];
                element.geometry.coordinates.forEach((coords, idx) => {
                    // 每一块的点数据
                    const points: number[] = [];

                    coords[0].forEach(item => {
                        points.push(item[0], item[1], 0);
                    });

                    // 根据每一块的点数据创建线条
                    const geometry = new LineGeometry();
                    geometry.setPositions(points);
                    const line = new Line2(geometry, material);
                    line.computeLineDistances();
                    line.name = 'countryLine2';

                    // 将线条插入到组中
                    lineGroup.add(line);
                });
            }

            // 添加空的更新动画方法以符合接口
            lineGroup.updateAnimation = (time: number): void => {
                // Line2模式下没有流光动画
            };

            return lineGroup;
        } else {
            // 创建组合
            let features = data.features;
            let lineGroup = new THREE.Group() as AnimatedLineGroup;

            // 创建两组线条：基础线和光斑线
            const baseLines = new THREE.Group();
            const glowingSpots = new THREE.Group();

            // 获取参数 - 不再兼容旧参数
            const lineColor = materialOptions.lineColor || 0xb0b8c0; // 基础线条颜色
            const lineOpacity = materialOptions.lineOpacity || 0.6; // 基础线条不透明度
            const glowColor = materialOptions.glowColor || 0x0080ff; // 流动光斑颜色
            const glowOpacity =
                materialOptions.glowOpacity !== undefined ? materialOptions.glowOpacity : 0.9; // 流动光斑不透明度
            const glowSpeed = materialOptions.glowSpeed !== undefined ? materialOptions.glowSpeed : 2.5; // 流动光斑基础速度
            const speedFactors = materialOptions.speedFactors || [1.2, 0.6, -0.8]; // 流动光斑速度因子

            // 创建基础线材质 - 使用自定义参数
            const baseLineMaterial = createBaseLineMaterial({
                color: lineColor,
                opacity: lineOpacity,
                depthTest: materialOptions.depthTest,
            });

            // 记录所有创建的流光材质(用于动画更新)
            const glowingMaterials: GlowingMaterial[] = [];

            // 记录总长度，用于计算平均速度
            let totalPathLength = 0;
            let pathCount = 0;

            // 第一阶段：计算总长度
            for (let i = 0; i < features.length; i++) {
                const element = features[i];
                element.geometry.coordinates.forEach((coords, idx) => {
                    const points: THREE.Vector3[] = [];

                    coords[0].forEach(item => {
                        points.push(new THREE.Vector3(item[0], item[1], 0));
                    });

                    if (points.length > 1) {
                        // 计算路径长度
                        let pathLength = 0;
                        for (let j = 1; j < points.length; j++) {
                            pathLength += points[j].distanceTo(points[j - 1]);
                        }

                        // 如果是LineLoop，添加回到起点的距离
                        if (lineType === 'LineLoop') {
                            pathLength += points[0].distanceTo(points[points.length - 1]);
                        }

                        totalPathLength += pathLength;
                        pathCount++;
                    }
                });
            }

            // 计算平均路径长度，用于设置合适的流光速度
            const avgPathLength = totalPathLength / (pathCount || 1);
            const baseSpeed = glowSpeed; // 使用用户定义的基础速度

            // 第二阶段：创建实际线条
            for (let i = 0; i < features.length; i++) {
                const element = features[i];
                element.geometry.coordinates.forEach((coords, idx) => {
                    const points: THREE.Vector3[] = [];

                    coords[0].forEach(item => {
                        points.push(new THREE.Vector3(item[0], item[1], 0));
                    });

                    if (points.length > 1) {
                        // 创建基础线
                        const baseGeometry = new THREE.BufferGeometry().setFromPoints(points);

                        // 创建对应类型的线条
                        let baseLine: THREE.Line | THREE.LineLoop | THREE.LineSegments;

                        if (lineType === 'Line') {
                            baseLine = new THREE.Line(baseGeometry, baseLineMaterial);
                        } else if (lineType === 'LineLoop') {
                            baseLine = new THREE.LineLoop(baseGeometry, baseLineMaterial);
                        } else {
                            baseLine = new THREE.LineSegments(baseGeometry, baseLineMaterial);
                        }

                        baseLine.name = 'countryBaseLine';
                        baseLines.add(baseLine);

                        // 如果需要流光效果（透明度大于0且速度不为0），则创建流光线
                        if (glowOpacity > 0 && glowSpeed !== 0) {
                            // 计算路径长度
                            let pathLength = 0;
                            const cumulativeDistances: number[] = [0];

                            for (let j = 1; j < points.length; j++) {
                                const segmentLength = points[j].distanceTo(points[j - 1]);
                                pathLength += segmentLength;
                                cumulativeDistances.push(pathLength);
                            }

                            // 如果是LineLoop，添加回到起点的距离
                            if (lineType === 'LineLoop' && points.length > 0) {
                                const segmentLength = points[0].distanceTo(points[points.length - 1]);
                                pathLength += segmentLength;
                            }

                            // 调整速度，使其与路径长度成正比
                            const speedFactor = Math.sqrt(pathLength / avgPathLength);
                            const speed = baseSpeed * speedFactor;

                            // 对每个流光点使用单独的材质和速度
                            // 使用用户定义的速度因子
                            speedFactors.forEach((factor, spotIndex) => {
                                const spotSpeed = speed * factor;
                                const spotMaterial = createGlowSpotMaterial({
                                    color: glowColor,
                                    speed: spotSpeed,
                                    totalLength: pathLength,
                                    opacity: glowOpacity,
                                    depthTest: materialOptions.depthTest,
                                });

                                glowingMaterials.push(spotMaterial);

                                // 创建几何体，为每个顶点设置线路位置属性
                                const spotGeometry = new THREE.BufferGeometry().setFromPoints(points);
                                const linePositions = new Float32Array(points.length);

                                for (let j = 0; j < points.length; j++) {
                                    linePositions[j] = cumulativeDistances[j];
                                }

                                spotGeometry.setAttribute(
                                    'linePosition',
                                    new THREE.BufferAttribute(linePositions, 1)
                                );

                                // 创建流光点线
                                let spotLine: THREE.Line | THREE.LineLoop | THREE.LineSegments;

                                if (lineType === 'Line') {
                                    spotLine = new THREE.Line(spotGeometry, spotMaterial);
                                } else if (lineType === 'LineLoop') {
                                    spotLine = new THREE.LineLoop(spotGeometry, spotMaterial);
                                } else {
                                    spotLine = new THREE.LineSegments(spotGeometry, spotMaterial);
                                }

                                spotLine.name = `countrySpotLine${spotIndex}`;
                                glowingSpots.add(spotLine);
                            });
                        }
                    }
                });
            }

            // 添加基础线和流光点到组
            lineGroup.add(baseLines);
            lineGroup.add(glowingSpots);

            // 添加更新方法
            lineGroup.updateAnimation = (time: number): void => {
                glowingMaterials.forEach(material => {
                    if (material && material.updateTime) {
                        material.updateTime(time);
                    }
                });
            };

            return lineGroup;
        }
    };

    return {
        createCountryFlatLine,
    };
};

export default useCountryLine; 