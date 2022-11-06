import * as React from 'react';
import * as _ from 'lodash';
import { TrayWidget } from './TrayWidget';
import { Application } from '../App';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './CanvasWidget';
import styled from '@emotion/styled';
import { SidebarWidget } from './SidebarWidget';
import { ParameterNodeModel } from './customNodes/ParameterNodeModel';

export interface BodyWidgetProps {
	app: Application;
}

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

	export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;
}

export class BodyWidget extends React.Component<BodyWidgetProps, any> {
	constructor(props) {
		super(props);
		this.state = {
			nodeSelected: '',
		}
	}
	render() {
		const {
			nodeSelected,
		} = this.state;
		return (
			<S.Body>
				<S.Header>
					<div className="title">CS 5412 PyDnD Project</div>
				</S.Header>
				<S.Content>
					<TrayWidget>
                        <TrayItemWidget model={{ type: 'out' }} name="Parameter" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'in' }} name="Output" color="rgb(192,255,0)" />
					</TrayWidget>
					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node;
							if (data.type === 'in') {
								node = new DefaultNodeModel('Output', 'rgb(192,255,0)');
								node.addInPort('In');
							} else {
								node = new ParameterNodeModel({value: 'parameter', onDoubleClick: () => { 
									this.setState({ nodeSelected: 'variable' });
									this.forceUpdate();
								} });;
								// node.addOutPort('Out');
							}
							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
                            // node.registerListener({
                            //     eventDidFire: () => {alert("hi")}
                            // })
							this.props.app.getDiagramEngine().getModel().addNode(node);
							this.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DemoCanvasWidget>
							<CanvasWidget engine={this.props.app.getDiagramEngine()} />
						</DemoCanvasWidget>
					</S.Layer>
					<SidebarWidget nodeSelected={nodeSelected} onClick={() => {this.setState({nodeSelected: ''})}}/>
				</S.Content>
			</S.Body>
		);
	}
}