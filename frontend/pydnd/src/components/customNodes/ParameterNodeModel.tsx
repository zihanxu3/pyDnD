import { NodeModel, DefaultPortModel, PortModelAlignment, DefaultNodeModel } from '@projectstorm/react-diagrams';
import { DefaultNodeModelOptions } from '@projectstorm/react-diagrams-defaults';

export interface ParameterNodeModelOptions extends DefaultNodeModelOptions {
	name?: string;
	color?: string;
    onDoubleClick?: () => void;
}

export class ParameterNodeModel extends DefaultNodeModel {
	type: string;
	value: string;
    onDoubleClick: () => void;

	constructor(options: ParameterNodeModelOptions = {}) {
		super({
			...options,
			type: 'ts-custom-node'
		});
        this.onDoubleClick = options.onDoubleClick;
		this.type = '';
		this.value = '';
	}

	getNodeType(): string {
		return 'variable';
	}

	getValueAndType() {
		return [this.value, this.type];
	}

    setValueAndType(value: string, type: string): void {
        this.value = value;
		this.type = type;
    }

	serialize() {
		return {
			...super.serialize(),
			value: this.value,
			type: this.type
		};
	}

	deserialize(event): void {
		super.deserialize(event);
		this.value = event.data.value;
		this.type = event.data.type;
	}
}