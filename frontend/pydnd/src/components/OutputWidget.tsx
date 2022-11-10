import * as React from 'react';
import styled from '@emotion/styled';

namespace S {
	export const Tray = styled.div`
		min-width: 200px;
        height: 200px;
		background: rgb(20, 20, 20);
		flex-grow: 0;
		flex-shrink: 0;
        margin-top: auto;
        color: white;
        padding-left: 20px;
        overflow-y:auto
	`;
}
export interface SidebarWidgetProps {
	textBody: string;
}
export class OutputWidget extends React.Component<any, any> {

	render() {
		return <S.Tray>
            <pre>
                {this.props.textBody}
            </pre>
        </S.Tray>;
	}
}