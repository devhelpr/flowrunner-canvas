import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';
import { FlowConnector } from '../../flow-connector';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { useBundleFlowStore, useFlowStore} from '../../state/flow-state';
import { useBundleSelectedNodeStore, useSelectedNodeStore} from '../../state/selected-node-state';
import { useBundleCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useFlows } from '../../use-flows';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

const CanvasComponent = React.lazy(() => import('../canvas').then(({ Canvas }) => ({ default: Canvas })));

export interface EditBundleProps {
	flowrunnerConnector : IFlowrunnerConnector;
	renderHtmlNode?: (node: any, flowrunnerConnector : IFlowrunnerConnector, flow: any, taskSettings? : any) => any;
	getNodeInstance?: (node: any, flowrunnerConnector?: IFlowrunnerConnector, flow?: any, taskSettings? : any) => any;	

	onClose: (pushFlow? : boolean) => void;
}

export const EditBundle = (props: EditBundleProps) => {

	const [value, setValue] = useState("");
	const [orgNodeName, setOrgNodeName] = useState("");
	const [orgNodeValues, setOrgNodeValues] = useState({});
	const [requiredNodeValues , setRequiredNodeValues] = useState({});
	
	const containerRef = useRef(null);
	const canvasToolbarsubject = useRef(undefined as any);
	const formNodesubject = useRef(undefined as any);
	const flows = useFlows(props.flowrunnerConnector);
	
	const flow = useBundleFlowStore();
	const orgFlow = useFlowStore();
	const selectedNode = useSelectedNodeStore();

	useEffect(() => {		
		canvasToolbarsubject.current = new BehaviorSubject<string>("");
		formNodesubject.current = new Subject<any>();

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
		delete node.observable;
		console.log("EditPopup", node);
		setValue(JSON.stringify(node, null, 2));
		setOrgNodeName(selectedNode.node.name);
		setOrgNodeValues({...selectedNode.node});
		setRequiredNodeValues(newRequiredNodeValues);
		if (node.flow) {
			let parsedFlow = JSON.parse(node.flow);
			flow.storeFlow(parsedFlow, uuidV4());
		}
		canvasToolbarsubject.current.next("fitStage");
	}, []);

	useEffect(() => {
		console.log("flow in bundle useffect" , flow.flow);
	}, [flow.flow]);

	const saveNode = (e) => {
		try {
			console.log("flow in saveNode" , flow.flow);
			
			const changedProperties = JSON.parse(value);
			
			if (changedProperties.id !== undefined) {
				delete changedProperties.id;
			}

			const node = {
				...requiredNodeValues,
				...changedProperties, 
				flow: JSON.stringify(flow.flow)
			};
			orgFlow.storeFlowNode(node, orgNodeName);
			
			selectedNode.selectNode(node.name, node);
			
			// TODO : trigger RUN flow

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

	if (!props.flowrunnerConnector) {
		return <></>;
	}

	return <div ref={ref => ((containerRef as any).current = ref)}>
			<Modal 
				show={true} 
				centered 
				size="xl" 
				className="tw-w-full tw-max-w-full"
				container={containerRef.current}>
				<Modal.Header>
					<Modal.Title>Edit Bundle</Modal.Title>
				</Modal.Header>
		
				<Modal.Body>
					<React.Suspense fallback={<div>Loading...</div>}>
						<>{flow.flow && <CanvasComponent 
							canvasToolbarsubject={canvasToolbarsubject.current}
							hasCustomNodesAndRepository={true} 
							formNodesubject={formNodesubject.current} 
							renderHtmlNode={props.renderHtmlNode}
							flowrunnerConnector={props.flowrunnerConnector}
							getNodeInstance={props.getNodeInstance}
							initialOpacity={1}
							flow={flows.flow}
							flowId={flows.flowId}
							flowType={flows.flowType}
							flowState={flows.flowState}
							saveFlow={flows.saveFlow}
							hasTaskNameAsNodeTitle={true}
							useFlowStore={useBundleFlowStore}
							useCanvasModeStateStore={useBundleCanvasModeStateStore}
							useSelectedNodeStore={useBundleSelectedNodeStore}
						></CanvasComponent>}</>
					</React.Suspense>
				</Modal.Body>
		
			<Modal.Footer>
				<button className="btn btn-secondary" onClick={onCloseClick}>Close</button>
				<button className="btn btn-primary" onClick={saveNode}>Save</button>
			</Modal.Footer>
		</Modal>
	</div>;
}
