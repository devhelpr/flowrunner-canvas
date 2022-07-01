import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FormNodeHtmlPlugin } from '../html-plugins/form-node';
export const EditNodePopup = (props) => {
    const [show, setShow] = useState(false);
    const [value, setValue] = useState({});
    const [orgNodeName, setOrgNodeName] = useState("");
    const [orgNodeValues, setOrgNodeValues] = useState({});
    const [requiredNodeValues, setRequiredNodeValues] = useState({});
    const containerRef = useRef(null);
    const flow = props.useFlowStore();
    const selectNode = props.useSelectedNodeStore(state => state.selectNode);
    useEffect(() => {
        setShow(true);
    }, []);
    useEffect(() => {
        if (!props.node) {
            return;
        }
        const node = { ...props.node };
        selectNode(props.node.name, props.node);
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
            let nodeHelper = flow.flowHashmap.get(props.node.name);
            if (nodeHelper) {
                const nodeFromFlowStore = flow.flow[nodeHelper.index];
                console.log("saveFlow", nodeFromFlowStore);
                if (props.formNodesubject) {
                    props.formNodesubject.next({ "id": props.node.name, "node": nodeFromFlowStore });
                }
            }
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
        console.log("editnode onsetvalue", newValue, fieldName);
        setValue({ ...value, [fieldName]: newValue });
    };
    return _jsx("div", { className: "edit-node-settings edit-node-popup", ref: containerRef, children: _jsxs(Modal, { show: show, centered: true, size: props.modalSize || "xl", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsxs(Modal.Title, { children: ["Edit ", !!props.hasTaskNameAsNodeTitle ? props.node.taskType : props.node.name] }) }), _jsx(Modal.Body, { children: _jsx("div", { className: "form-group", children: _jsx(FormNodeHtmlPlugin, { isNodeSettingsUI: false, node: props.node, taskSettings: props.settings, onSetValue: onSetValue, isInFlowEditor: true, flowrunnerConnector: props.flowrunnerConnector, useFlowStore: props.useFlowStore }) }) }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: onCloseClick, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Save" })] })] }) });
};
//# sourceMappingURL=index.js.map