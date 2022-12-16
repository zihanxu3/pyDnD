import React, { useEffect, useState } from 'react';
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
import DownloadIcon from '@mui/icons-material/Download';
import CodeEditorWindow from './CodeEditWidget';
import { forEach } from 'lodash';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
	props,
	ref,
) {
	return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

namespace S {
    export const RightTray = styled.div`
		min-width: 350px;
		background: rgb(211, 211, 211);
		flex-grow: 0;
		flex-shrink: 0;
	`;
    export const TrayStack = styled.div`
		text-align: center;
        max-height: 100vh;
        overflow-y: auto;
	`;
}


const FileUploadSidebarWidget = ({ uid, fileList, onUpload, onClose }) => {
    const [fileInput, setFileInput] = useState(null);
    const [open, setOpen] = useState(false);
    return (
        <S.RightTray>
            <IconButton aria-label="delete" onClick={() => {
				onClose();
			}}>
                <CloseIcon />
            </IconButton>
            <S.TrayStack>
                <h3 style={{marginBottom: "20px"}}>My Files</h3>
                {(fileList).map((v) => {
                    console.log(v);
                    return <div style={{display: 'flex', flexDirection: 'row', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>
                        <p style={{marginBottom: "20px"}}>{v}</p>
                        <IconButton aria-label="download" onClick={() => {
							fetch('/download', {
                                method: 'POST',
                                body: JSON.stringify({
                                    fileName: v,
                                    uid: uid,
                                }),
                            })
                            .then(response => {
                                response.blob().then(blob => {
                                    let url = window.URL.createObjectURL(blob);
                                    let a = document.createElement('a');
                                    a.href = url;
                                    a.download = v;
                                    a.click();
                                });
                                //window.location.href = response.url;
                            });
						}}>
							<DownloadIcon />
						</IconButton>
                        </div>;
                })}
                <h3 style={{marginTop: "50px", marginBottom: "20px"}}>Upload Files</h3>
                <input ref={(ref) => {
                    setFileInput(ref)
                }} type="file" multiple accept='.jpg, .jpeg, .txt' style={{marginBottom: "90px"}} />
                <div>
                    <Button variant="outlined" onClick={async (e) => { 
                        console.log(fileInput);
                        if (fileInput !== null) {
                            e.preventDefault();
                            console.log(fileInput.files);
                            const formData = new FormData();
                            for (var i = 0; i < fileInput.files.length; i++) {
                                formData.append('file', fileInput.files[i]);
                            }
                            formData.append('uid', uid);
                            // https://pydnd-azure-backend-xyz.azurewebsites.net/compile
                            const rawResponse = await fetch('https://pydnd-azure-backend-xyz.azurewebsites.net/upload', {
                                method: 'POST',
                                body: formData,
                            });
                            let jsonResponse;
                            try {
                                jsonResponse = await rawResponse.json();
                            } catch (e) {
                                console.log(e)
                            }
                            setOpen(true);
                            await onUpload();
                            console.log(jsonResponse);
                        }
                    }}>Save</Button>
                    <Snackbar
						open={open}
						autoHideDuration={2000}
						onClose={() => { setOpen(false) }}
					>
						<Alert
							onClose={() => { setOpen(false) }}
							severity="success"
							sx={{ width: '100%' }}
						>
							Saved Successfully!
						</Alert>
					</Snackbar>
                </div>
            </S.TrayStack>
        </S.RightTray>
    );
};

export default FileUploadSidebarWidget;