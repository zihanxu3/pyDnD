import * as React from 'react';
import styled from '@emotion/styled';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CodeEditorWindow from './CodeEditWidget';
import { List, ListItem } from '@mui/material';


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
	user: any;
	fileList: any;
}

namespace S {
	export const RightTray = styled.div`
		min-width: 350px;
		background: rgb(211, 211, 211);
		flex-grow: 0;
		flex-shrink: 0;
	`;
	export const TrayStack = styled.div`
		text-align: center;
	`;
}
var types = ['value', 'list', 'dict', 'set'];
var functionTypes = ['GetTags - from URL', 'GetDescription - from URL', 'GetText - from URL']
var languageTypes = ['GetSentiment - from List', 'GetSummarization - from List', 'GetKeyPhrase - from List']

export class SidebarWidget extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			variableType: 0,
			fileIdx: 0,
			textBoxValue: '',
			functionInputs: '',
			functionOutputs: '',
			functionBody: '',
			open: false,
			cvType: 0,
			nlpType: 0,
			customCVList: [],
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
				customCVList: this.props.nodeSelected === null ? [] : this.props.nodeSelected.getTagList(),
				open: false,
				cvType: this.props.nodeSelected === null || this.props.nodeSelected.getCVFunction() === '' ? 0 : functionTypes.indexOf(this.props.nodeSelected.getCVFunction()),
			});
			if (this.props.user !== null && types.length <= 4) types = [...types, 'file'];
			if (this.props.user !== null && functionTypes.length <= 3) functionTypes = [...functionTypes, 'GetTags - from File', 'GetDescription - from File', 'GetText - from File'];
			if (this.props.user !== null && languageTypes.length <= 3) languageTypes = [...languageTypes, 'GetSentiment - from File', 'GetSummarization - from File', 'GetKeyPhrase - from File'];
		}
	}
	render() {
		const {
			fileIdx,
			variableType,
			textBoxValue,
			functionInputs,
			functionOutputs,
			functionBody,
			open,
			cvType,
			nlpType,
			customCVList,
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
					{variableType === 4 ?
						<div style={{ marginTop: 20 }}>
							<FormControl>
								<InputLabel>File</InputLabel>
								<Select
									value={fileIdx}
									label="File"
									onChange={
										(event: SelectChangeEvent) => {
											console.log(event.target.value);
											this.setState({
												fileIdx: event.target.value
											});
										}
									}
								>
									{
										this.props.fileList.map((val, idx) => {
											return <MenuItem key={idx} value={idx}>{val}</MenuItem>;
										})
									}
								</Select>
							</FormControl>
						</div>
						:
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
					}
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.setState({
								open: true,
							});
							if (variableType === 4) {
								this.props.nodeSelected.setValueAndType(this.props.fileList[fileIdx], types[variableType]);
							} else {
								this.props.nodeSelected.setValueAndType(textBoxValue, types[variableType]);
							}
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
							placeholder='Put in your function input types here, in order, separated by commas. E.g. int,string,dict,list. If void, put nothing.'
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
							placeholder='Put in your function output types here, in order, separated by commas. E.g. int,int,list. If void, put nothing.'
						/>
					</div>
					<div style={{ display: 'block', margin: 20 }}>
						<CodeEditorWindow code={functionBody} onChange={(action, data) => {
							switch (action) {
								case "code": {
									this.setState({ functionBody: data });
									break;
								}
								default: {
									console.warn("case not handled!", action, data);
								}
							}
						}} />
					</div>
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.setState({
								open: true,
							});
							if (functionInputs === '' || this.props.nodeSelected.getFuntionInputs() !== functionInputs) {
								this.props.nodeSelected.setFunctionInputs(functionInputs);
								this.props.nodeSelected.addAllInPorts();
							}
							if (functionOutputs === '' || this.props.nodeSelected.getFuntionOutputs() !== functionOutputs) {
								this.props.nodeSelected.setFunctionOutputs(functionOutputs);
								this.props.nodeSelected.addAllOutPorts();
							}
							if (functionBody === '' || this.props.nodeSelected.getFuntionBody() !== functionBody) {
								this.props.nodeSelected.setFunctionBody(functionBody);
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
			<p></p>;
		} else if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'cv') {
			content =
				<div>
					<div>
						<FormControl>
							<InputLabel>CV Function</InputLabel>
							<Select
								value={cvType}
								label="CV Function"
								onChange={
									(event: SelectChangeEvent) => {
										console.log(event.target.value);
										this.setState({
											cvType: event.target.value
										});
									}
								}
							>
								{functionTypes.map((val, idx) => {
									return <MenuItem key={idx} value={idx}>{val}</MenuItem>;
								})}
							</Select>
						</FormControl>
					</div>
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.props.nodeSelected.setCVFunction(functionTypes[cvType]);
							this.setState({
								open: true,
							});
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
		} else if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'nlp') {
			content =
				<div>
					<div>
						<FormControl>
							<InputLabel>NLP Function</InputLabel>
							<Select
								value={nlpType}
								label="NLP Function"
								onChange={
									(event: SelectChangeEvent) => {
										console.log(event.target.value);
										this.setState({
											nlpType: event.target.value
										});
									}
								}
							>
								{languageTypes.map((val, idx) => {
									return <MenuItem key={idx} value={idx}>{val}</MenuItem>;
								})}
							</Select>
						</FormControl>
					</div>
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.props.nodeSelected.setNLPFunction(languageTypes[nlpType]);
							this.setState({
								open: true,
							});
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
		} else if (this.props.nodeSelected !== null && this.props.nodeSelected.getNodeMode() === 'customcv') {
			content =
				<div>
					<div>
						<p>Add your tags and range below: </p>
						<Button variant="outlined" onClick={() => {
							this.setState({
								customCVList: [
									...customCVList,
									['tag1', 'from', 'to']
								]
							})
						}}>Add Tag</Button>
						<List>
							{customCVList.map((val, idx) => {
								return <ListItem>
									<TextField
										style={{width: '120px', marginRight: '5px'}}
										label="TagName"
										value={val[0]}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											this.setState({
												customCVList: [
													...customCVList.slice(0, idx),
													[event.target.value, val[1], val[2]],
													...customCVList.slice(idx + 1),
												]
											});
										}}
										placeholder={`Put in your tag name here.`}
									/>
									<TextField
										style={{width: '70px', marginRight: '5px'}}
										label="From"
										value={val[1]}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											this.setState({
												customCVList: [
													...customCVList.slice(0, idx),
													[val[0], event.target.value, val[2]],
													...customCVList.slice(idx + 1),
												]
											});
										}}
										placeholder={`Put in your range start here.`}
									/>
									<TextField
										style={{width: '70px', marginRight: '5px'}}
										label="To"
										value={val[2]}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											this.setState({
												customCVList: [
													...customCVList.slice(0, idx),
													[val[0],val[1], event.target.value],
													...customCVList.slice(idx + 1),
												]
											});
										}}
										placeholder={`Put in your range end here.`}
									/>
									<IconButton aria-label="delete" onClick={() => {
										this.setState({
											customCVList: [
												...customCVList.slice(0, idx),
												...customCVList.slice(idx + 1),
											]
										})
									}}>
										<CloseIcon />
									</IconButton>
								</ListItem>
							})}
						</List>
					</div>
					<div style={{ marginTop: 20 }}>
						<Button variant="outlined" onClick={() => {
							this.props.nodeSelected.setTagList(this.state.customCVList);
							this.setState({
								open: true,
							});
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