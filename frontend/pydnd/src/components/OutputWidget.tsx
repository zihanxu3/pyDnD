import * as React from 'react';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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
        flex-direction: row;
	`;
}
export interface SidebarWidgetProps {
    consoleOpen: boolean;
	textBody: string;
    onClose: () => {};
}
export class OutputWidget extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }
	render() {
		return <S.Tray style={{display: this.props.consoleOpen === false ? 'none' : 'flex'}}>
            <pre>
                {this.props.textBody}
            </pre>
            <div style={{marginLeft: 'auto'}}>
                <IconButton aria-label="delete" onClick={() => {
                    this.props.onClose();
                }}>
                    <CloseIcon color='primary'/>
                </IconButton>
            </div>
        </S.Tray>;
	}
}