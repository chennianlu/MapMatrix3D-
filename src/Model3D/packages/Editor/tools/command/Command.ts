import { Editor } from '../../index';
import { Object3DType } from '../../../../src/types'
/**
 * @param editor pointer to main editor object used to initialize
 *        each command object with a reference to the editor
 * @constructor
 */

class Command {
    id: number;
    inMemory: boolean;
    updatable: boolean;
    type: string;
    name: string;
    editor: Editor;
    object: Object3DType
    constructor(editor) {

        this.id = - 1;
        this.inMemory = false;
        this.updatable = false;
        this.type = '';
        this.name = '';
        this.editor = editor;

    }

    toJSON(obj?: any) {

        const output: any = {};
        output.type = this.type;
        output.id = this.id;
        output.name = this.name;
        return output;

    }

    fromJSON(json) {

        this.inMemory = true;
        this.type = json.type;
        this.id = json.id;
        this.name = json.name;

    }

}

export { Command };
