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
		//console.log("FLOW in flow component useEffect", props.flow);
		if (internalFlow.length != props.flow.length) {
			setInternalFlow(props.flow);
		} else {
			let changed = false;
			let changedNode = "";
			let changedNodeProperty = "";
			let properties = ["x","y","xstart","ystart","xend","yend"];

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
			if (changed) {
				console.log("flow changed", changedNode, changedNodeProperty);
				setInternalFlow(props.flow);
			}
		}
			
	}, [props.flow, props.flowId]);

	useEffect(() => {
		props.flowrunnerConnector.pushFlowToFlowrunner(internalFlow, true, props.flowId);
	}, [internalFlow]);
	return <></>;
}