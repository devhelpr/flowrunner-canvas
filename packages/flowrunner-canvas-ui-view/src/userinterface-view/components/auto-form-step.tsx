import React from 'react';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import {
  FlowToCanvas,
  IFlowrunnerConnector,
  IFormInfoProps,
  ShapeSettings,
  useFlowStore,
} from '@devhelpr/flowrunner-canvas-core';
import * as uuid from 'uuid';
import './auto-form-step.css';
const uuidV4 = uuid.v4;

/*
	TODO: 
	- if a form-node is in a Section ...
    - store the section
    - get the next step(s) from within the section
  
    - after filling in the form .. and it's in a valid state

      .. peek at the next node using the values from the current form-node
      .. if the next step is in the section, show it below the current form-node
          .. if it's not in the current section.. show/enabled the submit button
      .. when the user makes a change to the upper form-nodes.. reset and hide all form-nodes below
      .. after filling in this next form step (which appeared below the upper form-node) do the same as is above here

    - show/enabled submit button when all form-nodes are in a valid-state and when submitted .. 
        send the values to each step individually one by one

    - if a form-node is not in a section , reset the "section-mode" (clear the current section)



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

export interface IFormStep {
  title: string;
  nodeName: string;
}

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
  let formInfoRef = useRef<IFormInfoProps | undefined>(undefined);

  const [currentNode, setCurrentNode] = useState<any>(undefined);
  const [flowSteps, setFlowSteps] = useState<IFormStep[]>([]);
  const flowStepsRef = useRef<IFormStep[]>([]);
  const observableId = useRef(uuidV4());
  const [payload, setPayload] = useState<any>({});
  const [currentValues, setCurrentValues] = useState<any>(undefined);
  const [isLastNode, setIsLastNode] = useState(false);
  const [allFlowSteps, setAllFlowSteps] = useState<string[]>([]);

  const getFormFlowPath = (nodeName, nodeIndex) => {
    let path: string[] = [];
    const nodeHash = flowHashmapRef.current.get(nodeName);
    if (nodeHash) {
      const nodeByIndex = flowRef.current[nodeHash.index];
      const settings = ShapeSettings.getShapeSettings(nodeByIndex.taskType, nodeByIndex);
      if (settings.hasUI || nodeByIndex.taskType === 'FormTask' || nodeByIndex.taskType === 'DebugTask') {
        path.push(nodeByIndex.formStepTitle || nodeByIndex.formTitle || nodeByIndex.name);
      }

      if (nodeHash.start.length > 0) {
        const startNodeByIndex = flowRef.current[nodeHash.start[0]];
        if (startNodeByIndex) {
          if (startNodeByIndex.taskType === 'connection') {
            const startshapeHash = flowHashmapRef.current.get(startNodeByIndex.endshapeid);
            if (startshapeHash) {
              const startshapeByIndex = flowRef.current[startshapeHash.index];
              if (startshapeByIndex) {
                path = [...path, ...getFormFlowPath(startshapeByIndex.name, startshapeHash.index)];
              }
            }
          } else {
            path = [...path, ...getFormFlowPath(startNodeByIndex.name, nodeHash.start[0])];
          }
        }
      }
    }
    return path;
  };

  useLayoutEffect(() => {
    document.body.classList.add('auto-form-step__body');
  }, []);

  useLayoutEffect(() => {
    flowRef.current = flow.flow;
    flowHashmapRef.current = flow.flowHashmap;
    if (flow.flow && flow.flowHashmap) {
      let startNodeName = '';
      let startNodeIndex = -1;
      let startNode: any = undefined;
      flow.flow.forEach((node, index) => {
        if (
          node.taskType !== 'connection' &&
          node.taskType !== 'FunctionInputTask' &&
          node.taskType !== 'Annotation' &&
          node.taskType !== 'Section'
        ) {
          const nodeHash = flow.flowHashmap.get(node.name);
          if (nodeHash && nodeHash.end) {
            if (!startNodeName && nodeHash.end.length === 0) {
              startNodeName = node.name;
              startNodeIndex = index;
              startNode = node;
            }
          }
        }
      });

      if (startNodeIndex >= 0) {
        let helper: string[] = [];
        const settings = ShapeSettings.getShapeSettings(startNode.taskType, startNode);
        if (settings.hasUI || startNode.taskType === 'FormTask' || startNode.taskType === 'DebugTask') {
          helper = [startNodeName];
        }
        helper = [...helper, ...getFormFlowPath(startNodeName, startNodeIndex)];
        setAllFlowSteps(helper);
      }
    }
  }, [flow]);

  useLayoutEffect(() => {
    flowStepsRef.current = [...flowSteps];
  }, [flowSteps]);

  const checkIfNodeHasTouchedOutputNodes = (nodeName, isDeeper) => {
    if (!nodeName) {
      return false;
    }
    if (flowHashmapRef.current && flowRef.current) {
      const nodeHash = flowHashmapRef.current.get(nodeName);

      if (isDeeper) {
        let nodeViaHash = flowRef.current[nodeHash.index];
        const settings = ShapeSettings.getShapeSettings(nodeViaHash.taskType, nodeViaHash);
        if (settings.hasUI || nodeViaHash.taskType === 'FormTask' || nodeViaHash.taskType === 'DebugTask') {
          if (touchedNodesLocal.current[nodeViaHash.name] === true) {
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
          const settings = ShapeSettings.getShapeSettings(checkingNode.taskType, checkingNode);
          if (settings.hasUI || checkingNode.taskType === 'FormTask' || checkingNode.taskType === 'DebugTask') {
            if (touchedNodesLocal.current[checkingNode.name] === true) {
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
      const result = nodeHash && nodeHash.start && nodeHash.start.length && nodeHash.start.length > 0;
      return result;
    }
    return false;
  };

  const updateTouchedNodes = useCallback(() => {
    if (touchedNodesLocal.current) {
      let showNode = '';
      Object.keys(touchedNodesLocal.current).forEach((touchNodeId: string) => {
        if (touchNodeId !== 'undefined') {
          const nodeHash = flowHashmapRef.current.get(touchNodeId);
          if (nodeHash && !showNode && touchNodeId && touchedNodesLocal.current[touchNodeId] === true) {
            if (!checkIfNodeHasOutputNodes(touchNodeId)) {
              showNode = touchNodeId;
              setCurrentValues(undefined);
            } else if (!checkIfNodeHasTouchedOutputNodes(touchNodeId, false)) {
              showNode = touchNodeId;
            }
          }
        }
      });

      if (showNode && flowStepsRef.current.findIndex((item) => item.nodeName === showNode) < 0) {
        let title = showNode;
        if (flowHashmapRef.current) {
          const flowHash = flowHashmapRef.current.get(showNode);
          if (flowHash) {
            const nodeViaFlowHash = flowRef.current[flowHash.index];
            const settings = ShapeSettings.getShapeSettings(nodeViaFlowHash.taskType, nodeViaFlowHash);
            if (
              nodeViaFlowHash &&
              (settings.hasUI || nodeViaFlowHash.taskType === 'FormTask' || nodeViaFlowHash.taskType === 'DebugTask')
            ) {
              title = nodeViaFlowHash.formStepTitle || nodeViaFlowHash.formTitle || showNode;

              setCurrentNode(nodeViaFlowHash);

              setFlowSteps((flowSteps) => {
                if (flowSteps.length > 0) {
                  if (flowSteps[flowSteps.length - 1].nodeName === showNode) {
                    return [...flowSteps];
                  }
                }
                return [
                  ...flowSteps,
                  {
                    nodeName: showNode,
                    title: title,
                  },
                ];
              });
            }
          }
        }
      }
    }
  }, [currentNode]);

  const nodeStateObserver = useCallback(
    (nodeName: string, nodeState: string, touchedNodes: any, incomingPayload?: any) => {
      if (nodeState !== 'before') {
        return;
      }
      if (incomingPayload) {
        setPayload(incomingPayload);
      }
      nodesStateLocal.current[nodeName] = nodeState;
      touchedNodesLocal.current = touchedNodes;
      updateTouchedNodes();
    },
    [currentNode],
  );

  const receivePayloadFromNode = useCallback(
    (incomingPayload: any) => {
      setPayload(incomingPayload);
    },
    [currentNode],
  );

  useLayoutEffect(() => {
    let registeredNode = currentNode?.name ?? '';
    if (currentNode && props.flowrunnerConnector) {
      props.flowrunnerConnector?.registerFlowNodeObserver(
        currentNode.name,
        observableId.current,
        receivePayloadFromNode,
      );
    }
    setCurrentValues(undefined);
    if (registeredNode) {
      setIsLastNode(!checkIfNodeHasOutputNodes(registeredNode));
    }
    return () => {
      if (registeredNode && props.flowrunnerConnector) {
        props.flowrunnerConnector?.unregisterFlowNodeObserver(registeredNode, observableId.current);
      }
    };
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
    const settings = ShapeSettings.getShapeSettings(currentNode?.taskType, currentNode);
    if (
      currentNode &&
      currentNode.taskType !== 'FormTask' &&
      (currentNode.taskType === 'DebugTask' || settings.hasUI)
    ) {
      if (props.flowrunnerConnector) {
        props.flowrunnerConnector?.modifyFlowNode(currentNode.name, '', undefined, currentNode.name, '', {
          waitForUserSubmit: true,
        });
      }
      return;
    }

    if (
      !formInfoRef.current ||
      (formInfoRef.current && formInfoRef.current.onCanSubmitForm && !formInfoRef.current.onCanSubmitForm())
    ) {
      return;
    }

    if (props.flowrunnerConnector) {
      if (flowRef.current && flowSteps.length > 0) {
        let sendValues = { ...payload, ...currentValues };

        // temp workaround for removing properties of current node
        let metaInfoCurrentNode: any[] = [];
        flowRef.current.forEach((node) => {
          if (node.name === currentNode.name) {
            metaInfoCurrentNode = node.metaInfo || [];
          }
        });
        let fieldInCurrentNode: string[] = [];
        metaInfoCurrentNode.forEach((field) => fieldInCurrentNode.push(field.fieldName));

        // end temp workaround
        flowRef.current.forEach((node) => {
          // TODO : should check if node is in current down or upstream
          if (node.taskType === 'FormTask') {
            if (flowSteps.findIndex((item) => item.nodeName === node.name) < 0) {
              props.flowrunnerConnector?.clearNodeState(node.name);
              const metaInfo = node.metaInfo || [];
              metaInfo.forEach((field) => {
                if (field && field.fieldName && fieldInCurrentNode.indexOf(field.fieldName) < 0) {
                  delete sendValues[field.fieldName];
                }
              });
            }
          }
        });
        sendValues.waitForUserSubmit = true;
        props.flowrunnerConnector?.modifyFlowNode(currentNode.name, '', undefined, currentNode.name, '', sendValues);
      }
    }
    return false;
  };

  const onOverrideReceiveValues = (nodeName: string, values: any) => {
    if (currentNode && currentNode.name === nodeName) {
      setCurrentValues(values);
    }
  };

  const onPreviousStep = (event) => {
    event.preventDefault();
    if (flowSteps.length > 1) {
      let previousStep = flowSteps[flowSteps.length - 2];
      let newFlowSteps = [...flowSteps];
      newFlowSteps.pop();
      setFlowSteps([...newFlowSteps]);

      if (flowHashmapRef.current) {
        const flowHash = flowHashmapRef.current.get(previousStep.nodeName);
        if (flowHash) {
          const nodeViaFlowHash = flowRef.current[flowHash.index];
          if (nodeViaFlowHash) {
            setCurrentNode(nodeViaFlowHash);
          }
        }
      }
    }
    return false;
  };

  const onFormInfo = (formInfo: IFormInfoProps) => {
    formInfoRef.current = formInfo;
  };

  if (!currentNode) {
    return <></>;
  }
  const nodeHash = flowHashmapRef.current.get(currentNode.name);
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
      const instance = props.getNodeInstance(currentNode.name, props.flowrunnerConnector, props.flow, settings);
      if (instance) {
        if (instance.getWidth && instance.getHeight) {
          width = instance.getWidth(node);
          height = instance.getHeight(node);
        }
      }
    }

    let initialDatasource: any = {};
    let datasourcePropertyName: any = undefined;
    if (currentNode?.taskType === 'FormTask' && payload) {
      currentNode.metaInfo.map((metaInfo) => {
        if (metaInfo.datasource && payload[metaInfo.datasource]) {
          datasourcePropertyName = metaInfo.datasource;
        }
      });

      if (datasourcePropertyName) {
        if (datasourcePropertyName) {
          initialDatasource[datasourcePropertyName] = payload[datasourcePropertyName];
        }
      }
    }

    return (
      <>
        <div className={`w-100 auto-form-step ${currentNode?.cssClassName ?? ''}`}>
          <h1>{currentNode.formTitle || currentNode.name}</h1>
          <div className="tw-flex tw-flex-row">
            {allFlowSteps.map((item, index) => {
              const separator = index > 0 && index < allFlowSteps.length ? <span>&nbsp;|&nbsp;</span> : '';
              if (currentNode) {
                const currentStepTitle = currentNode.formStepTitle || currentNode.formTitle || currentNode.name;
                if (currentStepTitle === item) {
                  return (
                    <React.Fragment key={'flowstep' + index}>
                      {separator}
                      <span>
                        <strong>{item}</strong>
                      </span>
                    </React.Fragment>
                  );
                }
              }
              const className = flowSteps.find((step) => step.title === item) ? '' : 'tw-text-gray-300';
              return (
                <React.Fragment key={'flowstep' + index}>
                  {separator}
                  <span className={className}>{item}</span>
                </React.Fragment>
              );
            })}
          </div>
          <div className="py-3">
            <div
              key={currentNode?.name}
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
              data-visualizer={nodeClone.visualizer || (settings.hasUI ? 'has-ui' : '') || ''}
              data-x={node.x}
              data-y={node.y}
              className="canvas__html-shape"
            >
              <div className="canvas__html-shape-body">
                {props.renderHtmlNode &&
                  props.renderHtmlNode(
                    nodeClone,
                    props.flowrunnerConnector,
                    props.flow,
                    settings,
                    undefined,
                    undefined,
                    undefined,
                    payload,
                    onOverrideReceiveValues,
                    true,
                    onFormInfo,
                    true,
                    initialDatasource,
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-2 tw-justify-end">
          {flowSteps.length > 1 && (
            <div className="col-auto">
              <button
                className="tw-bg-transparent tw-border tw-border-blue-500 hover:tw-border-blue-700 tw-text-blue-700 tw-font-bold tw-py-2 tw-px-4 tw-rounded"
                type="button"
                onClick={onPreviousStep}
              >
                Previous
              </button>
            </div>
          )}
          {!isLastNode && (currentValues || payload) && (
            <div className="col-auto">
              <button
                className="tw-bg-blue-500 hover:tw-bg-blue-700 tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded"
                type="submit"
                form={`form-${currentNode.name}`}
                onClick={onNextStep}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </>
    );
  }
  return <></>;
};
