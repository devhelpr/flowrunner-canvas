import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { Modal } from 'react-bootstrap';

import { useFlowStore} from '../../state/flow-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface NewFlowProps {
	onClose : () => void;
	onSaveFlowName : (flowId : string, flowName : string) => void;
	flowrunnerConnector : IFlowrunnerConnector
}

export const EditFlowName = (props: NewFlowProps) => {
	const [show, setShow] = useState(false);
	const [value, setValue] = useState("");

	const containerRef = useRef(null);

	const flow = useFlowStore();

	useEffect(() => {		
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls
		setShow(true);
	}, []);

	const saveNode= (e) => {
		if (props.flowrunnerConnector.hasStorageProvider) {
			// save to storage			
			props.flowrunnerConnector.storageProvider?.setFlowName(flow.flowId, value).then((result : any) => {
				//props.onSave(result.id, flowType);
				props.onSaveFlowName(flow.flowId, value);
			});
		} else {			
			alert("Edit flow name is only supported for StorageProvider");
			props.onClose();
		}

		e.preventDefault();
		return false;
	}
	
	const onChangeFlowName = (event) => {
		event.preventDefault();
		setValue(event.target.value);
		return false;
	}

	return <>
		<div ref={containerRef}></div>
		<Modal 
			show={show} 
			centered 
			size={"sm"} 
			container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>Edit Flow Name</Modal.Title>
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
			</Modal.Body>
		
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={props.onClose}>Close</button>
				<button className="btn btn-primary" onClick={saveNode}>Save</button>
			</Modal.Footer>
		</Modal>
	</>;
}
