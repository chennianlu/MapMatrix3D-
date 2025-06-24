import { EnerV3DCore,coreEvent, GeometryObject3D } from "@enerv-3d/core";


const container = document.getElementById('root') as HTMLElement;
const core = new EnerV3DCore(container);
container.appendChild(core.domContainer);
container.appendChild(core.renderTool.css3DRenderer.domElement);
core.domContainer.style.width = container.clientWidth + 'px';
core.domContainer.style.height = container.clientHeight + 'px';

core.sceneEffectTool.setBackground({
    type: 'color',
    color: '#000000'
})

const helper = core._initAxisHelper();
core.scene.add(helper);

const box = new GeometryObject3D({
    geometryType: 'box',
    color: '#eeeeee',
    opacity: .5,
    geometryParam:{
        width: 10,
        height: 10,
        depth: 10
    }
})
core.scene.add(box);

coreEvent.dispatch('CORE_CANVAS_RESIZE', [])





