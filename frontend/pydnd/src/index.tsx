import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Application } from './App';
import { BodyWidget } from './components/BodyWidget';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

var app = new Application();
root.render(
  <BodyWidget app={app} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
