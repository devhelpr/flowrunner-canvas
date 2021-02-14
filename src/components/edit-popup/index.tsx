import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { useFlowStore} from '../../state/flow-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

export interface EditPopupProps {
	flowrunnerConnector : IFlowrunnerConnector;
	
	onClose: (pushFlow? : boolean) => void;
}

export const EditPopup = (props: EditPopupProps) => {

	const [value, setValue] = useState("");
	const [orgNodeName, setOrgNodeName] = useState("");
	const [orgNodeValues, setOrgNodeValues] = useState({});
	const [requiredNodeValues , setRequiredNodeValues] = useState({});
	
	const containerRef = useRef(null);

	const flow = useFlowStore();
	const selectedNode = useSelectedNodeStore();

	useEffect(() => {		
		const node = {...selectedNode.node.node};
		let newRequiredNodeValues;
		if (node.shapeType !== "Line") {
			newRequiredNodeValues = {
				_id : node._id,
				id: node.id,
				x: node.x,
				y: node.y,
				shapeType: node.shapeType
			};
		
			delete node.x;
			delete node.y;
		} else {
			newRequiredNodeValues = {
				_id : node._id,
				id: node.id,
				startshapeid: node.startshapeid,
				endshapeid: node.endshapeid,
				xstart: node.xstart,
				ystart: node.ystart,
				xend: node.xend,
				yend: node.yend,
				shapeType: node.shapeType,
				taskType: node.taskType
			};

			delete node.startshapeid;
			delete node.endshapeid;
			delete node.xstart;
			delete node.ystart;
			delete node.xend;
			delete node.yend;
			delete node.taskType;
		}
		
		delete node._id;
		delete node.id;
		delete node.shapeType;
		
		setValue(JSON.stringify(node, null, 2));
		setOrgNodeName(selectedNode.node.name);
		setOrgNodeValues({...selectedNode.node});
		setRequiredNodeValues(newRequiredNodeValues);
	}, []);

	const saveNode = (e) => {
		try {
			const changedProperties = JSON.parse(value);
			
			if (changedProperties.id !== undefined) {
				delete changedProperties.id;
			}

			const node = {...requiredNodeValues, ...changedProperties};
			flow.storeFlowNode(node, orgNodeName);
			
			selectedNode.selectNode(node.name, node);
			props.onClose(true);
		} catch (err) {
			alert("The json in the 'Node JSON' field is invalid");
		}

		e.preventDefault();
		return false;
	}

	const onCloseClick = (event) => {
		event.preventDefault();
		props.onClose();
		return false;
	}

	return <div ref={ref => ((containerRef as any).current = ref)}>
			<Modal 
				show={true} 
				centered 
				size="xl" 
				container={containerRef.current}>
				<Modal.Header>
					<Modal.Title>Edit Node JSON</Modal.Title>
				</Modal.Header>
		
				<Modal.Body>
					<div className="form-group">
						<label>Node JSON</label>
						<textarea className="form-control edit-popup__json" rows={8} 
							value={value} 
							onChange={(e) => {setValue(e.target.value)}}
						></textarea>
					</div>
				</Modal.Body>
		
			<Modal.Footer>
				<Button variant="secondary" onClick={onCloseClick}>Close</Button>
				<Button variant="primary" onClick={saveNode}>Save</Button>
			</Modal.Footer>
		</Modal>
	</div>;
}
