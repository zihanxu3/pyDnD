import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { ParameterNodeModel } from './ParameterNodeModel';
import styled from '@emotion/styled';


export interface ParameterNodeWidgetProps {
	node: ParameterNodeModel;
	engine: DiagramEngine;
}

export interface ParameterNodeWidgetState {}

namespace S {
    export const ParamNode = styled.div`
        border: solid 2px gray;
        border-radius: 5px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        position: relative;
        background: green;
    `;
    
    // .custom-node-color{
    //     position: absolute;
    //     top: 50%;
    //     left: 50%;
    //     width: 20px;
    //     height: 20px;
    //     transform: translate(-50%, -50%);
    //     border-radius: 10px;
    // }
    
    export const CirclePort = styled.div`
        width: 12px;
        height: 12px;
        margin: 2px;
        border-radius: 4px;
        background: darkgray;
        cursor: pointer;
    `;
}

export class ParameterNodeWidget extends React.Component<ParameterNodeWidgetProps, ParameterNodeWidgetState> {
	constructor(props: ParameterNodeWidgetProps) {
		super(props);
		this.state = {};
	}
	render() {
		return (
			<S.ParamNode onDoubleClick={this.props.node.onDoubleClick}>
				<PortWidget engine={this.props.engine} port={this.props.node.getPort('out')}>
                    <S.CirclePort />
				</PortWidget>
			</S.ParamNode>
		);
	}
}