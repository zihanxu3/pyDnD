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
	fileName: string;

	// For cv nodes
	cvFunction: string;


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
		this.fileName = '';
		this.cvFunction = '';
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

	getCVFunction(): string {
		return this.cvFunction;
	}

    setValueAndType(value: string, type: string): void {
        this.value = value;
		this.type = type;
    }

	setFunctionInputs(functionInputs: string): void {
		if (functionInputs !== '') this.functionInputs = functionInputs.split(',');
	}

	setFunctionOutputs(functionOutputs: string): void {
		if (functionOutputs !== '') this.functionOutputs = functionOutputs.split(',');
	}

	setFunctionBody(functionBody: string): void {
		this.functionBody = functionBody;
	}

	setCVFunction(cvFunction: string): void {
		this.cvFunction = cvFunction;
	}

	addAllInPorts() {
		this.getInPorts().forEach(item => 
			{	
				if (item.getName() !== 'Exec In') this.removePort(item);
			});
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
		return;
	}

	addAllOutPorts() {
		this.getOutPorts().forEach(
			item => 
			{	
				if (item.getName() !== 'Exec Out') this.removePort(item)
			});
		var prev = '';
		var counter = 0;
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
				type: this.type,
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
			};
		} else if (this.mode === 'cv') {
			return {
				...super.serialize(),
				cvFunction: this.cvFunction,
			};
		} else if (this.mode === 'nlp') {
			return {
				...super.serialize(),
				// cvFunction: this.cvFunction,
			};
		} else if (this.mode === 'face') {
			return {
				...super.serialize(),
				// cvFunction: this.cvFunction,
			};
		}	
	}

	deserialize(event): void {
		super.deserialize(event);
		if (event.data.mode === 'variable') {
			this.value = event.data.value;
			this.type = event.data.type;
		} else if (event.data.mode === 'function') {
			this.functionInputs = event.data.functionInputs;
			this.functionOutputs = event.data.functionInputs;
			this.functionBody = event.data.functionBody;
		} else if (event.data.mode === 'cv') {
			this.cvFunction = event.data.cvFunction;
		} else if (event.data.mode === 'nlp') { 

		} else if (event.data.mode === 'face') { }
	}
}