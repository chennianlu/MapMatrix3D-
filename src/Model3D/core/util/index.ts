const _lut: string[] = [];

for (let i = 0; i < 256; i++) {
  _lut[i] = (i < 16 ? '0' : '') + i.toString(16);
}
/**
 * 转化为RGB 为 HEX
 * @param {string} data 如：rgb(0,0,0)
 */
export const colorHex = function (data: string) {
  // RGB颜色值的正则
  const reg = /^(rgb|RGB)/;
  const color = data;
  if (reg.test(color)) {
    let strHex = '#';
    // 把RGB的3个数值变成数组
    const colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
    // 转成16进制
    for (let i = 0; i < colorArr.length; i++) {
      let hex = Number(colorArr[i]).toString(16);
      // @ts-ignore
      if (hex.length == '1') {
        hex = '0' + hex;
      }
      strHex += hex;
    }
    return strHex;
  } else {
    return color.toString();
  }
};
/**
 * 转化为HEX 为RGB
 * @param {string} data 如：#ffffff、#fff
 */
export const colorRgb = function (data: string) {
  // 16进制颜色值的正则
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 把颜色值变成小写
  let color = data.toLowerCase();
  if (reg.test(color)) {
    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
    if (color.length === 4) {
      let colorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
      }
      color = colorNew;
    }
    // 处理六位的颜色值，转为RGB
    const colorChange = [];
    for (let i = 1; i < 7; i += 2) {
      colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
    }
    return {
      r: colorChange[0],
      g: colorChange[1],
      b: colorChange[2],
      RGB: 'RGB(' + colorChange.join(',') + ')',
    };
  } else {
    return color;
  }
};

/**
 * 生成uuid
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 * https://www.rfc-editor.org/rfc/rfc4122
 */
export const getUUID = function () {
  const d0 = (Math.random() * 0xffffffff) | 0;
  const d1 = (Math.random() * 0xffffffff) | 0;
  const d2 = (Math.random() * 0xffffffff) | 0;
  const d3 = (Math.random() * 0xffffffff) | 0;
  const uuid =
    _lut[d0 & 0xff] +
    _lut[(d0 >> 8) & 0xff] +
    _lut[(d0 >> 16) & 0xff] +
    _lut[(d0 >> 24) & 0xff] +
    '-' +
    _lut[d1 & 0xff] +
    _lut[(d1 >> 8) & 0xff] +
    '-' +
    _lut[((d1 >> 16) & 0x0f) | 0x40] +
    _lut[(d1 >> 24) & 0xff] +
    '-' +
    _lut[(d2 & 0x3f) | 0x80] +
    _lut[(d2 >> 8) & 0xff] +
    '-' +
    _lut[(d2 >> 16) & 0xff] +
    _lut[(d2 >> 24) & 0xff] +
    _lut[d3 & 0xff] +
    _lut[(d3 >> 8) & 0xff] +
    _lut[(d3 >> 16) & 0xff] +
    _lut[(d3 >> 24) & 0xff];

  // .toLowerCase() here flattens concatenated strings to save heap memory space.
  return uuid.toLowerCase();
};
/**
 * 压缩base64图片格式
 * @param base64Image  base64
 * @param size  压缩后的尺寸 以宽度优先 其次判断高度
 * @param callback
 */
export const compressBase64Image = function (
  base64Image: string,
  size: number,
  callback: (args: any) => void
) {
  let maxW: number, maxH: number;
  if (!size) size = Infinity;
  const image = new Image(); // 创建image对象 相当于创建a标签
  image.addEventListener('load', function (e) {
    // image加载完成后就会触发 也就是src加载后
    let radio; // 压缩比例
    let needCompress = false; // 是否需要压缩
    // image.naturalWidth/naturalHeight H5新属性 获取源生图片的宽高
    if (image.naturalWidth > size) {
      needCompress = true;
      // 获得压缩宽高过后的大小（保证等比例缩放）
      radio = image.naturalWidth / size;
      maxH = image.naturalHeight / radio;
      maxW = size;
    }
    // 看压缩后的高度是否满足 不满足则继续压缩宽高
    if (needCompress === false && image.naturalHeight > size) {
      needCompress = true;
      radio = image.naturalHeight / size;
      maxW = image.naturalWidth / radio;
      maxH = size;
    }
    // 不需要压缩
    if (!needCompress) {
      maxW = image.naturalWidth;
      maxH = image.naturalHeight;
    }
    // 第一次压缩完成
    // 接下来使用canvas进行质量压缩
    const canvas = document.createElement('canvas');
    canvas.height = maxH;
    canvas.width = maxW;
    // document.body.appendChild(canvas)

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    // 防止重新上传覆盖
    ctx!.clearRect(0, 0, maxW, maxH);
    // 传入 视频/图片对象 起始点x 起始点y 绘制宽 绘制高
    ctx!.drawImage(image, 0, 0, maxW, maxH);

    // 接来下就是压缩canvas 通过API将canvas输出成base64格式
    const compressImage = canvas.toDataURL('image/png', 0.8); // 通常压缩是0.8-0.9
    callback && callback(compressImage); // 压缩完成进行后台传输逻辑
    // 压缩完的图片就已经保存在内存(compressImage)中了
    // 接下来移除canvas元素 调用DOM.remove()
    canvas.remove();
    image.remove();
  });
  image.src = base64Image;
};

