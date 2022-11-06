import { NodeModel, DefaultPortModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { BaseModelOptions } from '@projectstorm/react-canvas-core';

export interface ParameterNodeModelOptions extends BaseModelOptions {
	value?: string;
    onDoubleClick?: () => void;
}

export class ParameterNodeModel extends NodeModel {
	value: string;
    onDoubleClick: () => void;

	constructor(options: ParameterNodeModelOptions = {}) {
		super({
			...options,
			type: 'ts-custom-node'
		});
		this.value = options.value || 'red';
        this.onDoubleClick = options.onDoubleClick;

		// setup an out port
		this.addPort(
			new DefaultPortModel({
				in: false,
				name: 'out',
                alignment: PortModelAlignment.RIGHT, 
			})
		);
	}

    setValue(input?: string): void {
        this.value = input;
    }

	serialize() {
		return {
			...super.serialize(),
			value: this.value
		};
	}

	deserialize(event): void {
		super.deserialize(event);
		this.value = event.data.value;
	}
}