import { useEffect, useState } from 'react';
import fetch from 'cross-fetch';

import { IFlowrunnerConnector } from './interfaces/IFlowrunnerConnector';
import { useFlowStore} from './state/flow-state';
import { useLayoutStore } from './state/layout-state';
import { useCanvasModeStateStore} from './state/canvas-mode-state';

import { getPosition } from './services/position-service';


export enum FlowState {
	idle = 0,
	loading,
	loaded,
	error
}

export const useFlows = (flowrunnerConnector : IFlowrunnerConnector, flowId?: string|number) => {
	const [flowState, setFlowState] = useState(FlowState.idle);
	const [currentFlowId, setCurrentFlowId] = useState(flowId);
	const [flow, setFlow] = useState([] as any[]);
	const [flows, setFlows] = useState([] as any[] | undefined);
	const [flowType , setFlowType] = useState("");

	const flowStore = useFlowStore();
	const layout = useLayoutStore();
	const canvasMode = useCanvasModeStateStore();

	const getFlows = () => {
		if (flowrunnerConnector.hasStorageProvider) {
			const flows = flowrunnerConnector.storageProvider?.getFlows();
			console.log("useflow getFlows", flows);
			setFlows(flows);
			loadFlow((flowId === undefined && flows) ? flows[0].id : flowId);
			return;
		};

		fetch('/get-flows')
		.then(res => {
			if (res.status >= 400) {
				setFlowState(FlowState.error);
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(flows => {
			if (flows.length > 0) {
				setFlows(flows);
				const id = (flowId === undefined) ? flows[0].id : currentFlowId;
				loadFlow(id);
			}
		})
		.catch(err => {
			console.error(err);
		});
	}

	const loadFlow = (flowId?: string|number) => {
		setCurrentFlowId(flowId);	
		setFlowState(FlowState.loading);
	}
	
	useEffect(() => {
		if (flowState == FlowState.loading) {
			if (flowrunnerConnector.hasStorageProvider) {
				const flowPackage : any = flowrunnerConnector.storageProvider?.getFlow(currentFlowId as string) as any;
				flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				setFlowType(flowPackage.flowType || "playground");
				canvasMode.setFlowType(flowPackage.flowType || "playground");
				flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
				setFlow(flowPackage.flow);
				layout.storeLayout(JSON.stringify(flowPackage.layout));
				setFlowState(FlowState.loaded);
				return;
			}

			fetch('/flow?flow=' + currentFlowId)
			.then(res => {
				if (res.status >= 400) {
					setFlowState(FlowState.error);
					throw new Error("Bad response from server");
				}
				return res.json();
			})
			.then(flowPackage => {
				flowrunnerConnector.setFlowType(flowPackage.flowType || "playground");
				setFlowType(flowPackage.flowType || "playground");
				canvasMode.setFlowType(flowPackage.flowType || "playground");
				flowStore.storeFlow(flowPackage.flow, currentFlowId as string);
				setFlow(flowPackage.flow);		
				layout.storeLayout(JSON.stringify(flowPackage.layout));
				setFlowState(FlowState.loaded);
			})
			.catch(err => {
				console.error(err);
				setFlowState(FlowState.error);
			});
		}
	}, [flowState])

	const onGetFlows = (id? : string | number) => {
		setCurrentFlowId(id);
		getFlows();
	}

	const saveFlow = (selectedFlow?) => {
		const flowAndUpdatedPositions = flowStore.flow.map((node) => {
			let updatedNode = {...node};
			if (node.x && node.y && node.shapeType !== "Line") {
				const position = getPosition(node.name);
				updatedNode.x = position.x;
				updatedNode.y = position.y;
			} else if (node.xstart && node.ystart  && node.shapeType === "Line") {
				const position = getPosition(node.name);
				
				updatedNode.xstart = position.xstart;
				updatedNode.ystart = position.ystart;
				updatedNode.xend = position.xend;
				updatedNode.yend = position.yend;
			}
			return updatedNode;
		});
		if (flowrunnerConnector.hasStorageProvider) {
			flowrunnerConnector.storageProvider?.saveFlow(currentFlowId as string, flowAndUpdatedPositions);
			if (selectedFlow) {
				loadFlow(selectedFlow); //,true
			}
		} else {
			fetch('/save-flow?id=' + selectedFlow, {
				method: "POST",
				body: JSON.stringify({
					flow: flowAndUpdatedPositions,
					layout: JSON.parse(layout.layout),
					flowType: canvasMode.flowType
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then(res => {
					if (res.status >= 400) {
						throw new Error("Bad response from server");
					}
					
					return res.json();
				})
				.then(status => {
					if (selectedFlow) {
						loadFlow(selectedFlow); //,true
					}
				})
				.catch(err => {
					console.error(err);
				});
		}
	}

	return {
		flowState,
		flowId,
		flow,
		flowType,
		flows,
		getFlows,
		loadFlow,
		onGetFlows,
		saveFlow
	};
  };