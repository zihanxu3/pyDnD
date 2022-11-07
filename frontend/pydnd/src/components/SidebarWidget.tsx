import * as React from 'react';
import styled from '@emotion/styled';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
	export const TrayStack = styled.div`
		text-align: center;
	`;
}

export class SidebarWidget extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			variableType: 0,
			textBoxValue: "",
			open: false,
		}
	}
	render() {
		const {
			variableType,
			textBoxValue,
			open,
		} = this.state;
		const types = ['number', 'list', 'dict', 'set']
		let content;
		if (this.props.nodeSelected === 'variable') {
			content = 
					<div>
						<div>
							<FormControl>
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
							</FormControl>
						</div>
						<div style={{marginTop: 20}}>
							<TextField
								label="Value"
								multiline
								rows={4}
								value={textBoxValue}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									this.setState({
										textBoxValue: event.target.value,
									});
								}}
								placeholder={`Put in your ${types[variableType]} here.`}
							/>
						</div>
						<div style={{marginTop: 20}}>
							<Button variant="outlined" onClick={() => {
								this.setState({
									open: true,
								})
							}}>Save</Button>
						</div>
						<Snackbar 
							open={open} 
							autoHideDuration={2000} 
							onClose={() => { this.setState({open: false}) }}
						>
							<Alert 
								onClose={() => { this.setState({open: false}) }} 
								severity="success" 
								sx={{ width: '100%' }}
							>
								Saved Successfully!
							</Alert>
						</Snackbar>
					</div>;
		} else {
			content = <p>hello</p>;
		}
		return <S.RightTray style={{ display: this.props.nodeSelected !== '' ? 'block' : 'none' }}>
			<button onClick={this.props.onClick}> Close </button>
			<S.TrayStack>
				<h3>Configurations</h3>
				{content}
				{this.props.children}
			</S.TrayStack>
		</S.RightTray>;
	}
}