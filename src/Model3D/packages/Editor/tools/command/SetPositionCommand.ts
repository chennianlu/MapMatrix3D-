import { Command } from './Command.js';
import { Object3DType } from '../../../../src/types'
/**
 * @param editor Editor
 * @constructor
 */
class SetPositionCommand extends Command {
    oldPosition: any;
    newPosition: any;

    constructor(editor, object: Object3DType, newPosition: number[], oldPosition: number[]) {

        super(editor);

        this.type = 'SetPositionCommand';
        this.name = 'Set Position';
        this.updatable = true;

        this.object = object;

        this.newPosition = [...newPosition];
        this.oldPosition = [...oldPosition];

    }

    execute() {
        this.object.setWorldPosition(this.newPosition);
    }

    undo() {
        this.object.setWorldPosition(this.oldPosition);
    }

    update(command) {
        this.newPosition = [...command.newPosition];
    }

}

export { SetPositionCommand };
