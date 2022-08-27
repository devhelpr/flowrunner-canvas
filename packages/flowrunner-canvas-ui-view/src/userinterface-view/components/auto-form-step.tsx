import React from 'react';
import { useState, useRef, useLayoutEffect,useCallback } from 'react';
import { FlowToCanvas, IFlowrunnerConnector, ShapeSettings, useFlowStore } from '@devhelpr/flowrunner-canvas-core';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;

/*
	TODO: 
	- only send values to flowconnector which are
		applicable to current steps:
		remove values which are in inactive steps

		foreach formNode in flow
			if formNode is not in formSteps
				remove values from fields in this formNode

		the above doesn't work as expected

	=>	- call props.flowrunnerConnector?.modifyFlowNode
			
			for each node in flowsteps with its required
				values only?
			
			...[DOESN't WORK] or call the first node with
				only the filteredValues?

	- FormNode : force all fieldNames to be unique
		in the flow (can this cause problems??)

	- more complicated example:
		- call backend api
		- run expression
		- add formnode with more fields


*/

/*
	algorithm : find the last form/debug node in the flow which is "untouched"

		HIDE current step

		for all untouched nodes (touchedNodesLocal.current[touchNodeId] === true)
			- check if it has output nodes that are untouched
				NO : show current node
				YES : continue
			- does it have output nodes?
				NO : show current node	
		
		on previous : clear current values untouch current node ()
		on next : send form-control value into form and execute node
*/

export interface IAutoFormStepProps {
  flowrunnerConnector: IFlowrunnerConnector;
  renderHtmlNode: any;
  getNodeInstance: any;
  flow: any;
}

