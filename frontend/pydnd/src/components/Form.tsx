import React, { useState } from 'react';
import { TextField, Button, Link } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing(5),

            '& .MuiTextField-root': {
                margin: theme.spacing(1),
                width: '300px',
            },
            '& .MuiButtonBase-root': {
                margin: theme.spacing(2),
            },
        }
    }
});

const Form = ({ handleClose, setUser }) => {
    const { classes } = useStyles();
    // create state variables for each input
    const [signIn, setSignIn] = useState(false);
    const [error, setError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (signIn) {

            const response = await fetch('https://pydnd-azure-backend-xyz.azurewebsites.net/signin', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // mode: 'cors',
                body: JSON.stringify({
                    email: email,
                    password: password,
                })
            })
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.log(e);
            }
            console.log(response);

            if (data['stat']) {
                setError("Invalid username or password.");
                return;
            }
            console.log(data);
            // TODO: Set user 
            setError("");
            setUser(data['body']);
            console.log(email, password);

        } else {

            const response = await fetch('https://pydnd-azure-backend-xyz.azurewebsites.net/signup', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // mode: 'cors',
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                })
            })
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.log(e);
            }
            console.log(response);
            console.log(data);
            if (data['stat']) {
                setError("This email has already registered.");
                return;
            }
            // TODO: Set user 
            setError("");
            setUser(data['body']);
            console.log(email, password);

        }
        handleClose();
    };

    return (
        <form className={classes.root} onSubmit={handleSubmit}>
            <p style={{color: 'red'}}>{error}</p>
            {signIn ? <div></div> :
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField
                        label="First Name"
                        variant="filled"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <TextField
                        label="Last Name"
                        variant="filled"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                </div>
            }
            <TextField
                label="Email"
                variant="filled"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                variant="filled"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <div>
                <Link href="#" onClick={() => {
                    setSignIn(!signIn);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPassword('');
                }}>
                    {signIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Link>
            </div>
            <div>
                <Button variant="contained" onClick={handleClose}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                    {signIn ? "SignIn" : "Signup"}
                </Button>
            </div>
        </form>
    );
};

export default Form;