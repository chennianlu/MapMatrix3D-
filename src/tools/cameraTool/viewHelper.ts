import { ViewHelper as ViewHelperBase } from './viewHelper_ex';

class ViewHelper extends ViewHelperBase {
  visualDom: HTMLElement;

  constructor(editorCamera, container) {
    super(editorCamera, container);

    const dom = document.createElement('div');
    this.visualDom = dom;
    dom.id = 'viewHelper';
    dom.style.position = 'absolute';
    dom.style.right = '0px';
    dom.style.top = '0px';
    dom.style.height = '128px';
    dom.style.width = '128px';
    dom.style.zIndex = '9';
    dom.style.cursor = 'pointer';

    dom.addEventListener('pointerup', event => {
      event.stopPropagation();

      this.handleClick(event);
    });

    dom.addEventListener('pointerdown', function (event) {
      event.stopPropagation();
    });

    container.appendChild(dom);
  }
}

export { ViewHelper };
