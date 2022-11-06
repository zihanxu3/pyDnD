import * as React from 'react';
import styled from '@emotion/styled';
import { runInThisContext } from 'vm';

export interface SidebarWidgetProps {
	display: any;
	onClick?: () => void;
}

namespace S {
	export const RightTray = styled.div`
		min-width: 300px;
		background: rgb(20, 20, 20);
		flex-grow: 0;
		flex-shrink: 0;
        margin-left: auto;
	`;
	export const TrayContent = styled.div`
		text-align: center;
	`;
}

export class SidebarWidget extends React.Component<any, any> {
	render() {
		return <S.RightTray style={{display: this.props.display ? 'block' : 'none'}}>
				<button onClick={this.props.onClick}> Close </button> 
				<S.TrayContent>
					<h3 style={{color: 'white'}}>Configurations</h3> 
					{this.props.children}
				</S.TrayContent>
            </S.RightTray>;
	}
}