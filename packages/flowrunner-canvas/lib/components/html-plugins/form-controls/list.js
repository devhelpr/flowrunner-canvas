import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useFormControlFromCode } from './use-form-control';
import { onFocus } from './helpers/focus';
export const List = (props) => {
    const { metaInfo, node } = props;
    const [editIndex, setEditIndex] = useState(-1);
    const [editValue, setEditValue] = useState("");
    const [isAdding, setAdding] = useState(false);
    const [newValue, setNewValue] = useState("");
    let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
    useEffect(() => {
        formControl.setValue(props.value);
    }, [props.value]);
    const deleteClick = (event, index) => {
        event.preventDefault();
        setEditIndex(-1);
        setAdding(false);
        let newList = [...formControl.value];
        newList.splice(index, 1);
        formControl.handleChangeByValue(newList);
        return false;
    };
    const editClick = (event, index) => {
        event.preventDefault();
        setEditValue(formControl.value[index]);
        setEditIndex(index);
        setAdding(false);
        return false;
    };
    const addItem = (event) => {
        event.preventDefault();
        setEditIndex(-1);
        setAdding(true);
        return false;
    };
    const onChangeAddValue = (event) => {
        event.preventDefault();
        setNewValue(event.target.value);
        return false;
    };
    const onAppendValue = (event) => {
        event.preventDefault();
        let newList = [...formControl.value];
        newList.push(newValue);
        formControl.handleChangeByValue(newList);
        setEditIndex(-1);
        setAdding(false);
        setNewValue("");
        return false;
    };
    const onEditValue = (event) => {
        event.preventDefault();
        setEditValue(event.target.value);
        return false;
    };
    const onSaveEditValue = (event) => {
        event.preventDefault();
        let newList = [...formControl.value];
        newList[editIndex] = editValue;
        formControl.handleChangeByValue(newList);
        setEditIndex(-1);
        setAdding(false);
        setEditValue("");
        return false;
    };
    return _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("strong", { children: metaInfo.label || metaInfo.fieldName || node.name }), !!metaInfo.required && " *"] }), Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
                if (editIndex == index) {
                    return _jsxs("div", { children: [_jsx("input", { onFocus: onFocus, className: "form-control", value: editValue, onChange: onEditValue }), _jsx("button", { onClick: onSaveEditValue, onFocus: onFocus, className: "btn btn-primary", children: "Save" })] }, "input" + metaInfo.fieldName + index);
                }
                return _jsxs("div", { children: [_jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => editClick(event, index), className: "fas fa-edit" }), _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => deleteClick(event, index), className: "fas fa-trash-alt" }), listItem] }, metaInfo.fieldName + index);
            }), isAdding ?
                _jsxs("div", { children: [_jsx("input", { onFocus: onFocus, className: "form-control", value: newValue, onChange: onChangeAddValue }), _jsx("button", { onClick: onAppendValue, onFocus: onFocus, className: "btn btn-primary", children: "Add" })] }) :
                _jsx("div", { children: _jsx("a", { href: "#", onClick: addItem, onFocus: onFocus, className: "fas fa-plus-circle" }) })] });
};
//# sourceMappingURL=list.js.map