import * as SRD from '@projectstorm/react-diagrams';
import { ParameterNodeFactory } from './components/customNodes/ParameterNodeFactory';
// import { ParameterNodeModel } from './components/customNodes/ParameterNodeModel';

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

		var node = new SRD.DefaultNodeModel({name: 'Entry Point', color: 'rgb(238, 75, 43)'});
		node.setPosition(100, 100);
		node.addOutPort('Exec Out');
		this.activeModel.addNode(node);
	}

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}