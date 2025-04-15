import * as util from '../../util';
import { renderTool } from './index';

class Snapshot {
  private image: HTMLImageElement;
  private lImg: string | null;
  constructor() {
    this.image = new Image(); //dom
    this.lImg = null; //记录base64格式图片
  }

  toImage() {
    const canvas = renderTool.renderer.domElement;
    /**
     * 主动渲染一次场景  截图不需要helperscene
     */
    renderTool.renderOnce({
      helperScene: false,
    });
    this.lImg = canvas.toDataURL('image/png');
    return this.lImg;
  }

  /**
   * base64格式图片压缩
   * @param base64
   * @param size 压缩幅度  数值越大压缩率越高 最大值为8
   * @return {Promise<unknown>}
   */
  async compressBase64Image(base64, size) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      util.compressBase64Image(base64, size, function (url: string) {
        //图片压缩效率是50ms 压缩率35倍左右
        // image.src = url;
        // image.style.display = 'block';
        _this.lImg = url;
        resolve(url);
      });
    });
  }
}

export const snapshot = new Snapshot();
