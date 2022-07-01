import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useFlowStore } from '../../state/flow-state';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
export class InputNodeHtmlPluginInfo {
    constructor() {
        this.getWidth = (node) => {
            return 300;
        };
    }
    getHeight(node) {
        return 300;
    }
}
export const InputNodeHtmlPlugin = (props) => {
    const [value, setValue] = useState("");
    const [values, setValues] = useState([]);
    const [node, setNode] = useState({});
    const flow = useFlowStore();
    const canvasMode = useCanvasModeStateStore();
    useEffect(() => {
        if (props.node) {
            if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                if (props.node.mode && props.node.mode === "list") {
                    setNode(props.node);
                    setValues(props.node.values || props.node.defaultValues || []);
                }
                else {
                    setNode(props.node);
                    setValue(props.node.value || props.node.defaultValue || "");
                }
            }
            else {
                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, props.node.defaultValue || "", "");
                setNode(props.node);
                setValue(props.node.defaultValue || "");
            }
        }
    }, []);
    const onSubmit = (event) => {
        event.preventDefault();
        if (!!canvasMode.isFlowrunnerPaused) {
            return;
        }
        if (props.node.formMode !== false) {
            props.flowrunnerConnector.executeFlowNode(props.node.executeNode || props.node.name, {});
        }
        return false;
    };
    const storeNode = (newNode) => {
        flow.storeFlowNode(newNode, props.node.name);
    };
    const onChange = (event) => {
        console.log("input", event.target.value, props.node);
        if (props.node) {
            if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                const newNode = { ...props.node, value: props.node.value };
                setNode(newNode);
                setValue(props.node.value);
                storeNode(newNode);
            }
            else {
                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, event.target.value, props.node.onChange || "");
                setValue(event.target.value);
            }
        }
    };
    const onChangeList = (index, event) => {
        console.log("input onChangeList", event.target.value, props.node);
        if (props.node) {
            if (props.node.mode && props.node.mode === "list") {
                let newValues = [...values];
                newValues[parseInt(index)] = event.target.value;
                if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                    const newNode = { ...props.node, values: newValues };
                    setNode(newNode);
                    setValues(newValues);
                    storeNode(newNode);
                    props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.name || "", "", newNode);
                }
                else {
                    props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || "");
                    setValues(newValues);
                }
            }
        }
    };
    const deleteListItem = (index, event) => {
        event.preventDefault();
        if (!!canvasMode.isFlowrunnerPaused) {
            return;
        }
        if (props.node) {
            if (props.node.mode && props.node.mode === "list") {
                let newValues = [...values];
                if (index > -1) {
                    newValues.splice(index, 1);
                    if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                        const newNode = { ...props.node, values: newValues };
                        setNode(newNode);
                        setValues(newValues);
                        storeNode(newNode);
                    }
                    else {
                        props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || "");
                        setValues(newValues);
                    }
                }
            }
        }
        return false;
    };
    const onAddValue = (event) => {
        event.preventDefault();
        if (!!canvasMode.isFlowrunnerPaused) {
            return;
        }
        if (props.node) {
            let newValues = [...values];
            newValues.push("");
            if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                const newNode = { ...props.node, values: newValues };
                setNode(newNode);
                setValues(newValues);
                storeNode(newNode);
            }
            else {
                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || "");
                setValues(newValues);
            }
        }
        return false;
    };
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: _jsx("div", { className: props.node.mode && props.node.mode === "list" ? "w-100 overflow-y-scroll no-wheel" : "w-100 h-auto", children: _jsx("form", { className: "form", onSubmit: onSubmit, children: _jsxs("div", { className: "form-group", children: [_jsx("div", { children: _jsx("label", { htmlFor: "input-" + props.node.name, children: _jsx("strong", { children: props.node.title || props.node.name }) }) }), props.node.mode && props.node.mode === "list" ? _jsxs(_Fragment, { children: [(values || []).map((value, index) => {
                                    return _jsx(React.Fragment, { children: _jsxs("div", { className: "input-group mb-1", children: [_jsx("input", { className: "form-control", id: "input-" + props.node.name + "-" + index, value: value, "data-index": index, disabled: !!canvasMode.isFlowrunnerPaused, onChange: (event) => onChangeList(index, event) }, "index" + index), _jsx("div", { className: "input-group-append", children: _jsx("a", { href: "#", title: "delete item", onClick: (event) => deleteListItem(index, event), role: "button", className: "btn btn-outline-secondary", children: _jsx("i", { className: "fas fa-trash-alt" }) }) })] }) }, "index-f-" + index);
                                }), _jsx("div", { className: "d-flex", children: _jsx("button", { onClick: onAddValue, className: "ml-auto mt-2 btn btn-primary pl-4 pr-4", children: "ADD" }) }), !!props.node.formMode && _jsxs(_Fragment, { children: [_jsx("br", {}), _jsx("hr", {}), _jsx("br", {})] })] }) :
                            _jsx("input", { className: "form-control", id: "input-" + props.node.name, value: value, onChange: onChange, disabled: !!canvasMode.isFlowrunnerPaused }), !!props.node.formMode &&
                            _jsx("div", { className: "d-flex", children: _jsx("button", { className: "ml-auto mt-2 btn btn-primary pl-4 pr-4", children: "OK" }) })] }) }) }) });
};
//# sourceMappingURL=input-node.js.map