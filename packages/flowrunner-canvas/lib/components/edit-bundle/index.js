import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Subject } from 'rxjs';
import { useBundleFlowStore, useFlowStore } from '../../state/flow-state';
import { useBundleSelectedNodeStore, useSelectedNodeStore } from '../../state/selected-node-state';
import { useBundleCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useFlows } from '../../use-flows';
import { usePositionContext } from '../contexts/position-context';
import { Canvas } from '../canvas';
import * as uuid from 'uuid';
import { FlowConnector } from '../../flow-connector';
const uuidV4 = uuid.v4;
export const EditBundle = (props) => {
    const positionContext = usePositionContext();
    const [value, setValue] = useState("");
    const [orgNodeName, setOrgNodeName] = useState("");
    const [orgNodeValues, setOrgNodeValues] = useState({});
    const [requiredNodeValues, setRequiredNodeValues] = useState({});
    const containerRef = useRef(null);
    const canvasToolbarsubject = useRef(new Subject());
    const formNodesubject = useRef(new Subject());
    const flows = useFlows(props.flowrunnerConnector, useBundleFlowStore);
    const flow = useBundleFlowStore();
    const orgFlow = useFlowStore();
    const selectedNode = useSelectedNodeStore();
    const flowrunnerConnector = useRef((() => {
        const flowConnector = new FlowConnector();
        if (props.flowrunnerConnector.storageProvider &&
            props.flowrunnerConnector.hasStorageProvider) {
            flowConnector.storageProvider = props.flowrunnerConnector.storageProvider;
            flowConnector.hasStorageProvider = true;
            console.log("tasks", props.flowrunnerConnector.storageProvider.getTasks());
        }
        return flowConnector;
    })());
    useEffect(() => {
        var _a;
        console.log("flow changed in bundle", flow.flow);
        if (requiredNodeValues && orgNodeName && value && flow.flow) {
            const editedNode = JSON.parse(value);
            const node = {
                ...requiredNodeValues,
                ...editedNode,
                name: orgNodeName,
                id: orgNodeName,
                flow: JSON.stringify(flow.flow)
            };
            orgFlow.storeFlowNode(node, orgNodeName, positionContext.context);
            (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(orgNodeName, "flow", JSON.stringify(flow.flow), orgNodeName);
        }
    }, [flow.flow, requiredNodeValues, orgNodeName, value]);
    const onMessageFromFlow = useCallback((event, flowAgent) => {
        if (event.data.command === 'modifyFlowNode') {
            console.log("onMessageFromFlow modifyFlowNode", event.data, flow.flow);
        }
    }, [flow.flow]);
    useEffect(() => {
        const node = { ...selectedNode.node.node };
        const newRequiredNodeValues = {
            _id: node._id,
            id: node.id,
            x: node.x,
            y: node.y,
            shapeType: node.shapeType,
            taskType: node.taskType
        };
        delete node.x;
        delete node.y;
        delete node._id;
        delete node.id;
        delete node.shapeType;
        delete node.observable;
        console.log("EditPopup", node);
        setValue(JSON.stringify(node, null, 2));
        setOrgNodeName(selectedNode.node.name);
        setOrgNodeValues({ ...selectedNode.node });
        setRequiredNodeValues(newRequiredNodeValues);
        if (node.flow) {
            let parsedFlow = JSON.parse(node.flow);
            flows.loadFlowFromMemory(parsedFlow, uuidV4());
        }
        flowrunnerConnector.current.modifyFlowNode = onModifyFlowNode;
    }, []);
    const onModifyFlowNode = useCallback((nodeName, propertyName, value, executeNode, eventName, additionalValues) => {
        console.log("onModifyFlowNode in bundle", nodeName, propertyName, value, additionalValues);
        props.flowrunnerConnector.modifyFlowNode(nodeName, propertyName, value, executeNode, eventName, additionalValues, true, orgNodeName);
    }, [flow.flow, orgNodeName]);
    const saveNode = (e) => {
        var _a;
        try {
            console.log("flow in saveNode", flow.flow);
            const editedNode = JSON.parse(value);
            const flowAndUpdatedPositions = flow.flow.map(node => {
                let updatedNode = { ...node };
                if (node.x !== undefined && node.y !== undefined && node.shapeType !== 'Line') {
                    const position = positionContext.getPosition(node.name);
                    if (position) {
                        updatedNode.x = position.x;
                        updatedNode.y = position.y;
                    }
                }
                else if (node.xstart !== undefined && node.ystart !== undefined && node.shapeType === 'Line') {
                    const position = positionContext.getPosition(node.name);
                    if (position) {
                        updatedNode.xstart = position.xstart;
                        updatedNode.ystart = position.ystart;
                        updatedNode.xend = position.xend;
                        updatedNode.yend = position.yend;
                    }
                }
                return updatedNode;
            });
            const node = {
                ...requiredNodeValues,
                ...editedNode,
                name: orgNodeName,
                id: orgNodeName,
                flow: JSON.stringify(flowAndUpdatedPositions)
            };
            orgFlow.storeFlowNode(node, orgNodeName, positionContext.context);
            (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(orgNodeName, "flow", JSON.stringify(flowAndUpdatedPositions), orgNodeName);
            selectedNode.selectNode(node.name, node);
            props.onClose(true);
        }
        catch (err) {
            console.log(`Error while storing bundle: ${err}`);
            alert("The json in the 'Node JSON' field is invalid");
        }
        e.preventDefault();
        return false;
    };
    const onCloseClick = (event) => {
        event.preventDefault();
        props.onClose();
        return false;
    };
    if (!props.flowrunnerConnector) {
        return _jsx(_Fragment, {});
    }
    if (!flow.flow) {
        return _jsx(_Fragment, {});
    }
    return _jsx("div", { className: "edit-bundle", ref: ref => (containerRef.current = ref), children: _jsxs(Modal, { show: true, centered: true, size: props.modalSize || "xl", className: "tw-w-full tw-max-w-full", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: "Edit Bundle" }) }), _jsx(Modal.Body, { children: _jsx(Canvas, { externalId: "EditBundleCanvas", isEditingInModal: true, canvasToolbarsubject: canvasToolbarsubject.current, showsStateMachineUpdates: false, hasCustomNodesAndRepository: false, hasTaskNameAsNodeTitle: props.hasTaskNameAsNodeTitle, formNodesubject: formNodesubject.current, renderHtmlNode: props.renderHtmlNode, flowrunnerConnector: flowrunnerConnector.current, getNodeInstance: props.getNodeInstance, initialOpacity: 0, flowHasNodes: true, flowId: flows.flowId, flowType: flows.flowType, flowState: flows.flowState, saveFlow: flows.saveFlow, useFlowStore: useBundleFlowStore, useCanvasModeStateStore: useBundleCanvasModeStateStore, useSelectedNodeStore: useBundleSelectedNodeStore }) }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: onCloseClick, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Save" })] })] }) });
};
//# sourceMappingURL=index.js.map