/**
 * Number toFixed
 * 修复了js浮点数引起的问题和精度限制
 */
export const toFixed = function (num: number, n: number): number {
  if (n > 20 || n < 0) {
    throw new RangeError('toFixed() digits argument must be between 0 and 20');
  }
  if (isNaN(num) || num >= Math.pow(10, 21)) {
    return num;
  }
  if (typeof n == 'undefined' || n == 0) {
    return Math.round(num);
  }

  let result: string | number = num.toString();
  // 判断小数点超出限制情况
  if (/e-/.test(result)) {
    const splitStr = result.split('e-');
    const dot = splitStr[0].split('.')[1] ? splitStr[0].split('.')[1].length : 0;
    if (Number(splitStr[0]) < 0) {
      // @ts-ignore
      result = `-0.${new Array(splitStr[1] - 1).fill(0).toString().replace(/,/g, '')}${-parseInt(splitStr[0] * 10 ** dot)}`;
    } else {
      // @ts-ignore
      result = `0.${new Array(splitStr[1] - 1).fill(0).toString().replace(/,/g, '')}${splitStr[0] * 10 ** dot}`;
    }
  }

  const arr = result.split('.');

  // 整数的情况
  if (arr.length < 2) {
    result += '.';
    for (let i = 0; i < n; i += 1) {
      result += '0';
    }
    return Number(result);
  }

  const integer = arr[0];
  const decimal = arr[1];
  if (decimal.length == n) {
    return Number(result);
  }
  if (decimal.length < n) {
    for (let i = 0; i < n - decimal.length; i += 1) {
      result += '0';
    }
    return Number(result);
  }
  result = integer + '.' + decimal.substr(0, n);
  const last = decimal.substr(n, 1);
  result = Number(result);
  if (result === 0) return 0;
  // 四舍五入，转换为整数再处理，避免浮点数精度的损失
  if (parseInt(last, 10) >= 5) {
    const x = Math.pow(10, n);
    // @ts-ignore
    result =
      result > 0
        ? (Math.round(parseFloat(result) * x) + 1) / x
        : Math.round(parseFloat(result) * x) - 1;
    result = result.toFixed(n);
  }

  return Number(result);
};

/**
 * 对象深拷贝
 * @param target
 * @return {*}
 */
export const deepClone = function <T>(target: T): T {
  // 定义一个变量
  let result;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
    // 如果是一个数组的话
    if (Array.isArray(target)) {
      result = []; // 将result赋值为一个数组，并且执行遍历
      for (const i in target) {
        // 递归克隆数组中的每一项
        result.push(deepClone(target[i]));
      }
      // 判断如果当前的值是null的话；直接赋值为null
    } else if (target === null) {
      result = null;
      // 判断如果当前的值是一个RegExp对象的话，直接赋值
    } else {
      // @ts-ignore
      if (target.constructor === RegExp) {
        result = target;
      } else {
        // 否则是普通对象，直接for in循环，递归赋值对象的所有值
        result = {};
        for (const i in target) {
          // @ts-ignore
          result[i] = deepClone(target[i]);
        }
      }
    }
    // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
    result = target;
  }
  // 返回最终结果
  // @ts-ignore
  return result;
};

/**
 * 比較兩個Array是否完全相等
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
export const isArrayEqual = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/**
 * 防抖函數
 *
 * @export
 * @param {Function} func 需要防抖的函數
 * @param {number} wait 防抖的時間(毫秒)
 * @param {{ timer: NodeJS.Timeout }} [timerObj={ timer: null }] 用於clearTimeout
 * @return {*}  {Function}
 */
export function debounce(
  func: () => void,
  wait: number,
  timerObj: { timer: any } = { timer: null }
): () => void {
  return function () {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    if (timerObj.timer) clearTimeout(timerObj.timer);
    timerObj.timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, args);
    }, wait);
  };
}

/**
 * determine whether it is a `Function`
 */
export const isFunction = (func: any) => {
  return Object.prototype.toString.call(func) === '[object Function]';
};
