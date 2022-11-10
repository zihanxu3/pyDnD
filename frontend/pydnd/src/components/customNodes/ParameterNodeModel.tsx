import { NodeModel, DefaultPortModel, PortModelAlignment, DefaultNodeModel } from '@projectstorm/react-diagrams';
import { DefaultNodeModelOptions } from '@projectstorm/react-diagrams-defaults';

export interface ParameterNodeModelOptions extends DefaultNodeModelOptions {
	name?: string;
	color?: string;
	mode?: string;
    onDoubleClick?: () => void;
}

export class ParameterNodeModel extends DefaultNodeModel {
	// For determining node type
	mode: string;

	// For variable nodes 
	type: string;
	value: string;

	// For functional nodes
	functionInputs: string[];
	functionOutputs: string[];
	functionBody: string;


    onDoubleClick: () => void;

	constructor(options: ParameterNodeModelOptions = {}) {
		super({
			...options,
			type: 'ts-custom-node'
		});
        this.onDoubleClick = options.onDoubleClick;
		this.type = '';
		this.value = '';
		this.mode = options.mode;
	}

	getNodeMode(): string {
		return this.mode;
	}

	getValueAndType() {
		return [this.value, this.type];
	}
	
	getFuntionInputs(): string {
		if (typeof this.functionInputs === 'undefined') { 
			return '';
		}
		return this.functionInputs.join(',');
	}

	getFuntionOutputs(): string {
		if (typeof this.functionOutputs === 'undefined') { 
			return '';
		}
		return this.functionOutputs.join(',');
	}
	
	getFuntionBody(): string {
		return this.functionBody;
	}

    setValueAndType(value: string, type: string): void {
        this.value = value;
		this.type = type;
    }

	setFunctionParams(functionInputs: string, functionOutputs: string, functionBody: string): void {
		if (functionInputs !== '') this.functionInputs = functionInputs.split(',');
		if (functionOutputs !== '') this.functionOutputs = functionOutputs.split(',');
		this.functionBody = functionBody;
	}

	addAllInAndOuts() {
		var prev = '';
		var counter = 0;
		if (this.functionInputs) {
			for (var val of this.functionInputs){
				if (val === prev) counter += 1;
				else counter = 0;
				this.addInPort('I' + '-' + val + '-' + String(counter));
				prev = val;
			}
		}

		prev = '';
		counter = 0;
		if (this.functionOutputs) {
			for (var val of this.functionOutputs){
				if (val === prev) counter += 1;
				else counter = 0;
				this.addOutPort('O' + '-' + val + '-' + String(counter));
				prev = val;
			}
		}
		return;
	}

	serialize() {
		if (this.mode === 'variable') {
			return {
				...super.serialize(),
				value: this.value,
				type: this.type
			};
		} else if (this.mode === 'function') {
			return {
				...super.serialize(),
				functionInputs: this.functionInputs,
				functionOutputs: this.functionOutputs,
				functionBody: this.functionBody,
			};
		} else if (this.mode === 'output') {
			return {
				...super.serialize(),
			}
		}
	}

	deserialize(event): void {
		super.deserialize(event);
		if (event.data.mode === 'variable') {
			this.value = event.data.value;
			this.type = event.data.type;
		} else if ( event.data.mode === 'function') {
			this.functionInputs = event.data.functionInputs;
			this.functionOutputs = event.data.functionInputs;
			this.functionBody = event.data.functionBody;
		}
	}
}