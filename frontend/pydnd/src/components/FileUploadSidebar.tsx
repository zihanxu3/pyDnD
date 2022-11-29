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
import CodeEditorWindow from './CodeEditWidget';

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
                    return <p style={{marginBottom: "20px"}}>{v}</p>;
                })}
                <h3 style={{marginTop: "50px", marginBottom: "20px"}}>Upload Files</h3>
                <input ref={(ref) => {
                    setFileInput(ref)
                }} type="file" style={{marginBottom: "90px"}} />
                <div>
                    <Button variant="outlined" onClick={async (e) => { 
                        console.log(fileInput);
                        if (fileInput !== null) {
                            e.preventDefault();
                            // console.log(fileInput.files[0].name);
                            const formData = new FormData();
                            formData.append("file", fileInput.files[0]);
                            formData.append('uid', uid);
                            // https://pydnd-azure-backend-xyz.azurewebsites.net/compile
                            const rawResponse = await fetch('/upload', {
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