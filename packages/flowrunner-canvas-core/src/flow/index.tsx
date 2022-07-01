import * as React from 'react';
import { useEffect , useLayoutEffect ,  useState } from 'react';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

export interface IFlowProps {
	flow : any[];
	flowId: string;
	flowrunnerConnector: IFlowrunnerConnector;
}

export const Flow = (props : IFlowProps) => {
	const [internalFlow , setInternalFlow] = useState([] as any);
	const [isInitializing, setIsInitializing] = useState(true);
	useEffect(() => {
		console.log("FLOW in flow component useEffect", performance.now());
		setIsInitializing(false);
		if (internalFlow.length != props.flow.length) {
			console.log("internalFlow.length != props.flow.length : setInternalFlow",
				internalFlow.length , props.flow.length,
				JSON.stringify(internalFlow),
				JSON.stringify(props.flow)
			);
			setInternalFlow(props.flow);
		} else {
			let changed = false;
			let changedNode = "";
			let changedNodeProperty = "";
			let properties = ["x","y","xstart","ystart","xend","yend"];
			
			let perfstart = performance.now();

			props.flow.map((node, index) => {
				if (changed) {
					return true;
				}
				const internalNode = internalFlow[index];
				/*if ((node.x == internalNode.x && node.y == internalNode.y) ||
					(node.xstart == internalNode.xstart && node.xend == internalNode.xend &&
					node.ystart == internalNode.ystart && node.yend == internalNode.yend 
					)) {
					changed = true;	
				} else*/ {

					let nodeKeys = Object.keys(node);
					let internalNodeKeys = Object.keys(internalNode);
					/*if (nodeKeys.length != internalNodeKeys.length) {
						changed = true;
						changedNode = node.name;
						console.log("nodeKeys internalNodeKeys", nodeKeys , internalNodeKeys);
						changedNodeProperty = "length changed " + nodeKeys.length + " vs " + internalNodeKeys.length;
					} else */ {
						nodeKeys.map((nodeProperty) => {
							if (changed) {
								return;
							}
							if (properties.indexOf(nodeProperty) >= 0) {
								return;
							}
							if (node[nodeProperty] !== internalNode[nodeProperty]) {
								changed = true;
								changedNode = node.name;
								changedNodeProperty = nodeProperty;
							}
						});
						if (!changed) {
							internalNodeKeys.map((internalNodeProperty) => {
								if (changed) {
									return;
								}
								if (properties.indexOf(internalNodeProperty) >= 0) {
									return;
								}
								if (node[internalNodeProperty] !== internalNode[internalNodeProperty]) {
									changed = true;
									changedNode = node.name;
									changedNodeProperty = internalNodeProperty;
								}
							});
						}
					}
				}
			});

			console.log("flow diffing time", (performance.now() - perfstart) + "ms");
			
			if (changed || !!props.flowrunnerConnector.forcePushToFlowRunner) {
				console.log("flow changed", changedNode, changedNodeProperty, props.flowrunnerConnector.forcePushToFlowRunner, props.flow);

				props.flowrunnerConnector.forcePushToFlowRunner = false;
				
				// make deep copy here to prevent circulair refererence
				// flowrunner  needs its own flow
				setInternalFlow(props.flow);
			}
		}
			
	}, [props.flow, props.flowId]);

	useEffect(() => {
		let perfstart = performance.now();
		if (!internalFlow || isInitializing) {
			//internalFlow.length === 0
			// condition "internalFlow.length === 0" is needed to prevent
			// weird behavior of userinterface-view (empty flow is otherwise rendered after filled flow somehow)  
			return;
		}
		props.flowrunnerConnector.pushFlowToFlowrunner(internalFlow, true, props.flowId);
		console.log("flow pushFlowToFlowrunner", (performance.now() - perfstart) + "ms");
	}, [internalFlow]);
	return <></>;
}