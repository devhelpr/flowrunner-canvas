import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';

//import fetch from 'cross-fetch';

import { useFlowStore} from '@devhelpr/flowrunner-canvas-core';
import { useCanvasModeStateStore} from '@devhelpr/flowrunner-canvas-core';
import { IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';

export interface NewFlowProps {
	onClose : () => void;
	onSave: (id : number | string, flowType : string) => void;
	flowrunnerConnector : IFlowrunnerConnector
}

export const NewFlow = (props: NewFlowProps) => {
	const [show, setShow] = useState(false);
	const [value, setValue] = useState("");
	const [orgNodeName, setOrgNodeName] = useState("");
	const [orgNodeValues, setOrgNodeValues] = useState({});
	const [requiredNodeValues , setRequiredNodeValues] = useState({});
	const [flowType , setFlowType] = useState("playground");
	const [addJSONFlow, setAdJSONFlow] = useState(false);
	const [json, setJSON] = useState("");

	const containerRef = useRef(null);

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();

	useEffect(() => {
		
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls
		setShow(true);
	}, []);

	const saveNode= (e) => {
		if (addJSONFlow) {
			try {
				let flow = JSON.parse(json);
				if (!Array.isArray(flow)) {
					alert("The JSON should be an array of nodes and connections");
					return;
				}
			} catch (err) {
				alert("Error in JSON: " + err);
				return;
			}
		}
		if (props.flowrunnerConnector.hasStorageProvider) {
			// save to storage
			props.flowrunnerConnector.storageProvider?.addFlow(value, JSON.parse(json || "[]")).then((result : any) => {
				props.onSave(result.id, flowType);
			});
		} else {
			try {
				fetch('/api/flow?flow=' + value + 
					"&flowType=" + flowType +
					"&addJSONFlow=" + addJSONFlow, {
					method : "post",
					body: JSON.stringify({
						nodes : JSON.parse(json || "[]")
					}),
					headers: {
						"Content-Type": "application/json"
					}
				}).then((response) => {
					if (response.status >= 400) {
						throw new Error("Bad response from server");
					}
					return response.json();
				}).then((result) => {
					props.onSave(result.id, flowType);
				});
				
			} catch (err) {
				console.log("new-flow err", err);
				alert("Error while adding flow");
			}
		}

		e.preventDefault();
		return false;
	}

	const onAddJSONFlow = (event) => {
		event.preventDefault();
		setAdJSONFlow(!addJSONFlow);
		return false;
	}

	const onChangeJson = (event) => {
		event.preventDefault();
		setJSON(event.target.value);
		return false;
	}

	const onChangeFlowName = (event) => {
		event.preventDefault();
		setValue(event.target.value);
		return false;

	}

	const onChangeFlowType = (event) => {
		event.preventDefaul();
		setFlowType(event.target.value);
		return false;
	}
	
	return <>
		<div ref={containerRef}></div>
		<Modal 
			show={show} 
			centered 
			size={addJSONFlow ? "xl" : "sm"} 
			container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>Add new Flow</Modal.Title>
			</Modal.Header>
		
			<Modal.Body>
				<div className="form-group">
					<label>Flow name</label>
					<input className="form-control"
						value={value} 
						required
						onChange={onChangeFlowName}
					></input>
				</div>
				<div className="form-group">
					<label>Flow type</label>
					<select className="form-control form-select" value={flowType}
						onChange={onChangeFlowType}
					>
						<option value="playground">Playground</option>
						<option value="rustflowrunner">Rust flowrunner</option>
						<option value="mobile-app">Mobile app</option>
						<option value="backend">Backend</option>
					</select>				
				</div>
				<div className="form-group">
					<input id="addJSONFlow" type="checkbox" checked={addJSONFlow} 
						onChange={onAddJSONFlow} />
					<label htmlFor="addJSONFlow" className="ms-2">Enter flow as json</label>
				</div>
				{addJSONFlow && <div className="form-group">
					<textarea className="form-control" 
						value={json} 
						onChange={onChangeJson}></textarea>
				</div>
				}
			</Modal.Body>
		
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={props.onClose}>Close</button>
				<button className="btn btn-primary" onClick={saveNode}>Add</button>
			</Modal.Footer>
		</Modal>
	</>;
}
