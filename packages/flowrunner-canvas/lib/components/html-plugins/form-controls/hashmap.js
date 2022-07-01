import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
import { FormNodeHtmlPlugin } from '../form-node';
import { onFocus } from './helpers/focus';
export const HashMap = (props) => {
    const { metaInfo, node } = props;
    const [isAdding, setAdding] = useState(false);
    const [newValue, setNewValue] = useState({});
    const [editProperty, setEditProperty] = useState("");
    const [newProperty, setNewProperty] = useState("");
    let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const deleteItem = (objectPropertyName, event) => {
        event.preventDefault();
        setAdding(false);
        setEditProperty("");
        let newObject = { ...formControl.value };
        delete newObject[objectPropertyName];
        formControl.handleChangeByValue(newObject);
        return false;
    };
    const onEditNodeKeyValue = (objectPropertyName, value, fieldName) => {
        const clonedValue = { ...formControl.value[objectPropertyName] };
        clonedValue[fieldName] = value;
        let newObject = { ...formControl.value };
        newObject[objectPropertyName] = clonedValue;
        console.log("hashmap", objectPropertyName, newObject);
        formControl.handleChangeByValue(newObject);
    };
    const editItem = (objectPropertyName, event) => {
        event.preventDefault();
        setAdding(false);
        if (editProperty == objectPropertyName) {
            setEditProperty("");
        }
        else {
            setEditProperty(objectPropertyName);
        }
        return false;
    };
    const onAddNodeKeyValue = (value, fieldName) => {
        const clonedValue = { ...newValue };
        clonedValue[fieldName] = value;
        setNewValue(clonedValue);
    };
    const onAppendValue = (event) => {
        event.preventDefault();
        if (formControl.value[newProperty]) {
            alert(`${newProperty} already exists in ${metaInfo.label || metaInfo.fieldName || node.name}`);
            return false;
        }
        let newObject = { ...formControl.value };
        newObject[newProperty] = newValue;
        formControl.handleChangeByValue(newObject);
        setAdding(false);
        setNewValue({});
        setNewProperty("");
        return false;
    };
    const onCloseAppendValue = (event) => {
        event.preventDefault();
        setAdding(false);
        return false;
    };
    const addItem = (event) => {
        event.preventDefault();
        setNewProperty("");
        setAdding(true);
        return false;
    };
    const onSetNewProperty = (event) => {
        event.preventDefault();
        setNewProperty((event.target.value || "").replace(/\s/g, ""));
        return false;
    };
    return _jsxs("div", { className: "form-group", children: [_jsx("label", { children: _jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }) }), Object.keys(formControl.value).map((objectPropertyName, index) => {
                return _jsxs("div", { className: "form-control__hash-map", children: [_jsxs("div", { className: "form-control__hash-map-heading row no-gutters position-relative", children: [_jsx("div", { className: "col form-control__hash-map-title", children: _jsx("label", { className: "text-secondary", children: objectPropertyName }) }), _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => { (event) => deleteItem(objectPropertyName, event); }, className: "col-auto align-self-center text-center position-static mr-2", children: _jsx("span", { className: "fa fa-trash" }) }), _jsx("a", { href: "#", onClick: (event) => { editItem(objectPropertyName, event); }, className: "col-auto align-self-center text-center position-static", children: _jsx("span", { className: "fa fa-edit" }) })] }, "input" + metaInfo.fieldName + index), editProperty == objectPropertyName && _jsx("div", { className: "form-control__hash-map-details", children: _jsx(FormNodeHtmlPlugin, { node: {
                                    ...formControl.value[objectPropertyName],
                                    metaInfo: props.metaInfo.blockFields,
                                    name: props.node.name + "-edit-" + objectPropertyName,
                                    id: props.node.name + "-edit-" + objectPropertyName
                                }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => onEditNodeKeyValue(objectPropertyName, value, fieldName), datasources: props.datasources }) })] }, "hashmap-" + objectPropertyName + index);
            }), isAdding ?
                _jsxs("div", { className: "form-control__hash-map", children: [_jsx("div", { className: "form-control__hash-map-heading row no-gutters position-relative p-3", children: _jsx("div", { className: "w-100", children: _jsx("input", { className: "form-control w-100", onChange: onSetNewProperty, value: newProperty }) }) }), _jsx(FormNodeHtmlPlugin, { node: { ...newValue,
                                metaInfo: props.metaInfo.blockFields,
                                name: props.node.name + "-add",
                                id: props.node.name + "-add" }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: onAddNodeKeyValue, datasources: props.datasources }), _jsxs("div", { className: "form-control__object-list-node-controls", children: [_jsx("button", { onFocus: onFocus, onClick: onAppendValue, className: "btn btn-primary mr-2", children: "Add" }), _jsx("button", { onFocus: onFocus, onClick: onCloseAppendValue, className: "btn btn-outline-primary", children: "Close" })] })] }) :
                _jsx("div", { className: "form-control__hash-map", children: _jsx("a", { href: "#", onFocus: onFocus, onClick: addItem, className: "fas fa-plus-circle" }) })] });
};
//# sourceMappingURL=hashmap.js.map