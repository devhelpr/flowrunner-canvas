import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';
import { useFlowStore } from '../../state/flow-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
export const EditNodeSettings = (props) => {
    const [show, setShow] = useState(false);
    const [value, setValue] = useState({});
    const [orgNodeName, setOrgNodeName] = useState("");
    const [orgNodeValues, setOrgNodeValues] = useState({});
    const [requiredNodeValues, setRequiredNodeValues] = useState({});
    const containerRef = useRef(null);
    const flow = useFlowStore();
    const selectedNode = useSelectedNodeStore();
    useEffect(() => {
        setShow(true);
    }, []);
    useEffect(() => {
        if (!props.node) {
            return;
        }
        const node = { ...props.node };
        let newRequiredNodeValues;
        if (node.shapeType !== "Line") {
            newRequiredNodeValues = {
                _id: node._id,
                id: node.id,
                x: node.x,
                y: node.y,
                shapeType: node.shapeType
            };
            delete node.x;
            delete node.y;
        }
        else {
            newRequiredNodeValues = {
                _id: node._id,
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
        setOrgNodeValues({ ...props.node });
        setRequiredNodeValues(newRequiredNodeValues);
    }, []);
    const saveNode = (e) => {
        try {
            const changedProperties = value;
            if (changedProperties.id !== undefined) {
                delete changedProperties.id;
            }
            const node = { ...requiredNodeValues, ...changedProperties };
            props.flowrunnerConnector.resetCurrentFlow();
            flow.storeFlowNode(node, orgNodeName);
            selectedNode.selectNode(node.name, node);
            props.onClose(true);
        }
        catch (err) {
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
    const onSetValue = (newValue, fieldName) => {
        setValue({ ...value, [fieldName]: newValue });
    };
    return _jsx("div", { className: "edit-node-settings", ref: containerRef, children: _jsxs(Modal, { show: show, centered: true, size: props.modalSize || "lg", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsxs(Modal.Title, { children: ["Edit ", !!props.hasTaskNameAsNodeTitle ? props.node.taskType : props.node.name] }) }), _jsx(Modal.Body, { children: _jsx("div", { className: "form-group", children: _jsx(FormNodeHtmlPlugin, { isNodeSettingsUI: true, node: props.node, taskSettings: props.settings, onSetValue: onSetValue, isInFlowEditor: false, flowrunnerConnector: props.flowrunnerConnector }) }) }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: onCloseClick, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Save" })] })] }) });
};
//# sourceMappingURL=index.js.map