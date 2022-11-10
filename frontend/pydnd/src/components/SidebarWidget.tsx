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
import CodeEditorWindow from './CodeEditWidget';


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
			functionInputs: '',
			functionOutputs: '',
			functionBody: '',
			open: false,
		}
		console.log("constructed");

	}
	componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
		console.log('called');
		if (prevProps.nodeSelected !== this.props.nodeSelected) {
			this.setState({
				variableType: this.props.nodeSelected === null || this.props.nodeSelected.getValueAndType()[1] === '' ? 0 : types.indexOf(this.props.nodeSelected.getValueAndType()[1]),
				textBoxValue: this.props.nodeSelected === null ? '' : this.props.nodeSelected.getValueAndType()[0],
				functionInputs: this.props.nodeSelected === null ? '' : this.props.nodeSelected.getFuntionInputs(),
				functionOutputs: this.props.nodeSelected === null ? '' : this.props.nodeSelected.getFuntionOutputs(),
				functionBody: this.props.nodeSelected === null ? '' : this.props.nodeSelected.getFuntionBody(),
				open: false,
			});
		}
	}
	render() {
		const {
			variableType,
			textBoxValue,
			functionInputs,
			functionOutputs,
			functionBody,
			open,
		} = this.state;
		let content;
		if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'variable') {
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
					<div style={{ marginTop: 20 }}>
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
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.setState({
								open: true,
							});
							this.props.nodeSelected.setValueAndType(textBoxValue, types[variableType]);
							// this.props.nodeSelected.addInPort('In2');
						}}>Save</Button>
					</div>
					<Snackbar
						open={open}
						autoHideDuration={2000}
						onClose={() => { this.setState({ open: false }) }}
					>
						<Alert
							onClose={() => { this.setState({ open: false }) }}
							severity="success"
							sx={{ width: '100%' }}
						>
							Saved Successfully!
						</Alert>
					</Snackbar>
				</div>;
		} else if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'function') {
			content =
				<div>
					<div>
						<TextField
							label="Function Input Types"
							multiline
							rows={3}
							value={functionInputs}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								this.setState({
									functionInputs: event.target.value,
								});
							}}
							placeholder='Put in your function input types here, in order, separated by commas. E.g. number,number,list. If void, put nothing.'
						/>
					</div>
					<div style={{ marginTop: 20 }}>
						<TextField
							label="Function Output Types"
							multiline
							rows={3}
							value={functionOutputs}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								this.setState({
									functionOutputs: event.target.value,
								});
							}}
							placeholder='Put in your function output types here, in order, separated by commas. E.g. number,number,list. If void, put nothing.'
						/>
					</div>
					{/* <div style={{ marginTop: 20 }}>
						<TextField
							label="Function Body"
							multiline
							rows={7}
							value={functionBody}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								this.setState({
									functionBody: event.target.value,
								});
							}}
							placeholder='Put in your function body here.'
						/>
					</div> */}
					<div style={{display: 'block', margin: 20 }}>
						<CodeEditorWindow code={functionBody} theme="cobalt" onChange={(action, data) => {
							switch (action) {
								case "code": {
									this.setState({ functionBody: data });
									break;
								}
								default: {
									console.warn("case not handled!", action, data);
								}
							}
						}}/>
					</div>
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.setState({
								open: true,
							});
							if (functionInputs === '' || this.props.nodeSelected.getFuntionInputs() !== functionInputs) {
								this.props.nodeSelected.setFunctionParams(functionInputs, functionOutputs, functionBody);
								this.props.nodeSelected.addAllInAndOuts();
							}
						}}>Save</Button>
					</div>
					<Snackbar
						open={open}
						autoHideDuration={2000}
						onClose={() => { this.setState({ open: false }) }}
					>
						<Alert
							onClose={() => { this.setState({ open: false }) }}
							severity="success"
							sx={{ width: '100%' }}
						>
							Saved Successfully!
						</Alert>
					</Snackbar>
				</div>
		} else if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'output') {
			<p>eeeee</p>;
		}
		return <S.RightTray style={{ display: this.props.nodeSelected !== null ? 'block' : 'none' }}>
			<IconButton aria-label="delete" onClick={() => {
				this.props.onClose();
			}}>
				<CloseIcon />
			</IconButton>
			<S.TrayStack>
				<h3>Configurations</h3>
				{content}
				{this.props.children}
			</S.TrayStack>
		</S.RightTray>;
	}
}