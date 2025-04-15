import { Command } from './Command.js';
import { Object3DType } from '../../../../src/types'

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class AddObjectCommand extends Command {
    objectParent: Object3DType;
    constructor(editor, object) {

        super(editor);

        this.type = 'AddObjectCommand';

        this.object = object;
        this.objectParent = object.parent;
        if (object !== undefined) {

            this.name = `Add Object: ${object.name}`;

        }

    }

    execute() {
        this.objectParent.attach(this.object);
    }

    undo() {
        this.objectParent.remove(this.object);
    }

}
export { AddObjectCommand };
