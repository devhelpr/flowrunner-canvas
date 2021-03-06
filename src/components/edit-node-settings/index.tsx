import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';
import { useFlowStore} from '../../state/flow-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

export interface EditNodeSettingsProps {
	node : any;
	settings: any;
	flowrunnerConnector : IFlowrunnerConnector;
	
	onClose: (pushFlow? : boolean) => void;
}

export interface EditNodeSettingsState {
	value: any;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
}

export const EditNodeSettings = (props: EditNodeSettingsProps) => {
	
	const [value, setValue] = useState({});
	const [orgNodeName, setOrgNodeName] = useState("");
	const [orgNodeValues, setOrgNodeValues] = useState({});
	const [requiredNodeValues , setRequiredNodeValues] = useState({});
	
	const containerRef = useRef(null);

	const flow = useFlowStore();
	const selectedNode = useSelectedNodeStore();

	useEffect(() => {
		if (!props.node) {
			return;
		}
		const node = {...props.node};
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

		
		setValue(node);
		setOrgNodeName(props.node.name);
		setOrgNodeValues({...props.node});
		setRequiredNodeValues(newRequiredNodeValues);
	}, []);

	const saveNode = (e) => {
		try {
			const changedProperties : any = value;
			
			//delete changedProperties.name;
			if (changedProperties.id !== undefined) {
				delete changedProperties.id;
			}
			/*
			const orgNode = {...this.state.orgNodeValues};
			for (var property in orgNode) {
				if (orgNode.hasOwnProperty(property)) {
					if (!changedProperties[property]) {
						delete orgNode[property];
					}
				}
			}
			*/

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

	const onSetValue = (newValue, fieldName) => {
		setValue({...value, [fieldName]: newValue});
	}
	
	return <div className="edit-node-settings" ref={ref => ((containerRef as any).current = ref)}>
		<Modal show={true} centered size="lg" container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>Edit {props.node.name}</Modal.Title>
			</Modal.Header>
		
			<Modal.Body>
				<div className="form-group">
					<FormNodeHtmlPlugin 
						isNodeSettingsUI={true} 
						node={props.node} 
						taskSettings={props.settings}
						onSetValue={onSetValue}
						flowrunnerConnector={props.flowrunnerConnector}
						></FormNodeHtmlPlugin>
				</div>
			</Modal.Body>
		
			<Modal.Footer>
				<Button variant="secondary" onClick={onCloseClick}>Close</Button>
				<Button variant="primary" onClick={saveNode}>Save</Button>
			</Modal.Footer>
		</Modal>
	</div>;
}