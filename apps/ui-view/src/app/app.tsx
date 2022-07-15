
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Route, Routes, Link } from 'react-router-dom';

import { UIView } from "@devhelpr/flowrunner-canvas-ui-view";

import flow from "./Test State Machine.json";
import layout from "./layout-Test State Machine.json";

import "@devhelpr/flowrunner-canvas-ui-view/assets/bootstrap.min.css";

import "@devhelpr/flowrunner-canvas-core/assets/core.css";

import "@devhelpr/flowrunner-canvas-ui-view/assets/main.css";
import "@devhelpr/flowrunner-canvas-ui-view/assets/main-ui.css";

export function App() {

  return (
    <>
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
    
    {/* START: routes */}
    {/* These routes and navigation have been generated for you */}
    {/* Feel free to move and update them to fit your needs */}
    <br/>
    <hr/>
    <br/>
    <div role="navigation">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/page-2">Page 2</Link></li>
      </ul>
    </div>
    <Routes>
      <Route
        path="/"
        element={
          <></>
        }
      />
      <Route
        path="/page-2"
        element={
          <div><Link to="/">Click here to go back to root page.</Link></div>
        }
      />
    </Routes>
    {/* END: routes */}
    </>);

}


export default App;
