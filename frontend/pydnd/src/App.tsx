import * as SRD from '@projectstorm/react-diagrams';
import { ParameterNodeFactory } from './components/customNodes/ParameterNodeFactory';
import { ParameterNodeModel } from './components/customNodes/ParameterNodeModel';
import { NodeModel, DefaultPortModel, PortModelAlignment } from '@projectstorm/react-diagrams';

/**
 * @author Dylan Vorster
 * Rivised by 
 * @author Zihan Xu
 */
export class Application {
	protected activeModel: SRD.DiagramModel;
	protected diagramEngine: SRD.DiagramEngine;

	constructor() {
		this.diagramEngine = SRD.default();
		this.newModel();
	}

	public newModel() {
		this.diagramEngine.getNodeFactories().registerFactory(new ParameterNodeFactory() as any);
		this.diagramEngine.getNodeFactories().registerFactory(new ParameterNodeFactory());

		this.activeModel = new SRD.DiagramModel();
		this.diagramEngine.setModel(this.activeModel);
	}

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}