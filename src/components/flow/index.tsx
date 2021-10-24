import * as React from 'react';
import { useEffect , useLayoutEffect ,  useState } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface IFlowProps {
	flow : any[];
	flowId: string;
	flowrunnerConnector: IFlowrunnerConnector;
}

export const Flow = (props : IFlowProps) => {
	const [internalFlow , setInternalFlow] = useState([] as any);

	useEffect(() => {
		console.log("FLOW in flow component useEffect", performance.now());
		if (internalFlow.length != props.flow.length) {
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
		if (!internalFlow) {
			return;
		}
		props.flowrunnerConnector.pushFlowToFlowrunner(internalFlow, true, props.flowId);
		console.log("flow pushFlowToFlowrunner", (performance.now() - perfstart) + "ms");
	}, [internalFlow]);
	return <></>;
}