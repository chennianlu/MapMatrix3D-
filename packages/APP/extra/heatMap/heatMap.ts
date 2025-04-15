interface HeatMapConfig {
    gradient: object;
    radius: number;
    width: number;
    height: number;
    min: number;
    max: number;
    container: HTMLElement
}

interface PointData {
    x: number;
    y: number;
    value: number;
}

export default class HeatMap {
    static defaultConfig = {
        gradient: {
            0.3: "blue",
            0.5: "lime",
            0.7: "yellow",
            1: "red"
        },
        min: 0,
        max: 100,
        radius: 40,
        width: 100,
        height: 100
    }
    private config!: HeatMapConfig;
    public canvas = this.createCanvas();
    private ctx = this.canvas.getContext('2d');
    private data: PointData[] = [];


    constructor(config: HeatMapConfig) {
        this.initConfig(config);
    }

    private initConfig(config: HeatMapConfig) {
        // if(!config.container) {
        //     throw Error('no container');
        // }
        this.config = {
            ...HeatMap.defaultConfig,
            ...config
        };
        const { width, height } = this.config;
        this.canvas.width = width;
        this.canvas.height = height;
        // this.config.container.appendChild(this.canvas);
    }

    initData(data: PointData[]) {
        this.data = data;
        this.render();
    }

    private render() {
        this.renderAlpha();
        this.putColor()
    }

    // 绘制alpha通道的圆
    private renderAlpha() {
        const shadowCanvas = this.createShadowTpl();
        const { min, max } = this.config;
        for (let point of this.data) {
            const alpha = (point.value - min) / (max - min);
            this.ctx!.globalAlpha = alpha;
            this.ctx!.drawImage(shadowCanvas, point.x, point.y);
        }
    }

    // 为alpha通道的圆着色
    private putColor() {
        const colorData = this.createColordata();
        const imgData = this.ctx!.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const { data } = imgData

        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (value) {
                data[i - 3] = colorData[4 * value];
                data[i - 2] = colorData[4 * value + 1];
                data[i - 1] = colorData[4 * value + 2];
            }
        }
        this.ctx!.putImageData(imgData, 0, 0);
    }

    private createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.background = 'rgba(0,75,255,1)'
        return document.createElement('canvas')
    }

    private createColordata() {
        const cCanvas = this.createCanvas();
        const cCtx = cCanvas.getContext('2d');
        cCanvas.width = 256;
        cCanvas.height = 1;
        const tuple: [number, number, number, number] =
            [0, 0, cCanvas.width, cCanvas.height]

        const grd = cCtx!.createLinearGradient(...tuple);
        const { gradient } = this.config;
        for (let key in gradient) {
            //@ts-ignore
            grd.addColorStop(parseFloat(key), gradient[key]);
        }
        cCtx!.fillStyle = grd;
        cCtx!.fillRect(0, 0, cCanvas.width, cCanvas.height);
        return cCtx!.getImageData(...tuple).data;
    }

    /**
     * 离屏canvas绘制一个黑色（rgb都是0，方便处理）的alpha通道的圆
     */
    private createShadowTpl() {
        const tCanvas = this.createCanvas();
        const tCtx = tCanvas.getContext('2d');
        const blur = 0;
        const radius = this.config.radius;
        tCanvas.width = 2 * radius;
        tCanvas.height = 2 * radius;
        const grd = tCtx!.createRadialGradient(radius, radius, blur, radius, radius, radius);
        grd.addColorStop(0, 'rgba(0,0,0,1)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        tCtx!.fillStyle = grd;
        tCtx!.fillRect(0, 0, 2 * radius, 2 * radius);
        return tCanvas;
    }
}
