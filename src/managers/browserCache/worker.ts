import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { browserCache } from './BrowserDB';

self.onmessage = e => {
  const model = e.data;
  dealData(model);
};

async function dealData(model: string[]) {
  const resources = [];
  const url = 'index.gltf';
  const exporter = new GLTFExporter();
  const loader = new GLTFLoader();
  for (let path of model) {
    if (!path.endsWith('/')) {
      path += '/';
    }
    const uri = path + url;
    const gltf = await loader.loadAsync(uri);
    const model = (await exporter.parseAsync(gltf.scene, { binary: true })) as ArrayBuffer;
    const blob = new Blob([model]);

    resources.push([uri, blob]);
  }
  browserCache.setData<Blob>(resources);

  return true;
}
