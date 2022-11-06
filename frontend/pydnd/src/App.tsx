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

		//3-A) create a default node
		var node1 = new SRD.DefaultNodeModel('Parameter', 'rgb(0,192,255)');
		let port = node1.addOutPort('Out');
		node1.setPosition(100, 100);

		//3-B) create another default node
		var node2 = new SRD.DefaultNodeModel('Output', 'rgb(192,255,0)');
		let port2 = node2.addInPort('In');
		node2.setPosition(400, 100);

		// var node3 = new ParameterNodeModel({value: 'parameter', onDoubleClick: () => { alert('ddd'); } });
		// node3.setPosition(500, 300);

		// link the ports
		let link1 = port.link(port2);

		this.activeModel.addAll(node1, node2, link1);
		console.log(this.activeModel);

	}

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}