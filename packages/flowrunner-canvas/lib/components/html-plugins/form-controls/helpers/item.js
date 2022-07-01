import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { FormNodeHtmlPlugin } from '../../form-node';
import { onFocus } from './focus';
export const Item = forwardRef((props, ref) => {
    if (props.viewMode && props.viewMode == "table-dragging" && props.metaInfo.metaInfo) {
        let isSelected = false;
        if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
            if (props.index == props.payload["_" + props.node.name + "-node"]) {
                isSelected = true;
            }
        }
        if (props.index != props.editIndex) {
            return _jsx("table", { style: props.style, ...props.listeners, ref: ref, children: _jsx("tbody", { children: _jsxs("tr", { className: isSelected ? "bg-primary text-white" : "", children: [_jsx("td", { children: _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => props.onEditItem(props.index, event), className: "fas fa-edit" }) }), props.metaInfo.metaInfo.map((item, index) => {
                                return _jsx("td", { className: "p-2", children: props.listItem[item.fieldName] }, "cell" + index);
                            })] }) }) }, "table" + props.index);
        }
        else {
            return _createElement("table", { style: props.style, ...props.listeners, ref: ref, key: "table" + props.index },
                _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { colSpan: props.metaInfo.metaInfo.length + 1, children: _jsxs("div", { className: "form-control__object-list-node", children: [_jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => props.deleteClick(event, props.index), className: "form-control__object-list-node-delete fas fa-trash-alt" }), _jsx(FormNodeHtmlPlugin, { node: { ...props.node }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName), datasources: props.datasources })] }, "input" + props.metaInfo.fieldName + props.index) }) }) }));
        }
    }
    else if (props.viewMode && props.viewMode == "table" && props.metaInfo.metaInfo) {
        let isSelected = false;
        if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
            if (props.index == props.payload["_" + props.node.name + "-node"]) {
                isSelected = true;
            }
        }
        if (props.index != props.editIndex) {
            return _createElement("tr", { ref: ref, style: props.style, ...props.listeners, key: "table-row" + props.index, className: isSelected ? "bg-primary text-white" : "" },
                _jsx("td", { children: _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => props.onEditItem(props.index, event), className: "fas fa-edit" }) }),
                props.metaInfo.metaInfo.map((item, index) => {
                    return _jsx("td", { className: "p-2", children: props.listItem[item.fieldName] }, "cell" + index);
                }));
        }
        else {
            return _createElement("tr", { style: props.style, ...props.listeners, ref: ref, key: "table-row" + props.index },
                _jsx("td", { colSpan: props.metaInfo.metaInfo.length + 1, children: _jsxs("div", { className: "form-control__object-list-node", children: [_jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => props.deleteClick(event, props.index), className: "form-control__object-list-node-delete fas fa-trash-alt" }), _jsx(FormNodeHtmlPlugin, { node: { ...props.node }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName), datasources: props.datasources })] }, "input" + props.metaInfo.fieldName + props.index) }));
        }
    }
    else {
        return _jsxs("div", { ref: ref, style: props.style, className: "form-control__object-list-node form-control__object-list-node--sortable " +
                (props.isBeingSorted ? "form-control__object-list-node--sorting" : ""), children: [_jsx("a", { href: "#", onFocus: onFocus, ...props.listeners, className: "form-control__object-list-node-grip fas fa-grip-vertical" }), _jsx("a", { href: "#", onFocus: onFocus, onClick: (event) => props.deleteClick(event, props.index), className: "form-control__object-list-node-delete fas fa-trash-alt" }), _jsx(FormNodeHtmlPlugin, { node: { ...props.node }, isObjectListNodeEditing: true, isInFlowEditor: props.isInFlowEditor, onSetValue: (value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName), datasources: props.datasources })] }, "input" + props.metaInfo.fieldName + props.index);
    }
});
//# sourceMappingURL=item.js.map