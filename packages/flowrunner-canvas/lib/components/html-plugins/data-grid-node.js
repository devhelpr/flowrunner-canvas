import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useFlowStore } from '../../state/flow-state';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
export class DataGridNodeHtmlPluginInfo {
    constructor() {
        this.getWidth = (node) => {
            return (node && node.columns && ((node.columns + 1) * 100) + 24) || 250;
        };
    }
    getHeight(node) {
        return ((node && node.rows && ((node.rows + 2) * 50)) + 20 + 24) || 250;
    }
}
export const DataGridNodeHtmlPlugin = (props) => {
    const [value, setValue] = useState("");
    const [values, setValues] = useState([]);
    const [node, setNode] = useState({});
    const [currentValue, setCurrentValue] = useState("");
    const flow = useFlowStore();
    const canvasMode = useCanvasModeStateStore();
    const selectedNode = useSelectedNodeStore();
    const info = new DataGridNodeHtmlPluginInfo();
    useEffect(() => {
        setValues(props.node.values);
        setNode(props.node);
    }, []);
    const onSubmit = (event) => {
        event.preventDefault();
        return false;
    };
    const storeNode = (newNode) => {
        var _a;
        console.log("datagrid", newNode);
        flow.storeFlowNode(newNode, props.node.name);
        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, "", "", props.node.name, '', newNode);
    };
    const onCurrentValueChange = (event) => {
        event.preventDefault();
        setCurrentValue(event.target.value);
        return false;
    };
    const onFocus = (rowIndex, cellIndex, event) => {
        event.preventDefault();
        if (rowIndex >= 0) {
            let row = values[rowIndex];
            setCurrentValue(row[cellIndex]);
        }
        return false;
    };
    const onBlur = (event) => {
        event.preventDefault();
        return false;
    };
    const onChange = (rowIndex, cellIndex, event) => {
        console.log("input", rowIndex, cellIndex, event.target.value, props.node);
        if (rowIndex >= 0) {
            let data = [...values];
            let row = [...data[rowIndex]];
            row[cellIndex] = event.target.value;
            data[rowIndex] = row;
            const newNode = { ...props.node, values: data };
            setValues(data);
            setNode(newNode);
            storeNode(newNode);
        }
        else {
            let data = [...values];
            data[cellIndex] = event.target.value;
            setValues(data);
            const newNode = { ...props.node, values: data };
            storeNode(newNode);
        }
    };
    const getWidth = (node) => {
        return info.getWidth(node);
    };
    const getHeight = (node) => {
        return info.getHeight(node);
    };
    const addColumn = (event) => {
        event.preventDefault();
        let data = [...values];
        data = data.map((row) => {
            let newRow = [...row];
            newRow.push("0");
            return newRow;
        });
        setValues(data);
        const newNode = { ...props.node, values: data, columns: props.node.columns + 1 };
        flow.storeFlowNode({ ...newNode }, props.node.name);
        return false;
    };
    const addRow = (event) => {
        event.preventDefault();
        let data = [...values];
        data.push(new Array(props.node.columns || 8).fill("0"));
        setValues(data);
        const newNode = { ...props.node, values: data, rows: props.node.rows + 1 };
        flow.storeFlowNode({ ...newNode }, props.node.name);
        return false;
    };
    const getColumnTitles = () => {
        let columnTitlesItems = [];
        let loop = 0;
        while (loop < props.node.columns) {
            let letter = String.fromCharCode((loop % 26) + 65);
            columnTitlesItems.push(_jsx(_Fragment, { children: letter }));
            loop++;
        }
        return _jsxs("div", { className: "d-table-row", children: [_jsx("div", { className: "d-table-cell" }), columnTitlesItems.map((title, index) => {
                    return _jsx("div", { className: "d-table-cell text-center data-grid__cell-title", children: title }, "cell-title-" + index);
                }), _jsx("a", { href: "#", onClick: addColumn, className: "d-table-cell text-center data-grid__cell-title data-grid__cell-add-column", children: "+" })] });
    };
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: _jsx("div", { className: "w-100 h-auto", children: _jsxs("form", { className: "form", onSubmit: onSubmit, children: [_jsx("div", { className: "form-group", children: _jsx("input", { className: "form-control", value: currentValue, onChange: onCurrentValueChange }) }), _jsxs("div", { className: "form-group d-table", children: [(values || []).map((row, index) => {
                                if (Array.isArray(row)) {
                                    let rowTitle = (index + 1).toString();
                                    let columnTitles = _jsx(_Fragment, {});
                                    if (index === 0) {
                                        columnTitles = getColumnTitles();
                                    }
                                    return _jsxs(React.Fragment, { children: [columnTitles, _jsx("div", { className: "d-table-row", children: row.map((column, cellIndex) => {
                                                    let columnTitle = _jsx(_Fragment, {});
                                                    if (cellIndex === 0) {
                                                        columnTitle = _jsx("div", { className: "d-table-cell data-grid__row-title", children: rowTitle }, "data-grid__row-title-" + cellIndex);
                                                    }
                                                    return _jsxs(React.Fragment, { children: [columnTitle, _jsx("div", { className: "d-table-cell", children: _jsx("input", { className: "form-control " + (isNaN(column) ? "" : "text-right"), value: column, onChange: (event) => onChange(index, cellIndex, event), onFocus: (event) => onFocus(index, cellIndex, event), onBlur: onBlur }) }, "cell-" + index + "-" + cellIndex)] }, "data-grid__" + index + "-" + cellIndex);
                                                }) })] }, "row-" + index);
                                }
                                else {
                                    return _jsx("div", { className: "d-table-cell", children: _jsx("input", { className: "form-control " + (isNaN(row) ? "" : "text-right"), value: row, onChange: (event) => onChange(-1, index, event) }) }, "row-" + index);
                                }
                            }), _jsx("div", { className: "d-table-row", children: _jsx("a", { href: "#", onClick: addRow, className: "d-table-cell text-center data-grid__cell-title data-grid__cell-add-row", children: "+" }) })] }), _jsx("button", { className: "d-none", children: "OK" })] }) }) });
};
//# sourceMappingURL=data-grid-node.js.map