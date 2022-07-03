import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import { UIView } from "@devhelpr/flowrunner-canvas-ui-view";

import flow from "./Test State Machine.json";
import layout from "./layout-Test State Machine.json";

import "@devhelpr/flowrunner-canvas-ui-view/assets/bootstrap.min.css";

import "@devhelpr/flowrunner-canvas-core/assets/core.css";

import "@devhelpr/flowrunner-canvas-ui-view/assets/main.css";
import "@devhelpr/flowrunner-canvas-ui-view/assets/main-ui.css";



ReactDOM.render(
    <UIView
      flowId='flow'
      flowPackage={{
        flow: flow,
        layout: layout,
        name: "flow",
        flowId: "flow",
        flowType: "playground"
      }}
    />
  ,
  document.getElementById('flowstudio-root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


