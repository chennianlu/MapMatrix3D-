import GUI from 'lil-gui';

const CORE_GUI_FOLDER = 'core_folder';

/**
 * 基于lil-gui封装的调试工具
 */
class DebugTool {
  private _gui: GUI;
  private _folder: Map<string, any> = new Map();
  debugger: boolean;
  coreFolder: GUI;

  constructor() {
    this.init();
    this.setDebugger(false);
    this.coreFolder = this._gui.addFolder(CORE_GUI_FOLDER);
  }

  init() {
    this._gui = new GUI({ width: 280 });
  }
  /**
   * 开启或关闭调试工具
   * @param state
   */
  setDebugger(state: boolean) {
    this.debugger = state;
    if (state === true) {
      this._gui.show();
    } else if (state === false) {
      this._gui.hide();
    }
  }

  /**
   * 增加GUI组
   * @param name
   * @param isPrivate 标识当前folder 不允许被clear方法清楚
   * @returns
   */
  addFolder(name: string): GUI {
    if (this._folder.has(name)) {
      return this._folder.get(name);
    }
    const folder = this._gui.addFolder(name);
    this._folder.set(name, folder);
    return folder;
  }

  /**
   * 获取GUI组
   * @param name
   * @returns
   */
  getFolder(name): GUI | null {
    let folder = null;
    folder = this._folder.get(name);
    return folder;
  }

  /**
   * 清空当前已经添加的folder
   */
  clear() {
    for (let [, folder] of this._folder) {
      folder.destroy();
    }
    this._folder.clear();
  }

  getGUI() {
    return this._gui;
  }
}

export const debugTool = new DebugTool();
