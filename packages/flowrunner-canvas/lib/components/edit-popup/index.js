import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useFlowStore } from '../../state/flow-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
export const EditPopup = (props) => {
    const [value, setValue] = useState("");
    const [orgNodeName, setOrgNodeName] = useState("");
    const [orgNodeValues, setOrgNodeValues] = useState({});
    const [requiredNodeValues, setRequiredNodeValues] = useState({});
    const containerRef = useRef(null);
    const flow = useFlowStore();
    const selectedNode = useSelectedNodeStore();
    useEffect(() => {
        const node = { ...selectedNode.node.node };
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
        delete node.observable;
        console.log("EditPopup", node);
        setValue(JSON.stringify(node, null, 2));
        setOrgNodeName(selectedNode.node.name);
        setOrgNodeValues({ ...selectedNode.node });
        setRequiredNodeValues(newRequiredNodeValues);
    }, []);
    const saveNode = (e) => {
        try {
            const changedProperties = JSON.parse(value);
            if (changedProperties.id !== undefined) {
                delete changedProperties.id;
            }
            const node = { ...requiredNodeValues, ...changedProperties };
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
    return _jsx("div", { ref: ref => (containerRef.current = ref), children: _jsxs(Modal, { show: true, centered: true, size: "xl", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: "Edit Node JSON" }) }), _jsx(Modal.Body, { children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Node JSON" }), _jsx("textarea", { className: "form-control edit-popup__json", rows: 8, value: value, onChange: (e) => { setValue(e.target.value); } })] }) }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: onCloseClick, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Save" })] })] }) });
};
//# sourceMappingURL=index.js.map