export const AutoFormStep = (props: IAutoFormStepProps) => {
  const flow = useFlowStore();
  let nodesStateLocal: any = useRef({} as any);
  let touchedNodesLocal: any = useRef({} as any);
  let flowRef = useRef<any>(null);
  let flowHashmapRef = useRef<any>(null);
  const [currentNode, setCurrentNode] = useState('');
  const [flowSteps, setFlowSteps] = useState<string[]>([]);
  const flowStepsRef = useRef<string[]>([]);
  const observableId = useRef(uuidV4());
  const [payload, setPayload] = useState<any>({});
  const [currentValues, setCurrentValues] = useState<any>(undefined);
  const [isLastNode, setIsLastNode] = useState(false);

  useLayoutEffect(() => {
    flowRef.current = flow.flow;
    flowHashmapRef.current = flow.flowHashmap;
  }, [flow]);

  useLayoutEffect(() => {
    flowStepsRef.current = [...flowSteps];
  }, [flowSteps]);

  const checkIfNodeHasTouchedOutputNodes = (nodeName, isDeeper) => {
    if (!nodeName) {
      return false;
    }
    //console.log('checkIfNodeHasTouchedOutputNodes', nodeName);
    if (flowHashmapRef.current && flowRef.current) {
      const nodeHash = flowHashmapRef.current.get(nodeName);

      if (isDeeper) {
        let nodeViaHash = flowRef.current[nodeHash.index];
        //console.log('check isDeeper', nodeName, nodeViaHash);
        if (nodeViaHash.taskType === 'FormTask' || nodeViaHash.taskType === 'DebugTask') {
          if (touchedNodesLocal.current[nodeViaHash.name] === true) {
            //console.log('checkingNode is touched (deeper)', nodeViaHash.name);
            return true;
          }
        }
      }

      let nodeHasTouchedOuputNode = false;
      if (nodeHash && nodeHash.start && nodeHash.start.length && nodeHash.start.length > 0) {
        let loop = 0;
        while (loop < nodeHash.start.length && !nodeHasTouchedOuputNode) {
          const checkingIndex = nodeHash.start[loop];
          const checkingNode = flowRef.current[checkingIndex];
          //console.log('checking...', nodeName, checkingNode);
          // "taskType": "FormTask",
          // "taskType": "DebugTask",
          if (checkingNode.taskType === 'FormTask' || checkingNode.taskType === 'DebugTask') {
            if (touchedNodesLocal.current[checkingNode.name] === true) {
              //console.log('checkingNode is touched', checkingNode.name);
			  setIsLastNode(true);
            } else {
              nodeHasTouchedOuputNode = checkIfNodeHasTouchedOutputNodes(checkingNode.name, true);
            }
          } else {
            if (checkingNode.taskType === 'connection') {
              nodeHasTouchedOuputNode = checkIfNodeHasTouchedOutputNodes(checkingNode.endshapeid, true);
            } else {
              nodeHasTouchedOuputNode = checkIfNodeHasTouchedOutputNodes(checkingNode.name, true);
            }
          }
          loop++;
        }
      }
      //console.log('checkIfNodeHasTouchedOutputNodes ouput', nodeName, nodeHasTouchedOuputNode);
      return nodeHasTouchedOuputNode;
    }
    return false;
  };

  const checkIfNodeHasOutputNodes = (nodeName) => {
    if (!nodeName) {
      return false;
    }
    if (flowHashmapRef.current) {
      const nodeHash = flowHashmapRef.current.get(nodeName);
      //console.log('checkIfNodeHasOutputNodes', nodeName, nodeHash, flowHashmapRef.current);
      const result = nodeHash && nodeHash.start && nodeHash.start.length && nodeHash.start.length > 0;
      if (!result) {
        //console.log('checkIfNodeHasOutputNodes no output nodes', nodeName);
      }
      return result;
    }
    return false;
  };

  const updateTouchedNodes = () => {
    if (touchedNodesLocal.current) {
      let showNode = '';
      //console.log('updateTouchedNodes', touchedNodesLocal.current);
      Object.keys(touchedNodesLocal.current).map((touchNodeId: string) => {
        if (touchNodeId !== 'undefined') {          
          const nodeHash = flowHashmapRef.current.get(touchNodeId);
          if (nodeHash && !showNode && touchNodeId && touchedNodesLocal.current[touchNodeId] === true) {
            //console.log('check nodes', touchNodeId, showNode);
            if (!checkIfNodeHasOutputNodes(touchNodeId)) {
              //console.log('check nodes checkIfNodeHasOutputNodes', touchNodeId, showNode);
              showNode = touchNodeId;
			  setCurrentValues(undefined);
            } else if (!checkIfNodeHasTouchedOutputNodes(touchNodeId, false)) {
              //console.log('check nodes checkIfNodeHasTouchedOutputNodes', touchNodeId, showNode);
              showNode = touchNodeId;
            }
            //console.log('check nodes after', touchNodeId, showNode);
          }
        }
      });

      //console.log('showNode', showNode);
      setCurrentNode(showNode);

      if (showNode && flowStepsRef.current.indexOf(showNode) < 0) {
        setFlowSteps([...flowStepsRef.current, showNode]);
      }
    }
  };

  const nodeStateObserver = (nodeName: string, nodeState: string, touchedNodes: any) => {
    //console.log('nodeStateObserver autoformstep', nodeName, nodeState, touchedNodes);
    nodesStateLocal.current[nodeName] = nodeState;
    touchedNodesLocal.current = touchedNodes;
    updateTouchedNodes();
  };

  const receivePayloadFromNode = useCallback((incomingPayload : any) => {
	//console.log("receivePayloadFromNode", currentNode, incomingPayload);
	setPayload(incomingPayload);
  }, [currentNode]);

  useLayoutEffect(() => {
    if (props.flowrunnerConnector) {
		props.flowrunnerConnector?.registerFlowNodeObserver(currentNode, observableId.current, receivePayloadFromNode);
	}
	setCurrentValues(undefined);
	setIsLastNode(!checkIfNodeHasOutputNodes(currentNode));
	return () => {
		if (props.flowrunnerConnector) {
			props.flowrunnerConnector?.unregisterFlowNodeObserver(currentNode, observableId.current);
		}
	}
  }, [currentNode]); 

  useLayoutEffect(() => {
    if (props.flowrunnerConnector) {
      props.flowrunnerConnector.unregisterNodeStateObserver('autoformstep');
      props.flowrunnerConnector.registerNodeStateObserver('autoformstep', nodeStateObserver);
    }

    return () => {
      if (props.flowrunnerConnector) {
        props.flowrunnerConnector.unregisterNodeStateObserver('autoformstep');
      }
    };
  }, [props.flowrunnerConnector]);

  const onNextStep = (event) => {
    event.preventDefault();
	if (props.flowrunnerConnector) {

		if (flowRef.current && flowSteps.length > 0) {
			let sendValues = {...payload, ...currentValues};
			flowRef.current.forEach(node => {
				if (node.taskType === "FormTask") {
					if (flowSteps.indexOf(node.name) < 0) {
						props.flowrunnerConnector?.clearNodeState(
							node.name
						);
						const metaInfo = node.metaInfo || [];
						//console.log("onNextStep metaInfo", node.name, metaInfo);
						metaInfo.forEach(field => {
							if (field && field.fieldName) {
								delete sendValues[field.fieldName];
							}
						});
					}
				}
			});
			//console.log("sendValues", sendValues);
			props.flowrunnerConnector?.modifyFlowNode(
				currentNode, 
				"", 
				undefined,
				currentNode,
				'',
				sendValues
			);
		}
	}
    return false;
  };

  const onOverrideReceiveValues = (nodeName: string, values: any) => {
	//console.log("onOverrideReceiveValues", nodeName, currentNode, values);
	if (currentNode === nodeName) {
		setCurrentValues(values);
	}
  }

  const onPreviousStep = (event) => {
    event.preventDefault();
	if (flowSteps.length > 1) {
		let previousStep = flowSteps[flowSteps.length - 2];
		let newFlowSteps = [...flowSteps];
		newFlowSteps.pop();
		setFlowSteps([...newFlowSteps]);
		setCurrentNode(previousStep);
	}
    return false;
  };

  //console.log('currentNode', currentNode, flowHashmapRef.current, flowRef.current);
  if (!currentNode) {
    return <></>;
  }
  const nodeHash = flowHashmapRef.current.get(currentNode);
  if (!nodeHash) {
    return <></>;
  }
  const node = flowRef.current[nodeHash.index];
  if (!node) {
    return <></>;
  }

  let shapeType = FlowToCanvas.getShapeType(node.shapeType, node.taskType, node.isStartEnd);
  const settings = ShapeSettings.getShapeSettings(node.taskType, node);
  //const Shape = Shapes[shapeType];
  if (shapeType === 'Html' && !!settings.hasUI) {
    //&& Shape
    const nodeClone = { ...node };

    const isSelected = false;
    nodeClone.htmlPlugin = node.htmlPlugin || (settings as any).htmlPlugin || '';

    let width = undefined;
    let height = undefined;

    if (props.getNodeInstance) {
      const instance = props.getNodeInstance(currentNode, props.flowrunnerConnector, props.flow, settings);
      if (instance) {
        if (instance.getWidth && instance.getHeight) {
          width = instance.getWidth(node);
          height = instance.getHeight(node);
        }
      }
    }
    //console.log("settings ui", node.name, isInEditMode, settings);

    return (
      <>
        <div className="w-100">
		  <div className="tw-flex tw-flex-row">
			  {flowSteps.map((item, index) => <React.Fragment key={"flowstep" + index}>
				{index > 0 && index < flowSteps.length ? <span>&nbsp;|&nbsp;</span> : ""}
			  	<span>{item}</span>
			  </React.Fragment>)}
		  </div>
          <div className="py-3">
			<div
			style={{
				width: (width || node.width || 250) + 'px',
				minHeight: (height || node.height || 250) + 'px',
				height: 'auto',
				opacity: 1,
				position: 'relative',
			}}
			id={node.name}
			data-task={node.taskType}
			data-node={node.name}
			data-html-plugin={nodeClone.htmlPlugin}
			data-node-type={node.taskType}
			data-visualizer={nodeClone.visualizer || ''}
			data-x={node.x}
			data-y={node.y}
			className="canvas__html-shape"
			>
			<div className="canvas__html-shape-body">
				{props.renderHtmlNode &&
				props.renderHtmlNode(nodeClone, props.flowrunnerConnector, props.flow, settings, 
					undefined, undefined, undefined, payload, onOverrideReceiveValues, true)}
			</div>
			</div>
          </div>
        </div>
		<div className="row mt-2 tw-justify-end">
			{flowSteps.length > 1 && 
			<div className="col-auto">
				<button className="btn btn-outline-primary" onClick={onPreviousStep}>
				Previous
				</button>
			</div>
			}
			{(!isLastNode && (currentValues || payload)) && <div className="col-auto">
				<button className="btn btn-primary" onClick={onNextStep}>Next</button>
			</div>}
		</div>
      </>
    );
  }
  return <></>;
};
