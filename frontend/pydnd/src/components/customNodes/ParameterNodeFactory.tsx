import * as React from 'react';
import { ParameterNodeModel } from './ParameterNodeModel';
import { ParameterNodeWidget } from './ParameterNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class ParameterNodeFactory extends AbstractReactFactory<ParameterNodeModel, DiagramEngine> {
	constructor() {
		super('ts-custom-node');
	}

	generateModel(initialConfig) {
		return new ParameterNodeModel();
	}

	generateReactWidget(event): JSX.Element {
		return <ParameterNodeWidget engine={this.engine as DiagramEngine} node={event.model} />;
	}
}