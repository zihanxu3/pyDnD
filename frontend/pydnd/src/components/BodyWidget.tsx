import * as React from 'react';
import * as _ from 'lodash';
import { TrayWidget } from './TrayWidget';
import { Application } from '../App';
import { TrayItemWidget } from './TrayItemWidget';
import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DemoCanvasWidget } from './CanvasWidget';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';
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
			nodeSelected: null,
		}
		//3-A) create a default node
		var node1 = new ParameterNodeModel({
			mode: 'variable',
			onDoubleClick: () => { 
			this.setState({ nodeSelected: node1 });
			this.forceUpdate();
		}, name: 'Parameter', color: 'rgb(0,192,255)'});
		let port = node1.addOutPort('Out');
		node1.setPosition(300, 300);

		//3-B) create another default node
		var node2 = new ParameterNodeModel({
			mode: 'variable',
			onDoubleClick: () => { 
			this.setState({ nodeSelected: node2 });
			this.forceUpdate();
		}, name: 'Output', color: 'rgb(192,255,0)'});
		let port2 = node2.addInPort('In');
		node2.setPosition(600, 300);


		// link the ports
		let link1 = port.link(port2);

		this.props.app.getDiagramEngine().getModel().addAll(node1, node2, link1);
	}

	render() {
		console.log(this.props.app.getDiagramEngine().getModel().serialize());
		const {
			nodeSelected,
		} = this.state;
		const doubleClickNode = (node) => {
			this.setState({
				nodeSelected: node
			});
		}
		return (
			<S.Body>
				<S.Header>
					<div className="title">CS 5412 PyDnD Project</div>
					<div style={{marginLeft: 'auto'}}>
						<Button variant="outlined" onClick={
								async () => {
									// https://pydnd-azure-backend-xyz.azurewebsites.net/compile
									const rawResponse = await fetch('/compile', {
										method: 'POST',
										headers: {
											'Accept': 'application/json',
											'Content-Type': 'application/json'
										},
										// mode: 'cors',
										body: JSON.stringify(this.props.app.getDiagramEngine().getModel().serialize())
									});
									let jsonResponse;
									try {
										jsonResponse = await rawResponse.json();
									} catch (e) {
										console.log(e)
									}
									console.log(jsonResponse);
								}
							}>
							Run
						</Button>
					</div>
				</S.Header>
				<S.Content>
					<TrayWidget>
                        <TrayItemWidget model={{ type: 'param' }} name="Parameter" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'output' }} name="Output" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'function' }} name="Function" color="rgb(192,0,255)" />
						<TrayItemWidget model={{ type: 'return' }} name="Return" color="rgb(112,128,144)" />
						<TrayItemWidget model={{ type: 'print' }} name="Print" color="rgb(224, 203, 81)" />
					</TrayWidget>
					<S.Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node;
							if (data.type === 'output') {
								node = new ParameterNodeModel({
									mode: 'output',
									name: 'Output', 
									color: 'rgb(192,255,0)',
									onDoubleClick: () => { 
										doubleClickNode(node);
									} 
								});
								node.addInPort('In');
							} else if (data.type === 'param') {
								node = new ParameterNodeModel({
									mode: 'variable',
									name: 'Parameter', 
									color: 'rgb(0,192,255)',
									onDoubleClick: () => { 
										doubleClickNode(node);
									} 
								});
								node.addOutPort('Out');
							} else if (data.type === 'function') {
								node = new ParameterNodeModel({
									mode: 'function',
									name: 'Function', 
									color: 'rgb(192,0,255)',
									onDoubleClick: () => { 
										doubleClickNode(node);
									} 
								});
								node.addInPort('Exec In');
								node.addOutPort('Exec Out')
							} else if (data.type === 'return') {
								node = new DefaultNodeModel({name: 'Return', color: 'rgb(112,128,144)'});
								node.addInPort('Exec In');
							} else if (data.type === 'print') {
								node = new DefaultNodeModel({name: 'Print', color: 'rgb(224, 203, 81)'});
								node.addInPort('Exec In');
							}
							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
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
					
					<SidebarWidget 
						nodeSelected={nodeSelected} 
						onClose={() => {this.setState({nodeSelected: null})}}/>
				</S.Content>
			</S.Body>
		);
	}
}