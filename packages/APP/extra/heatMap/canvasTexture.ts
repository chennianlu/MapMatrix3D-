import * as THREE from 'three';
import HeatMap from './heatMap';

interface HeatMapConfig {
    gradient?: object;
    radius?: number;
    width?: number;
    height?: number;
    min?: number;
    max?: number;
    container: HTMLElement
}


export default class CanvasTextureWrap {
    private canvas: null | HTMLCanvasElement;
    private width: number;
    private height: number;
    // canvas: HTMLCanvasElement;
    constructor(width: number, height: number) {
        this.canvas = null;
        this.width = width * 500;
        this.height = height * 500;
    }
    /**
     * 生成温度云图
     */
    createHeatMap(heatMapData?: any) {
        const maxNum = 100;
        const heatmap = new HeatMap({
            container: document.body,
            gradient: {
                0.3: "blue",
                0.5: "lime",
                0.7: "yellow",
                1: "red"
            },
            min: 0,
            max: maxNum,
            radius: Math.floor(Math.min(this.width, this.height) / 8),
            width: this.width,
            height: this.height
        });

        const data = [];
        for (let i = 0; i < maxNum; i++) {
            data.push({
                x: Math.random() * this.width * 0.8,
                y: Math.random() * this.height * 0.8,
                value: Math.random() * maxNum
            })
        }

        heatmap.initData(data);
        this.canvas = heatmap.canvas;
        // document.body.appendChild(this.canvas)
        return this.createTexture(this.canvas);

    }
    /**
     * 创建texture 3d对象
     */
    createTexture(canvas: HTMLCanvasElement) {


        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        // texture.repeat.set( 1, 3.5 );
        return texture;

    }
}
