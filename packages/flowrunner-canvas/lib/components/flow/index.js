import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const Flow = (props) => {
    const [internalFlow, setInternalFlow] = useState([]);
    const [isInitializing, setIsInitializing] = useState(true);
    useEffect(() => {
        console.log("FLOW in flow component useEffect", performance.now());
        setIsInitializing(false);
        if (internalFlow.length != props.flow.length) {
            console.log("internalFlow.length != props.flow.length : setInternalFlow", internalFlow.length, props.flow.length, JSON.stringify(internalFlow), JSON.stringify(props.flow));
            setInternalFlow(props.flow);
        }
        else {
            let changed = false;
            let changedNode = "";
            let changedNodeProperty = "";
            let properties = ["x", "y", "xstart", "ystart", "xend", "yend"];
            let perfstart = performance.now();
            props.flow.map((node, index) => {
                if (changed) {
                    return true;
                }
                const internalNode = internalFlow[index];
                {
                    let nodeKeys = Object.keys(node);
                    let internalNodeKeys = Object.keys(internalNode);
                    {
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
                setInternalFlow(props.flow);
            }
        }
    }, [props.flow, props.flowId]);
    useEffect(() => {
        let perfstart = performance.now();
        if (!internalFlow || isInitializing) {
            return;
        }
        props.flowrunnerConnector.pushFlowToFlowrunner(internalFlow, true, props.flowId);
        console.log("flow pushFlowToFlowrunner", (performance.now() - perfstart) + "ms");
    }, [internalFlow]);
    return _jsx(_Fragment, {});
};
//# sourceMappingURL=index.js.map