import { event } from '../event';
import { Editor } from '../index'
import {
    SetPositionCommand,
    SetRotationCommand,
    SetScaleCommand,
    AddObjectCommand,
} from './command'

class History {
    undos: any[];
    redos: any[];
    lastCmdTime: number;
    idCounter: number;
    historyDisabled: boolean;
    editor: Editor;

    constructor(editor) {
        this.editor = editor;
        this.undos = [];
        this.redos = [];
        this.lastCmdTime = Date.now();
        this.idCounter = 0;

        this.historyDisabled = false;
        this.registeEvent();
    }

    registeEvent() {
        event.on('OBJECT_EDITED_CHANGE', (object, type, newValue, oldValue) => {
            switch (type) {
                case Editor_Commands.setPosition:
                    if (this.editor.gizmo.transMode === 'position') {
                        this.execute(new SetPositionCommand(this.editor, object, newValue, oldValue), 'setPosition');
                    }
                    break;
                case Editor_Commands.setRotation:
                    if (this.editor.gizmo.transMode === 'rotation') {
                        this.execute(new SetRotationCommand(this.editor, object, newValue, oldValue), 'setRotation');
                    }
                    break;
                case Editor_Commands.setScale:
                    if (this.editor.gizmo.transMode === 'scale') {
                        this.execute(new SetScaleCommand(this.editor, object, newValue, oldValue), 'setScale');
                    }
                    break;
                case Editor_Commands.setSize:

                    break;
                default:
                    break;
            }
        })

        event.on('OBJECT_ADDED', (object) => {
            this.execute(new AddObjectCommand(this.editor, object,), 'addObject');
        })
    }

    execute(cmd, optionalName) {

        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = Date.now() - this.lastCmdTime;

        const isUpdatableCmd = lastCmd &&
            lastCmd.updatable &&
            cmd.updatable &&
            lastCmd.object === cmd.object &&
            lastCmd.type === cmd.type &&
            lastCmd.script === cmd.script &&
            lastCmd.attributeName === cmd.attributeName;

        if (isUpdatableCmd && cmd.type === 'SetScriptValueCommand') {

            // When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

            lastCmd.update(cmd);
            cmd = lastCmd;

        } else if (isUpdatableCmd && timeDifference < 500) {

            lastCmd.update(cmd);
            cmd = lastCmd;

        } else {

            // the command is not updatable and is added as a new part of the history

            this.undos.push(cmd);
            cmd.id = ++this.idCounter;

        }

        cmd.name = (optionalName !== undefined) ? optionalName : cmd.name;
        cmd.execute();
        cmd.inMemory = true;


        this.lastCmdTime = Date.now();

        // clearing all the redo-commands

        this.redos = [];

    }

    undo() {

        if (this.historyDisabled) {

            alert('Undo/Redo disabled while scene is playing.');
            return;

        }

        let cmd = undefined;

        if (this.undos.length > 0) {

            cmd = this.undos.pop();

            if (cmd.inMemory === false) {

                cmd.fromJSON(cmd.json);

            }

        }

        if (cmd !== undefined) {

            cmd.undo();
            const object = cmd.object;
            if (object) this.editor.selector.setSelection(object);
            this.redos.push(cmd);

        }

        return cmd;

    }

    redo() {

        if (this.historyDisabled) {

            alert('Undo/Redo disabled while scene is playing.');
            return;

        }

        let cmd = undefined;

        if (this.redos.length > 0) {

            cmd = this.redos.pop();

            if (cmd.inMemory === false) {

                cmd.fromJSON(cmd.json);

            }

        }

        if (cmd !== undefined) {

            cmd.execute();
            const object = cmd.object;
            if (object) this.editor.selector.setSelection(object)
            this.undos.push(cmd);

        }

        return cmd;

    }

    clear() {

        this.undos = [];
        this.redos = [];
        this.idCounter = 0;
    }
}
export { History };
