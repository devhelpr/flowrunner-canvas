import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useFlowStore } from '../../state/flow-state';
export const EditFlowName = (props) => {
    var _a, _b;
    const [show, setShow] = useState(false);
    const [value, setValue] = useState((_b = (_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.getFlowName()) !== null && _b !== void 0 ? _b : "");
    const containerRef = useRef(null);
    const flow = useFlowStore();
    useEffect(() => {
        setShow(true);
    }, []);
    const saveNode = (e) => {
        var _a;
        if (props.flowrunnerConnector.hasStorageProvider) {
            (_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.setFlowName(flow.flowId, value).then((result) => {
                props.onSaveFlowName(flow.flowId, value);
            });
        }
        else {
            alert("Edit flow name is only supported for StorageProvider");
            props.onClose();
        }
        e.preventDefault();
        return false;
    };
    const onChangeFlowName = (event) => {
        event.preventDefault();
        setValue(event.target.value);
        return false;
    };
    return _jsxs(_Fragment, { children: [_jsx("div", { ref: containerRef }), _jsxs(Modal, { show: show, centered: true, size: "sm", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: "Edit Flow Name" }) }), _jsx(Modal.Body, { children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Flow name" }), _jsx("input", { className: "form-control", value: value, required: true, onChange: onChangeFlowName })] }) }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: props.onClose, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Save" })] })] })] });
};
//# sourceMappingURL=index.js.map