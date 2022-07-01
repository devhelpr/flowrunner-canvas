import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import fetch from 'cross-fetch';
import { useFlowStore } from '../../state/flow-state';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
export const NewFlow = (props) => {
    const [show, setShow] = useState(false);
    const [value, setValue] = useState("");
    const [orgNodeName, setOrgNodeName] = useState("");
    const [orgNodeValues, setOrgNodeValues] = useState({});
    const [requiredNodeValues, setRequiredNodeValues] = useState({});
    const [flowType, setFlowType] = useState("playground");
    const [addJSONFlow, setAdJSONFlow] = useState(false);
    const [json, setJSON] = useState("");
    const containerRef = useRef(null);
    const flow = useFlowStore();
    const canvasMode = useCanvasModeStateStore();
    useEffect(() => {
        setShow(true);
    }, []);
    const saveNode = (e) => {
        var _a;
        if (addJSONFlow) {
            try {
                let flow = JSON.parse(json);
                if (!Array.isArray(flow)) {
                    alert("The JSON should be an array of nodes and connections");
                    return;
                }
            }
            catch (err) {
                alert("Error in JSON: " + err);
                return;
            }
        }
        if (props.flowrunnerConnector.hasStorageProvider) {
            (_a = props.flowrunnerConnector.storageProvider) === null || _a === void 0 ? void 0 : _a.addFlow(value, JSON.parse(json || "[]")).then((result) => {
                props.onSave(result.id, flowType);
            });
        }
        else {
            try {
                fetch('/flow?flow=' + value +
                    "&flowType=" + flowType +
                    "&addJSONFlow=" + addJSONFlow, {
                    method: "post",
                    body: JSON.stringify({
                        nodes: JSON.parse(json || "[]")
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((response) => {
                    if (response.status >= 400) {
                        throw new Error("Bad response from server");
                    }
                    return response.json();
                }).then((result) => {
                    props.onSave(result.id, flowType);
                });
            }
            catch (err) {
                console.log("new-flow err", err);
                alert("Error while adding flow");
            }
        }
        e.preventDefault();
        return false;
    };
    const onAddJSONFlow = (event) => {
        event.preventDefault();
        setAdJSONFlow(!addJSONFlow);
        return false;
    };
    const onChangeJson = (event) => {
        event.preventDefault();
        setJSON(event.target.value);
        return false;
    };
    const onChangeFlowName = (event) => {
        event.preventDefault();
        setValue(event.target.value);
        return false;
    };
    const onChangeFlowType = (event) => {
        event.preventDefaul();
        setFlowType(event.target.value);
        return false;
    };
    return _jsxs(_Fragment, { children: [_jsx("div", { ref: containerRef }), _jsxs(Modal, { show: show, centered: true, size: addJSONFlow ? "xl" : "sm", container: containerRef.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: "Add new Flow" }) }), _jsxs(Modal.Body, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Flow name" }), _jsx("input", { className: "form-control", value: value, required: true, onChange: onChangeFlowName })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Flow type" }), _jsxs("select", { className: "form-control form-select", value: flowType, onChange: onChangeFlowType, children: [_jsx("option", { value: "playground", children: "Playground" }), _jsx("option", { value: "rustflowrunner", children: "Rust flowrunner" }), _jsx("option", { value: "mobile-app", children: "Mobile app" }), _jsx("option", { value: "backend", children: "Backend" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("input", { id: "addJSONFlow", type: "checkbox", checked: addJSONFlow, onChange: onAddJSONFlow }), _jsx("label", { htmlFor: "addJSONFlow", className: "ms-2", children: "Enter flow as json" })] }), addJSONFlow && _jsx("div", { className: "form-group", children: _jsx("textarea", { className: "form-control", value: json, onChange: onChangeJson }) })] }), _jsxs(Modal.Footer, { children: [_jsx("button", { className: "btn btn-secondary", onClick: props.onClose, children: "Close" }), _jsx("button", { className: "btn btn-primary", onClick: saveNode, children: "Add" })] })] })] });
};
//# sourceMappingURL=index.js.map