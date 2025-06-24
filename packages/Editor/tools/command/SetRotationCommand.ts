import { Command } from './Command.js';
import { Object3DType } from '../../../../src/types'
import * as THREE from 'three';

interface excuteData {
	position: THREE.Vector3,
	rotation: THREE.Euler
}

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newRotation THREE.Euler
 * @param optionalOldRotation THREE.Euler
 * @constructor
 */
class SetRotationCommand extends Command {
	oldData: excuteData;
	newData: excuteData;

	constructor(editor, object: Object3DType, newData: excuteData, oldData: excuteData) {

		super(editor);

		this.type = 'SetRotationCommand';
		this.name = 'Set Rotation';
		this.updatable = true;

		this.object = object;

		this.oldData = oldData;
		this.newData = newData;

	}

	execute() {
		const { position, rotation } = this.newData;
		this.object.position.copy(position);
		this.object.rotation.copy(rotation);
		this.object.updateMatrixWorld(true);
	}

	undo() {
		const { position, rotation } = this.oldData;
		this.object.position.copy(position);
		this.object.rotation.copy(rotation);
		this.object.updateMatrixWorld(true);
		this.object.updateMatrixWorld(true);
	}

	update(command) {
		this.newData = command.newData;
	}

}

export { SetRotationCommand };