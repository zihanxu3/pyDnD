import * as React from 'react';
import styled from '@emotion/styled';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


export interface SidebarWidgetProps {
	nodeSelected: string;
	onClick?: () => void;
}

namespace S {
	export const RightTray = styled.div`
		min-width: 300px;
		background: rgb(211, 211, 211);
		flex-grow: 0;
		flex-shrink: 0;
        margin-left: auto;
	`;
	export const TrayContent = styled.div`
		text-align: center;
	`;
}

export class SidebarWidget extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			variableType: 0,
		}
	}
	render() {
		const {
			variableType,
		} = this.state;
		const types = ['number', 'list', 'dict', 'set']
		let content;
		if (this.props.nodeSelected === 'variable') {
			content = <FormControl>
						<InputLabel>Type</InputLabel>
						<Select
							value={variableType}
							label="Type"
							onChange={
								(event: SelectChangeEvent) => {
									console.log(event.target.value);
									this.setState({
										variableType: event.target.value
									});
								}
							}
						>
							{types.map((val, idx) => {
								return <MenuItem value={idx}>{val}</MenuItem>;
							})}
						</Select>
					</FormControl>;
		} else {
			content = <p>hello</p>;
		}
		return <S.RightTray style={{ display: this.props.nodeSelected !== '' ? 'block' : 'none' }}>
			<button onClick={this.props.onClick}> Close </button>
			<S.TrayContent>
				<h3>Configurations</h3>
				{content}
				{this.props.children}
			</S.TrayContent>
		</S.RightTray>;
	}
}