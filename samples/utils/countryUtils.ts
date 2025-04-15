import * as THREE from 'three';
import { GeoJSONData } from './geoDataUtils';
import { deepMerge } from './index.ts';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

/**
 * 线条配置选项接口
 */
export interface CountryLineOptions {
    lineColor: number | THREE.Color;
    lineOpacity: number;
    glowColor: number | THREE.Color;
    glowOpacity: number;
    glowSpeed: number;
    speedFactors: number[];
    depthTest: boolean;
    linewidth?: number; // 仅用于Line2
}

/**
 * 创建国家/省份平面线条
 * @param data 国家/省份GeoJSON数据
 * @param options 线条配置选项
 * @param lineType 线条类型，默认为"Line"
 * @returns 线条对象组
 */
export function createCountryFlatLine(
    data: GeoJSONData,
    options: Partial<CountryLineOptions> = {},
    lineType: 'Line' | 'LineLoop' | 'LineSegments' | 'Line2' = 'Line'
): THREE.Group {
    // 创建组对象用于存放所有线条
    const group = new THREE.Group();

    // 默认选项
    const defaultOptions: CountryLineOptions = {
        lineColor: 0x3a97ff,
        lineOpacity: 0.8,
        glowColor: 0x3a97ff,
        glowOpacity: 0,
        glowSpeed: 0,
        speedFactors: [1, 0.5, -0.7],
        depthTest: true,
    };

    // 合并选项
    const mergedOptions = deepMerge(defaultOptions, options);

    // 遍历省份数据
    const features = data.features;
    if (!features || !Array.isArray(features)) return group;

    // 使用标准材质(Line2需要特殊处理)
    if (lineType === 'Line2') {
        // Line2需要特殊处理，将新参数转换为Line2兼容的参数
        const lineOptions = {
            color: mergedOptions.lineColor instanceof THREE.Color
                ? mergedOptions.lineColor
                : new THREE.Color(mergedOptions.lineColor),
            linewidth: mergedOptions.linewidth || 0.001,
            opacity: mergedOptions.lineOpacity,
            transparent: true,
            depthTest: mergedOptions.depthTest,
        };

        const material = new LineMaterial(lineOptions);

        // 处理每个特征
        features.forEach(feature => {
            if (!feature.geometry || !feature.geometry.coordinates) return;

            const coordinates = feature.geometry.coordinates;
            coordinates.forEach(coords => {
                // 每一块的点数据
                const points: number[] = [];

                if (coords[0] && Array.isArray(coords[0])) {
                    coords[0].forEach(item => {
                        if (Array.isArray(item) && item.length >= 2) {
                            points.push(item[0], item[1], 0);
                        }
                    });
                }

                // 确保有足够的点来创建线
                if (points.length >= 6) { // 至少需要两个点(每个点3个坐标)
                    // 根据每一块的点数据创建线条
                    const geometry = new LineGeometry();
                    geometry.setPositions(points);
                    const line = new Line2(geometry, material);
                    line.computeLineDistances();
                    line.name = 'countryLine2';

                    // 将线条插入到组中
                    group.add(line);
                }
            });
        });
    } else {
        // 用于存储所有点的数组，后面用于创建单个线条
        const allPoints: THREE.Vector3[][] = [];

        // 收集所有点数据
        features.forEach(feature => {
            if (!feature.geometry || !feature.geometry.coordinates) return;

            const coordinates = feature.geometry.coordinates;
            coordinates.forEach(polygon => {
                if (Array.isArray(polygon)) {
                    polygon.forEach(ring => {
                        if (Array.isArray(ring)) {
                            // 提取所有坐标点到一个数组中
                            const points: THREE.Vector3[] = [];
                            ring.forEach(point => {
                                if (Array.isArray(point) && point.length >= 2) {
                                    points.push(new THREE.Vector3(point[0], 0, point[1]));
                                }
                            });

                            if (points.length > 0) {
                                allPoints.push(points);
                            }
                        }
                    });
                }
            });
        });

        // 根据提取的点创建线条
        allPoints.forEach(points => {
            // 创建线条几何体
            const geometry = new THREE.BufferGeometry();
            const vertices: number[] = [];

            // 提取顶点坐标
            points.forEach(point => {
                vertices.push(point.x, point.y, point.z);
            });

            // 设置几何体顶点
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

            // 创建线条材质
            const material = new THREE.LineBasicMaterial({
                color: mergedOptions.lineColor,
                transparent: true,
                opacity: mergedOptions.lineOpacity,
                depthTest: mergedOptions.depthTest,
            });

            // 创建线条
            let line: THREE.Line | THREE.LineLoop | THREE.LineSegments;

            switch (lineType) {
                case 'LineLoop':
                    line = new THREE.LineLoop(geometry, material);
                    break;
                case 'LineSegments':
                    line = new THREE.LineSegments(geometry, material);
                    break;
                default:
                    line = new THREE.Line(geometry, material);
            }

            // 添加光效属性（如果需要）
            if (mergedOptions.glowOpacity > 0 && mergedOptions.glowSpeed > 0) {
                // 添加动画更新方法和必要属性
                (line as any).userData = {
                    originalColor: mergedOptions.lineColor instanceof THREE.Color
                        ? mergedOptions.lineColor
                        : new THREE.Color(mergedOptions.lineColor),
                    glowColor: mergedOptions.glowColor instanceof THREE.Color
                        ? mergedOptions.glowColor
                        : new THREE.Color(mergedOptions.glowColor),
                    glowOpacity: mergedOptions.glowOpacity,
                    glowSpeed: mergedOptions.glowSpeed,
                    speedFactors: mergedOptions.speedFactors,
                    time: 0,
                };

                // 添加动画更新方法
                (line as any).updateAnimation = (time: number) => {
                    const t = time * mergedOptions.glowSpeed;

                    // 对于每个顶点，计算不同的光效强度
                    const vertexCount = vertices.length / 3;
                    const colorData: number[] = [];

                    for (let i = 0; i < vertexCount; i++) {
                        // 使用正弦函数创建流动效果
                        const phase1 = Math.sin((t + i * 0.05) * mergedOptions.speedFactors[0]) * 0.5 + 0.5;
                        const phase2 = Math.sin((t + i * 0.1) * mergedOptions.speedFactors[1]) * 0.5 + 0.5;
                        const phase3 = Math.cos((t + i * 0.15) * mergedOptions.speedFactors[2]) * 0.5 + 0.5;

                        // 取三个波形的最大值作为该顶点的强度
                        const intensity = Math.max(phase1, phase2, phase3);

                        // 添加顶点颜色
                        colorData.push(intensity, intensity, intensity);
                    }

                    // 更新几何体的颜色属性
                    if (!geometry.attributes.color) {
                        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorData, 3));
                        (material as THREE.LineBasicMaterial).vertexColors = true;
                    } else {
                        // 更新已有的颜色数据
                        const colorAttribute = geometry.attributes.color;
                        for (let i = 0; i < colorData.length; i++) {
                            (colorAttribute.array as Float32Array)[i] = colorData[i];
                        }
                        colorAttribute.needsUpdate = true;
                    }
                };
            }

            group.add(line);
        });
    }

    return group;
} 