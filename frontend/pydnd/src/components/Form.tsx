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
            padding: theme.spacing(2),

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

const Form = ({ handleClose }) => {
    const { classes } = useStyles();
    // create state variables for each input
    const [signIn, setSignIn] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = e => {
        e.preventDefault();
        console.log(firstName, lastName, email, password);
        handleClose();
    };

    return (
        <form className={classes.root} onSubmit={handleSubmit}>
            <div style={{display: signIn ? 'none' : 'flex', flexDirection: 'column'}}>
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
                    setSignIn(!signIn)
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