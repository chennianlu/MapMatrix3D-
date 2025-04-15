import { Command } from './Command.js';
import { Object3DType } from '../../../../src/types'
/**
 * @param editor Editor
 * @constructor
 */
class SetScaleCommand extends Command {
	oldScale: any;
	newScale: any;

	constructor(editor, object: Object3DType, newScale: number[], oldScale: number[]) {

		super(editor);

		this.type = 'SetScaleCommand';
		this.name = 'Set Scale';
		this.updatable = true;

		this.object = object;

		this.newScale = [...newScale];
		this.oldScale = [...oldScale];

	}

	execute() {
		this.object.setScale(this.newScale);
	}

	undo() {
		this.object.setScale(this.oldScale);
	}

	update(command: SetScaleCommand) {
		this.newScale = [...command.newScale];
	}

}

export { SetScaleCommand };
