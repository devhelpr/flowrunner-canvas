import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Suspense } from 'react';
import { getFormControl } from './form-controls';
import { createExpressionTree, executeExpressionTree } from '@devhelpr/expressionrunner';
import { useFlowStore } from '../../state/flow-state';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { onFocus } from './form-controls/helpers/focus';
import { PresetManager } from './components/preset-manager';
import * as uuid from 'uuid';
import { useFormNodeDatasourceContext } from '../contexts/form-node-datasource-context';
const uuidV4 = uuid.v4;
export class FormNodeHtmlPluginInfo {
    constructor(taskSettings) {
        this.taskSettings = taskSettings;
    }
    getWidth(node) {
        let width = node.width || 300;
        if (width < 300) {
            width = 300;
        }
        return width;
    }
    getMetaInfoLength(metaInfo, node, isParent) {
        if (metaInfo) {
            let metaInfolength = 0;
            metaInfo.map((metaInfoItem) => {
                if (metaInfoItem.fieldType == 'radiobutton' &&
                    metaInfoItem.options) {
                    metaInfolength += metaInfoItem.options.length;
                }
                else if (metaInfoItem.fieldType == 'textarea') {
                    metaInfolength += (node && node.rows) || metaInfo.rows || 3;
                }
                else if (isParent &&
                    metaInfoItem.fieldType == 'objectList' &&
                    node && node[metaInfoItem.fieldName]) {
                    metaInfolength += node[metaInfoItem.fieldName].length;
                }
                else if (metaInfoItem.metaInfo) {
                    metaInfolength += this.getMetaInfoLength(metaInfoItem.metaInfo, node, false);
                }
                else {
                    metaInfolength += 2;
                }
            });
            return metaInfolength;
        }
        return 0;
    }
    getHeight(node) {
        let metaInfo = [];
        if (this.taskSettings && this.taskSettings.metaInfo) {
            metaInfo = this.taskSettings && this.taskSettings.metaInfo;
        }
        if (!!this.taskSettings.hasMetaInfoInNode) {
            metaInfo = node.metaInfo || [];
        }
        if (metaInfo.length > 0) {
            const height = this.getMetaInfoLength(metaInfo, node, true) * (36) + (48);
            return height;
        }
        return 0;
    }
}
export const FormNodeHtmlPlugin = (props) => {
    const [value, setValue] = useState("");
    const [values, setValues] = useState([]);
    const [node, setNode] = useState({});
    const [errors, setErrors] = useState({});
    const [datasource, setDatasource] = useState({});
    const [receivedPayload, setReceivedPayload] = useState({});
    const storeFlowNode = (props.useFlowStore && props.useFlowStore(useCallback(state => state.storeFlowNode, []))) || useFlowStore(useCallback(state => state.storeFlowNode, []));
    const flowsPlayground = useCanvasModeStateStore(state => state.flowsPlayground);
    const flowsWasm = useCanvasModeStateStore(state => state.flowsWasm);
    const observableId = useRef(uuidV4());
    const unmounted = useRef(false);
    const timer = useRef(null);
    const lastTime = useRef(null);
    const throttleTimer = useRef(null);
    const modifyFlowThrottleTimer = useRef(null);
    const modifyFlowThrottleEnabled = useRef(false);
    const datasourceContext = useFormNodeDatasourceContext();
    useEffect(() => {
        var _a, _b;
        let subscription;
        if (props.formNodesubject) {
            subscription = props.formNodesubject.subscribe({
                next: (message) => {
                    if (unmounted.current) {
                        return;
                    }
                    if (message && props.node && message.id === props.node.name) {
                        setNode(message.node);
                        setValues([]);
                    }
                }
            });
        }
        if (props.node) {
            if (props.node.nodeDatasource && props.node.nodeDatasource === "flow") {
                if (props.node.mode && props.node.mode === "list") {
                    setNode(props.node);
                    setValues(props.node.values || props.node.defaultValues || []);
                }
                else {
                    setNode(props.node);
                    setValues([]);
                    setValue(props.node.value || props.node.defaultValue || "");
                }
            }
            else {
                if (props.node.taskType == "FormTask" ||
                    (props.taskSettings && !!props.taskSettings.isFormTask)) {
                    if (props.flowrunnerConnector) {
                        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, props.node.propertyName, props.node.defaultValue || "", "");
                    }
                }
                setNode(props.node);
                setValues([]);
                setValue(props.node.defaultValue || "");
            }
        }
        else {
            setValues([]);
        }
        if (props.flowrunnerConnector) {
            (_b = props.flowrunnerConnector) === null || _b === void 0 ? void 0 : _b.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
        }
        datasourceContext.setDatasource("test", ["test1", "test2", "test3"]);
        return () => {
            var _a;
            unmounted.current = true;
            if (subscription) {
                subscription.unsubscribe();
            }
            if (throttleTimer.current) {
                clearTimeout(throttleTimer.current);
                throttleTimer.current = undefined;
            }
            if (props.flowrunnerConnector) {
                (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.unregisterFlowNodeObserver(props.node.name, observableId.current);
            }
        };
    }, []);
    useEffect(() => {
        var _a;
        setNode({ ...props.node });
        if (props.flowrunnerConnector) {
            (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.registerFlowNodeObserver(props.node.name, observableId.current, receivePayloadFromNode);
        }
        return () => {
            var _a;
            if (props.flowrunnerConnector) {
                (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.unregisterFlowNodeObserver(props.node.name, observableId.current);
            }
        };
    }, [props.node, props.flowrunnerConnector]);
    useEffect(() => {
        const THROTTLE_TIMEOUT = 500;
        if (modifyFlowThrottleEnabled.current) {
            modifyFlowThrottleTimer.current = setTimeout(() => {
                modifyFlowThrottleEnabled.current = false;
                onModifyFlowThrottleTimer();
            }, THROTTLE_TIMEOUT);
        }
        return () => {
            if (modifyFlowThrottleTimer.current) {
                clearTimeout(modifyFlowThrottleTimer.current);
                modifyFlowThrottleTimer.current = null;
            }
        };
    }, [values]);
    const receivePayloadFromNode = useCallback((payload) => {
        const maxPayloads = 1;
        if (unmounted.current) {
            return;
        }
        let metaInfo = [];
        if (!!props.isNodeSettingsUI) {
            metaInfo = props.taskSettings.configMenu.fields;
        }
        else {
            if (props.taskSettings && props.taskSettings.metaInfo) {
                metaInfo = props.taskSettings && props.taskSettings.metaInfo;
            }
            if (!!props.taskSettings.hasMetaInfoInNode) {
                metaInfo = props.node.metaInfo || [];
            }
            if (!!props.node.renderFormViaMetaInfoInPayload) {
                metaInfo = (payload && payload["metaInfo"]) || [];
            }
        }
        if (!!payload.isDebugCommand) {
            if (payload.debugCommand === "resetPayloads") {
                setReceivedPayload({});
            }
            return;
        }
        let datasourcePropertyName = undefined;
        metaInfo.map((metaInfo) => {
            if (metaInfo.datasource && payload[metaInfo.datasource]) {
                datasourcePropertyName = metaInfo.datasource;
            }
        });
        if (datasourcePropertyName) {
            if (!lastTime || performance.now() > lastTime + 30) {
                lastTime.current = performance.now();
                if (timer.current) {
                    clearTimeout(timer.current);
                    timer.current = undefined;
                }
                let _datasource = { ...datasource };
                if (datasourcePropertyName) {
                    _datasource[datasourcePropertyName] = payload[datasourcePropertyName];
                }
                setDatasource(_datasource);
                setReceivedPayload(payload);
            }
            else {
                if (timer.current) {
                    clearTimeout(timer.current);
                    timer.current = undefined;
                }
                timer.current = setTimeout(() => {
                    timer.current = undefined;
                    let _datasource = { ...datasource };
                    if (datasourcePropertyName) {
                        _datasource[datasourcePropertyName] = payload[datasourcePropertyName];
                    }
                    setDatasource(_datasource);
                    setReceivedPayload(payload);
                }, 30);
            }
        }
        else {
            setReceivedPayload(payload);
        }
        return;
    }, [props.taskSettings, props.node]);
    const onSubmit = useCallback((event) => {
        event.preventDefault();
        let doSubmit = true;
        let updatedErrors = {};
        let metaInfo = [];
        if (!!props.isObjectListNodeEditing) {
            metaInfo = props.node.metaInfo || [];
        }
        else if (!!props.isNodeSettingsUI) {
            metaInfo = props.taskSettings.configMenu.fields;
        }
        else {
            if (props.taskSettings && props.taskSettings.metaInfo) {
                metaInfo = props.taskSettings && props.taskSettings.metaInfo;
            }
            if (!!props.taskSettings.hasMetaInfoInNode) {
                metaInfo = props.node.metaInfo || [];
            }
            if (!!props.node.renderFormViaMetaInfoInPayload) {
                metaInfo = (receivedPayload && receivedPayload["metaInfo"]) || [];
            }
        }
        (metaInfo || []).map((metaInfo) => {
            if (metaInfo && !!metaInfo.required) {
                const value = values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || "";
                if (value === "") {
                    doSubmit = false;
                    updatedErrors[metaInfo.fieldName] = `${metaInfo.fieldName} is a required field`;
                }
            }
        });
        if (doSubmit) {
            setErrors([]);
        }
        else {
            setErrors(updatedErrors);
        }
        return false;
    }, [props.taskSettings, props.node, values, props.isObjectListNodeEditing, props.isNodeSettingsUI]);
    const onModifyFlowThrottleTimer = useCallback(() => {
        var _a;
        console.log("onModifyFlowThrottleTimer triggered", node, values);
        storeFlowNode({ ...node, ...values }, props.node.name);
        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, "", "", props.node.name, '', values);
    }, [props.taskSettings, props.node, values,
        errors,
        node, props.isObjectListNodeEditing, props.isNodeSettingsUI,
        props.onSetValue, props.flowrunnerConnector
    ]);
    const setValueHelper = useCallback((fieldName, value, metaInfo) => {
        var _a;
        if (props.node && fieldName) {
            let updatedErrors = { ...errors };
            if (updatedErrors[fieldName]) {
                delete updatedErrors[fieldName];
            }
            if (metaInfo.fieldType == "date") {
                console.log("setValueHelper date", value);
            }
            let clearValues = {};
            if (values[fieldName] === undefined || value != values[fieldName]) {
                if (metaInfo.clearFields) {
                    metaInfo.clearFields.map((fieldName) => {
                        clearValues[fieldName] = "";
                    });
                }
            }
            const updatedValues = {
                ...values,
                ...clearValues,
                [fieldName]: value
            };
            setValues(updatedValues);
            setErrors(updatedErrors);
            const updatedNode = {
                ...node,
                [fieldName]: value
            };
            setNode(updatedNode);
            if (!props.isNodeSettingsUI && !props.isObjectListNodeEditing) {
                if (props.node.taskType == "FormTask" ||
                    (props.taskSettings && !!props.taskSettings.isFormTask)) {
                    if (props.flowrunnerConnector) {
                        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, fieldName, value, props.node.name, '', updatedValues);
                    }
                }
                else {
                    if (props.flowrunnerConnector) {
                        modifyFlowThrottleEnabled.current = true;
                    }
                }
            }
            else if (props.onSetValue) {
                props.onSetValue(value, fieldName);
            }
        }
    }, [props.taskSettings, props.node, values,
        errors,
        node, props.isObjectListNodeEditing, props.isNodeSettingsUI,
        props.onSetValue, props.flowrunnerConnector
    ]);
    const onChange = (fieldName, fieldType, metaInfo, event) => {
        event.preventDefault();
        let valueForNode;
        event.persist();
        console.log("onChange", fieldName, event.target.files);
        if (fieldType == "fileupload") {
            valueForNode = {
                fileName: event.target.files[0].name,
                fileData: event.target.files[0]
            };
        }
        else if (metaInfo && metaInfo.dataType === "number") {
            valueForNode = Number(event.target.value);
        }
        else {
            valueForNode = event.target.value;
        }
        if (fieldType == "color") {
            if (throttleTimer.current) {
                clearTimeout(throttleTimer.current);
            }
            throttleTimer.current = setTimeout(() => {
                setValueHelper(fieldName, valueForNode, metaInfo);
            }, fieldType == "color" ? 50 : 5);
        }
        else {
            setValueHelper(fieldName, valueForNode, metaInfo);
        }
        return false;
    };
    const setValueViaOnReceive = useCallback((newValue, metaInfo) => {
        var _a;
        if (props.node && metaInfo.fieldName) {
            let _errors = { ...errors };
            if (_errors[metaInfo.fieldName]) {
                delete _errors[metaInfo.fieldName];
            }
            let clearValues = {};
            if (values[metaInfo.fieldName] === undefined || newValue != values[metaInfo.fieldName]) {
                if (metaInfo.clearFields) {
                    metaInfo.clearFields.map((fieldName) => {
                        clearValues[fieldName] = "";
                    });
                }
            }
            let newValues = {
                ...values,
                ...clearValues,
                [metaInfo.fieldName]: newValue
            };
            setValues(newValues);
            setErrors(_errors);
            let updatedNode = {
                ...node,
                [metaInfo.fieldName]: newValue
            };
            setNode(updatedNode);
            if (!props.isNodeSettingsUI && !props.isObjectListNodeEditing) {
                if (props.node.taskType == "FormTask" ||
                    (props.taskSettings && !!props.taskSettings.isFormTask)) {
                    if (props.flowrunnerConnector) {
                        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, metaInfo.fieldName, newValue, props.node.name, '', newValues);
                    }
                }
                else {
                    if (props.flowrunnerConnector) {
                        modifyFlowThrottleEnabled.current = true;
                    }
                }
            }
            else if (props.onSetValue) {
                props.onSetValue(newValue, metaInfo.fieldName);
            }
        }
    }, [props.taskSettings, props.node, values,
        props.isObjectListNodeEditing, props.isNodeSettingsUI, props.onSetValue,
        props.flowrunnerConnector]);
    const onReceiveValue = (value, metaInfo) => {
        if (metaInfo.fieldType == "color") {
            if (throttleTimer.current) {
                clearTimeout(throttleTimer.current);
            }
            throttleTimer.current = setTimeout(() => {
                setValueViaOnReceive(value, metaInfo);
            }, metaInfo.fieldType == "color" ? 50 : 5);
        }
        else {
            setValueViaOnReceive(value, metaInfo);
        }
    };
    const getFieldType = (metaInfo) => {
        if (metaInfo.fieldType === "color") {
            return "color";
        }
        if (!metaInfo.fieldType) {
            return "text";
        }
        return metaInfo.fieldType;
    };
    const onLoadPreset = () => {
    };
    const onGetData = useCallback(() => {
        let data = { ...props.node, ...node, ...values };
        delete data.x;
        delete data.y;
        delete data.name;
        delete data.id;
        delete data._id;
        delete data.shapeType;
        delete data.taskType;
        return data;
    }, [props.node, node, value, values]);
    const onSetData = useCallback((data) => {
        var _a;
        setValues(data);
        const updatedNode = {
            ...props.node,
            ...node,
            ...data
        };
        setNode(updatedNode);
        if (props.flowrunnerConnector) {
            storeFlowNode(updatedNode, props.node.name);
            (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, "", value, props.node.name, '', data);
        }
    }, [props.node, node, value, values, props.flowrunnerConnector]);
    const renderFields = useCallback(() => {
        let metaInfo = [];
        if (!!props.isNodeSettingsUI) {
            if (props.taskSettings) {
                metaInfo = props.taskSettings.configMenu.fields;
            }
            else {
                metaInfo = [];
            }
        }
        else {
            if (props.taskSettings && props.taskSettings.metaInfo) {
                metaInfo = props.taskSettings && props.taskSettings.metaInfo;
            }
            if (!!props.isObjectListNodeEditing ||
                !!props.taskSettings.hasMetaInfoInNode) {
                metaInfo = props.node.metaInfo || [];
            }
            if (!!props.node.renderFormViaMetaInfoInPayload) {
                metaInfo = (receivedPayload && receivedPayload["metaInfo"]) || [];
            }
        }
        return _jsxs(_Fragment, { children: [metaInfo.map((metaInfo, index) => {
                    const fieldType = getFieldType(metaInfo);
                    if (metaInfo.visibilityCondition) {
                        const expression = createExpressionTree(metaInfo.visibilityCondition);
                        let data = {};
                        if (!!props.isObjectListNodeEditing) {
                            data = { ...props.node, ...receivedPayload, ...values };
                        }
                        else {
                            data = { ...props.node, ...receivedPayload, ...values };
                        }
                        const result = executeExpressionTree(expression, data);
                        if (!result) {
                            return _jsx(React.Fragment, {}, "index-f-vc-" + index);
                        }
                    }
                    if (!fieldType || fieldType === "text" || fieldType === "fileupload" || fieldType === "color" || fieldType === "date") {
                        if (!!props.isReadOnly) {
                            return _jsx(React.Fragment, { children: _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "input-" + props.node.name, children: _jsx("strong", { children: metaInfo.fieldName || props.node.name }) }), _jsx("div", { className: "", children: values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || "" })] }) }, "index-f-r-" + index);
                        }
                        let inputValue = "";
                        let fileObject = undefined;
                        if (fieldType !== "fileupload") {
                            if (values[metaInfo.fieldName] !== undefined) {
                                inputValue = values[metaInfo.fieldName];
                            }
                            else {
                                inputValue = props.node[metaInfo.fieldName] || "";
                                if (!inputValue) {
                                    if (metaInfo.defaultValue) {
                                        inputValue = metaInfo.defaultValue;
                                    }
                                }
                            }
                        }
                        else {
                            if (values[metaInfo.fieldName] !== undefined) {
                                fileObject = values[metaInfo.fieldName];
                            }
                            else {
                                fileObject = props.node[metaInfo.fieldName] || "";
                                if (!fileObject) {
                                    if (metaInfo.defaultValue) {
                                        fileObject = metaInfo.defaultValue;
                                    }
                                }
                            }
                        }
                        return _jsx(React.Fragment, { children: _jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "input-" + props.node.name, children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || props.node.name }), !!metaInfo.required && " *"] }), fieldType === "fileupload" && fileObject && _jsx("div", { children: fileObject.fileName || "" }), _jsx("div", { className: "input-group mb-1", children: _jsx("input", { onChange: (event) => onChange(metaInfo.fieldName, metaInfo.fieldType || "text", metaInfo, event), onFocus: onFocus, type: fieldType === "fileupload" ? "file" : fieldType, className: "form-control", value: inputValue, accept: metaInfo.acceptFiles || "", id: "input-" + props.node.name + "-" + metaInfo.fieldName, "data-index": index, disabled: false }, "index" + index) }), errors[metaInfo.fieldName] && _jsx("div", { className: "text-danger", children: errors[metaInfo.fieldName] })] }) }, "index-f-" + index);
                    }
                    if (fieldType) {
                        let datasourceToUse;
                        if (metaInfo.datasource == "module") {
                            datasourceToUse = props.datasources[metaInfo.datasourceId] || [];
                        }
                        else if (metaInfo.datasource == "[PLAYGROUNDFLOW]") {
                            datasourceToUse = flowsPlayground;
                        }
                        else if (metaInfo.datasource == "[WASMFLOW]") {
                            datasourceToUse = flowsWasm;
                        }
                        else if (datasourceContext.getDatasource(metaInfo.datasource)) {
                            datasourceToUse = datasourceContext.getDatasource(metaInfo.datasource);
                        }
                        else if (metaInfo.datasource && datasource[metaInfo.datasource]) {
                            datasourceToUse = datasource[metaInfo.datasource];
                        }
                        if (!!props.isReadOnly) {
                            let data = "";
                            if (metaInfo.fieldType == "objectList") {
                                data = "[Object]";
                            }
                            else {
                                data = values[metaInfo.fieldName] || props.node[metaInfo.fieldName] || "";
                            }
                            return _jsx(React.Fragment, { children: _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "input-" + props.node.name, children: _jsx("strong", { children: metaInfo.fieldName || props.node.name }) }), _jsx("div", { className: "", children: data })] }) }, "index-f-r-" + index);
                        }
                        let inputValue = "";
                        if (values[metaInfo.fieldName] !== undefined) {
                            inputValue = values[metaInfo.fieldName];
                        }
                        else {
                            inputValue = props.node[metaInfo.fieldName] || "";
                            if (!inputValue) {
                                if (metaInfo.defaultValue) {
                                    inputValue = metaInfo.defaultValue;
                                }
                            }
                        }
                        return _jsx(React.Fragment, { children: getFormControl(fieldType, {
                                value: inputValue,
                                onChange: onReceiveValue,
                                node: props.node,
                                fieldName: metaInfo.fieldName,
                                fieldType: metaInfo.fieldType,
                                metaInfo: metaInfo,
                                datasource: datasourceToUse,
                                datasources: props.datasources,
                                payload: receivedPayload,
                                isInFlowEditor: !!props.isInFlowEditor,
                                fieldDefinition: metaInfo,
                                fieldIndex: index,
                                enabled: !(!!props.node.formDefinitionAsPayload && !props.isNodeSettingsUI)
                            }) }, "index-f-" + index);
                    }
                    return null;
                }), !props.isReadOnly && !props.isObjectListNodeEditing &&
                    _jsx("button", { onFocus: onFocus, className: "d-none", children: "OK" })] });
    }, [props.taskSettings, props.node, props.datasources,
        value, values, errors, receivedPayload, node,
        props.isInFlowEditor, props.isNodeSettingsUI, props.isObjectListNodeEditing,
        props.flowrunnerConnector
    ]);
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: _jsx("div", { className: "w-100 h-auto", children: _jsxs(Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: [!!props.isObjectListNodeEditing ?
                        _jsx("div", { className: "form", children: renderFields() })
                        :
                            _jsx("form", { className: "form", onSubmit: onSubmit, children: renderFields() }), props.taskSettings && !!props.taskSettings.supportsPresets &&
                        _jsx(PresetManager, { node: props.node, onLoadPreset: onLoadPreset, onGetData: onGetData, onSetData: onSetData })] }) }) });
};
//# sourceMappingURL=form-node.js.map