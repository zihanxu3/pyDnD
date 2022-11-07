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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface SidebarWidgetProps {
	nodeSelected: any;
	onClose: () => void;
	onSave: () => void;
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
const types = ['number', 'list', 'dict', 'set'];

export class SidebarWidget extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			variableType: 0,
			textBoxValue: '',
			open: false,
		}
		console.log("constructed");

	}
	render() {
		const {
			variableType,
			textBoxValue,
			open,
		} = this.state;
		let content;
		if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeType() === 'variable') {
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
										return <MenuItem key={idx} value={idx}>{val}</MenuItem>;
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
								});
								this.props.nodeSelected.setValueAndType(textBoxValue, variableType);
								// this.props.nodeSelected.addInPort('In2');
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
		return <S.RightTray style={{ display: this.props.nodeSelected !== null ? 'block' : 'none' }}>
			<IconButton aria-label="delete" onClick={() => {
				this.props.onClose();
			}}>
				<CloseIcon/>
			</IconButton> 
			<S.TrayStack>
				<h3>Configurations</h3>
				{content}
				{this.props.children}
			</S.TrayStack>
		</S.RightTray>;
	}
}