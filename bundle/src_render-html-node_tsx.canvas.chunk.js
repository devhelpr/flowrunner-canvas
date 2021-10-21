/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["flowcanvaswebpackJsonpPlugin"] = self["flowcanvaswebpackJsonpPlugin"] || []).push([["src_render-html-node_tsx"],{

/***/ "./src/components/html-plugins/data-grid-node.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"DataGridNodeHtmlPluginInfo\": () => (/* binding */ DataGridNodeHtmlPluginInfo),\n/* harmony export */   \"DataGridNodeHtmlPlugin\": () => (/* binding */ DataGridNodeHtmlPlugin)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var _state_flow_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/state/flow-state.ts\");\n/* harmony import */ var _state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"./src/state/canvas-mode-state.ts\");\n/* harmony import */ var _state_selected_node_state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(\"./src/state/selected-node-state.ts\");\n\n\n\n\n\nclass DataGridNodeHtmlPluginInfo {\n    constructor() {\n        this.getWidth = (node) => {\n            return (node && node.columns && ((node.columns + 1) * 100) + 24) || 250;\n        };\n    }\n    getHeight(node) {\n        return ((node && node.rows && ((node.rows + 2) * 50)) + 20 + 24) || 250;\n    }\n}\nconst DataGridNodeHtmlPlugin = (props) => {\n    const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(\"\");\n    const [values, setValues] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);\n    const [node, setNode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});\n    const [currentValue, setCurrentValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(\"\");\n    const flow = (0,_state_flow_state__WEBPACK_IMPORTED_MODULE_1__.useFlowStore)();\n    const canvasMode = (0,_state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_2__.useCanvasModeStateStore)();\n    const selectedNode = (0,_state_selected_node_state__WEBPACK_IMPORTED_MODULE_3__.useSelectedNodeStore)();\n    const info = new DataGridNodeHtmlPluginInfo();\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n        setValues(props.node.values);\n        setNode(props.node);\n    }, []);\n    const onSubmit = (event) => {\n        event.preventDefault();\n        return false;\n    };\n    const storeNode = (newNode) => {\n        var _a;\n        console.log(\"datagrid\", newNode);\n        flow.storeFlowNode(newNode, props.node.name);\n        (_a = props.flowrunnerConnector) === null || _a === void 0 ? void 0 : _a.modifyFlowNode(props.node.name, \"\", \"\", props.node.name, '', newNode);\n    };\n    const onCurrentValueChange = (event) => {\n        event.preventDefault();\n        setCurrentValue(event.target.value);\n        return false;\n    };\n    const onFocus = (rowIndex, cellIndex, event) => {\n        event.preventDefault();\n        if (rowIndex >= 0) {\n            let row = values[rowIndex];\n            setCurrentValue(row[cellIndex]);\n        }\n        return false;\n    };\n    const onBlur = (event) => {\n        event.preventDefault();\n        return false;\n    };\n    const onChange = (rowIndex, cellIndex, event) => {\n        console.log(\"input\", rowIndex, cellIndex, event.target.value, props.node);\n        if (rowIndex >= 0) {\n            let data = [...values];\n            let row = [...data[rowIndex]];\n            row[cellIndex] = event.target.value;\n            data[rowIndex] = row;\n            const newNode = { ...props.node, values: data };\n            setValues(data);\n            setNode(newNode);\n            storeNode(newNode);\n        }\n        else {\n            let data = [...values];\n            data[cellIndex] = event.target.value;\n            setValues(data);\n            const newNode = { ...props.node, values: data };\n            storeNode(newNode);\n        }\n    };\n    const getWidth = (node) => {\n        return info.getWidth(node);\n    };\n    const getHeight = (node) => {\n        return info.getHeight(node);\n    };\n    const addColumn = (event) => {\n        event.preventDefault();\n        let data = [...values];\n        data = data.map((row) => {\n            let newRow = [...row];\n            newRow.push(\"0\");\n            return newRow;\n        });\n        setValues(data);\n        const newNode = { ...props.node, values: data, columns: props.node.columns + 1 };\n        flow.storeFlowNode({ ...newNode }, props.node.name);\n        return false;\n    };\n    const addRow = (event) => {\n        event.preventDefault();\n        let data = [...values];\n        data.push(new Array(props.node.columns || 8).fill(\"0\"));\n        setValues(data);\n        const newNode = { ...props.node, values: data, rows: props.node.rows + 1 };\n        flow.storeFlowNode({ ...newNode }, props.node.name);\n        return false;\n    };\n    const getColumnTitles = () => {\n        let columnTitlesItems = [];\n        let loop = 0;\n        while (loop < props.node.columns) {\n            let letter = String.fromCharCode((loop % 26) + 65);\n            columnTitlesItems.push(react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, letter));\n            loop++;\n        }\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-table-row\" },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-table-cell\" }),\n            columnTitlesItems.map((title, index) => {\n                return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { key: \"cell-title-\" + index, className: \"d-table-cell text-center data-grid__cell-title\" }, title);\n            }),\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"a\", { href: \"#\", onClick: addColumn, className: \"d-table-cell text-center data-grid__cell-title data-grid__cell-add-column\" }, \"+\"));\n    };\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"html-plugin-node\", style: {\n            backgroundColor: \"white\"\n        } },\n        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"w-100 h-auto\" },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"form\", { className: \"form\", onSubmit: onSubmit },\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"form-group\" },\n                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"input\", { className: \"form-control\", value: currentValue, onChange: onCurrentValueChange })),\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"form-group d-table\" },\n                    (values || []).map((row, index) => {\n                        if (Array.isArray(row)) {\n                            let rowTitle = (index + 1).toString();\n                            let columnTitles = react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null);\n                            if (index === 0) {\n                                columnTitles = getColumnTitles();\n                            }\n                            return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, { key: \"row-\" + index },\n                                columnTitles,\n                                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-table-row\" }, row.map((column, cellIndex) => {\n                                    let columnTitle = react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null);\n                                    if (cellIndex === 0) {\n                                        columnTitle = react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { key: \"data-grid__row-title-\" + cellIndex, className: \"d-table-cell data-grid__row-title\" }, rowTitle);\n                                    }\n                                    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, { key: \"data-grid__\" + index + \"-\" + cellIndex },\n                                        columnTitle,\n                                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { key: \"cell-\" + index + \"-\" + cellIndex, className: \"d-table-cell\" },\n                                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"input\", { className: \"form-control \" + (isNaN(column) ? \"\" : \"text-right\"), value: column, onChange: (event) => onChange(index, cellIndex, event), onFocus: (event) => onFocus(index, cellIndex, event), onBlur: onBlur })));\n                                })));\n                        }\n                        else {\n                            return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { key: \"row-\" + index, className: \"d-table-cell\" },\n                                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"input\", { className: \"form-control \" + (isNaN(row) ? \"\" : \"text-right\"), value: row, onChange: (event) => onChange(-1, index, event) }));\n                        }\n                    }),\n                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-table-row\" },\n                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"a\", { href: \"#\", onClick: addRow, className: \"d-table-cell text-center data-grid__cell-title data-grid__cell-add-row\" }, \"+\"))),\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"button\", { className: \"d-none\" }, \"OK\"))));\n};\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/data-grid-node.tsx?");

/***/ }),

/***/ "./src/components/html-plugins/execute-node.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ExecuteNodeHtmlPluginInfo\": () => (/* binding */ ExecuteNodeHtmlPluginInfo),\n/* harmony export */   \"ExecuteNodeHtmlPlugin\": () => (/* binding */ ExecuteNodeHtmlPlugin)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var _state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/state/canvas-mode-state.ts\");\n\n\nclass ExecuteNodeHtmlPluginInfo {\n    constructor() {\n        this.getWidth = (node) => {\n            return;\n        };\n    }\n    getHeight(node) {\n        return;\n    }\n}\nconst ExecuteNodeHtmlPlugin = (props) => {\n    const canvasMode = (0,_state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_1__.useCanvasModeStateStore)();\n    const click = (event) => {\n        event.preventDefault();\n        if (!!canvasMode.isFlowrunnerPaused) {\n            return;\n        }\n        if (props.node) {\n            props.flowrunnerConnector.executeFlowNode(props.node.name, {});\n        }\n        return false;\n    };\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"html-plugin-node\", style: {\n            backgroundColor: \"white\"\n        } },\n        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"a\", { href: \"#\", className: (!!canvasMode.isFlowrunnerPaused ? \"disabled \" : \"\") + \"btn btn-primary\", onClick: click }, \"Click to Execute\"));\n};\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/execute-node.tsx?");

/***/ }),

/***/ "./src/components/html-plugins/input-node.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"InputNodeHtmlPluginInfo\": () => (/* binding */ InputNodeHtmlPluginInfo),\n/* harmony export */   \"InputNodeHtmlPlugin\": () => (/* binding */ InputNodeHtmlPlugin)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var _state_flow_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/state/flow-state.ts\");\n/* harmony import */ var _state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"./src/state/canvas-mode-state.ts\");\n\n\n\n\nclass InputNodeHtmlPluginInfo {\n    constructor() {\n        this.getWidth = (node) => {\n            return 300;\n        };\n    }\n    getHeight(node) {\n        return 300;\n    }\n}\nconst InputNodeHtmlPlugin = (props) => {\n    const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(\"\");\n    const [values, setValues] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);\n    const [node, setNode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});\n    const flow = (0,_state_flow_state__WEBPACK_IMPORTED_MODULE_1__.useFlowStore)();\n    const canvasMode = (0,_state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_2__.useCanvasModeStateStore)();\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n        if (props.node) {\n            if (props.node.nodeDatasource && props.node.nodeDatasource === \"flow\") {\n                if (props.node.mode && props.node.mode === \"list\") {\n                    setNode(props.node);\n                    setValues(props.node.values || props.node.defaultValues || []);\n                }\n                else {\n                    setNode(props.node);\n                    setValue(props.node.value || props.node.defaultValue || \"\");\n                }\n            }\n            else {\n                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, props.node.defaultValue || \"\", \"\");\n                setNode(props.node);\n                setValue(props.node.defaultValue || \"\");\n            }\n        }\n    }, []);\n    const onSubmit = (event) => {\n        event.preventDefault();\n        if (!!canvasMode.isFlowrunnerPaused) {\n            return;\n        }\n        if (props.node.formMode !== false) {\n            props.flowrunnerConnector.executeFlowNode(props.node.executeNode || props.node.name, {});\n        }\n        return false;\n    };\n    const storeNode = (newNode) => {\n        flow.storeFlowNode(newNode, props.node.name);\n    };\n    const onChange = (event) => {\n        console.log(\"input\", event.target.value, props.node);\n        if (props.node) {\n            if (props.node.nodeDatasource && props.node.nodeDatasource === \"flow\") {\n                const newNode = { ...props.node, value: props.node.value };\n                setNode(newNode);\n                setValue(props.node.value);\n                storeNode(newNode);\n            }\n            else {\n                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, event.target.value, props.node.onChange || \"\");\n                setValue(event.target.value);\n            }\n        }\n    };\n    const onChangeList = (index, event) => {\n        console.log(\"input onChangeList\", event.target.value, props.node);\n        if (props.node) {\n            if (props.node.mode && props.node.mode === \"list\") {\n                let newValues = [...values];\n                newValues[parseInt(index)] = event.target.value;\n                if (props.node.nodeDatasource && props.node.nodeDatasource === \"flow\") {\n                    const newNode = { ...props.node, values: newValues };\n                    setNode(newNode);\n                    setValues(newValues);\n                    storeNode(newNode);\n                    props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.name || \"\", \"\", newNode);\n                }\n                else {\n                    props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || \"\");\n                    setValues(newValues);\n                }\n            }\n        }\n    };\n    const deleteListItem = (index, event) => {\n        event.preventDefault();\n        if (!!canvasMode.isFlowrunnerPaused) {\n            return;\n        }\n        if (props.node) {\n            if (props.node.mode && props.node.mode === \"list\") {\n                let newValues = [...values];\n                if (index > -1) {\n                    newValues.splice(index, 1);\n                    if (props.node.nodeDatasource && props.node.nodeDatasource === \"flow\") {\n                        const newNode = { ...props.node, values: newValues };\n                        setNode(newNode);\n                        setValues(newValues);\n                        storeNode(newNode);\n                    }\n                    else {\n                        props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || \"\");\n                        setValues(newValues);\n                    }\n                }\n            }\n        }\n        return false;\n    };\n    const onAddValue = (event) => {\n        event.preventDefault();\n        if (!!canvasMode.isFlowrunnerPaused) {\n            return;\n        }\n        if (props.node) {\n            let newValues = [...values];\n            newValues.push(\"\");\n            if (props.node.nodeDatasource && props.node.nodeDatasource === \"flow\") {\n                const newNode = { ...props.node, values: newValues };\n                setNode(newNode);\n                setValues(newValues);\n                storeNode(newNode);\n            }\n            else {\n                props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, newValues, props.node.onChange || \"\");\n                setValues(newValues);\n            }\n        }\n        return false;\n    };\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"html-plugin-node\", style: {\n            backgroundColor: \"white\"\n        } },\n        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: props.node.mode && props.node.mode === \"list\" ? \"w-100 overflow-y-scroll no-wheel\" : \"w-100 h-auto\" },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"form\", { className: \"form\", onSubmit: onSubmit },\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"form-group\" },\n                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", null,\n                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"label\", { htmlFor: \"input-\" + props.node.name },\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"strong\", null, props.node.title || props.node.name))),\n                    props.node.mode && props.node.mode === \"list\" ? react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null,\n                        (values || []).map((value, index) => {\n                            return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, { key: \"index-f-\" + index },\n                                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"input-group mb-1\" },\n                                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"input\", { key: \"index\" + index, className: \"form-control\", id: \"input-\" + props.node.name + \"-\" + index, value: value, \"data-index\": index, disabled: !!canvasMode.isFlowrunnerPaused, onChange: (event) => onChangeList(index, event) }),\n                                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"input-group-append\" },\n                                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"a\", { href: \"#\", title: \"delete item\", onClick: (event) => deleteListItem(index, event), role: \"button\", className: \"btn btn-outline-secondary\" },\n                                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"i\", { className: \"fas fa-trash-alt\" })))));\n                        }),\n                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-flex\" },\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"button\", { onClick: onAddValue, className: \"ml-auto mt-2 btn btn-primary pl-4 pr-4\" }, \"ADD\")),\n                        !!props.node.formMode && react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null,\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"br\", null),\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"hr\", null),\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"br\", null))) :\n                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"input\", { className: \"form-control\", id: \"input-\" + props.node.name, value: value, onChange: onChange, disabled: !!canvasMode.isFlowrunnerPaused }),\n                    !!props.node.formMode &&\n                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"d-flex\" },\n                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"button\", { className: \"ml-auto mt-2 btn btn-primary pl-4 pr-4\" }, \"OK\"))))));\n};\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/input-node.tsx?");

/***/ }),

/***/ "./src/components/html-plugins/slider-node.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SliderNodeHtmlPluginInfo\": () => (/* binding */ SliderNodeHtmlPluginInfo),\n/* harmony export */   \"SliderNodeHtmlPlugin\": () => (/* binding */ SliderNodeHtmlPlugin)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var _material_ui_core_Slider__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(\"./node_modules/@material-ui/core/esm/Slider/Slider.js\");\n/* harmony import */ var _state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/state/canvas-mode-state.ts\");\n/* harmony import */ var _state_selected_node_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"./src/state/selected-node-state.ts\");\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(\"./node_modules/uuid/index.js\");\n/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n\n\nconst uuidV4 = uuid__WEBPACK_IMPORTED_MODULE_3__.v4;\nclass SliderNodeHtmlPluginInfo {\n    constructor() {\n        this.getWidth = (node) => {\n            return 300;\n        };\n    }\n    getHeight(node) {\n        return;\n    }\n}\nconst SliderNodeHtmlPlugin = (props) => {\n    const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(props.node.defaultValue || 0);\n    const [receivedPayload, setReceivedPayload] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);\n    const canvasMode = (0,_state_canvas_mode_state__WEBPACK_IMPORTED_MODULE_1__.useCanvasModeStateStore)();\n    const selectedNode = (0,_state_selected_node_state__WEBPACK_IMPORTED_MODULE_2__.useSelectedNodeStore)();\n    const observableId = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(uuidV4());\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n        console.log(\"componentDidMount slider\");\n        if (props.node) {\n            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, props.node.defaultValue || 0, \"\");\n            setValue(props.node.defaultValue || 0);\n        }\n    }, []);\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n        if (props.node) {\n            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, value, props.node.onChange || props.node.name);\n        }\n    }, [props.flow]);\n    const onChange = (event, value) => {\n        console.log(\"slider\", value);\n        if (props.node) {\n            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, value, props.node.onChange || props.node.name, \"onChangeSlider\");\n            let preventLoop = false;\n            if (!selectedNode || !selectedNode.node.payload) {\n            }\n            setValue(value);\n        }\n    };\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"html-plugin-node\", style: {\n            backgroundColor: \"white\"\n        } },\n        react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"w-100 h-auto text-center\" },\n            props.node.title && react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { className: \"text-center\" },\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"strong\", null, props.node.title)),\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { style: {\n                    fontSize: \"24px\",\n                    marginBottom: \"20px\"\n                } },\n                props.node.preLabel && react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"span\", null, props.node.preLabel),\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"span\", null, (selectedNode &&\n                    selectedNode.node &&\n                    selectedNode.node.payload &&\n                    props.node.propertyName &&\n                    selectedNode.node.payload[props.node.propertyName]) || value),\n                props.node.afterLabel && react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"span\", null, props.node.afterLabel)),\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_material_ui_core_Slider__WEBPACK_IMPORTED_MODULE_4__.default, { min: props.node.minValue || 0, max: props.node.maxValue || 100, disabled: !!canvasMode.isFlowrunnerPaused, value: (selectedNode &&\n                    selectedNode.node &&\n                    selectedNode.node.payload &&\n                    props.node.propertyName &&\n                    selectedNode.node.payload[props.node.propertyName]) ||\n                    value || 0, onChange: onChange })));\n};\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/slider-node.tsx?");

/***/ }),

/***/ "./src/components/html-plugins/visualizers/info.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"AnimatedGridCanvasInfo\": () => (/* binding */ AnimatedGridCanvasInfo),\n/* harmony export */   \"GridCanvasInfo\": () => (/* binding */ GridCanvasInfo),\n/* harmony export */   \"XYCanvasInfo\": () => (/* binding */ XYCanvasInfo),\n/* harmony export */   \"DebugNodeHtmlPluginInfo\": () => (/* binding */ DebugNodeHtmlPluginInfo),\n/* harmony export */   \"GridEditNodeHtmlPluginInfo\": () => (/* binding */ GridEditNodeHtmlPluginInfo),\n/* harmony export */   \"GenericDebugNodeHtmlPluginInfo\": () => (/* binding */ GenericDebugNodeHtmlPluginInfo)\n/* harmony export */ });\nclass AnimatedGridCanvasInfo {\n    getWidth(node) {\n        return ((node.width || 256) + 20) || ((node.columns || 8) * 16) + 20 + 80;\n    }\n    getHeight(node) {\n        return ((node.height || 256) + 16) || ((node.rows || 8) * 16) + (3 * 16) + 4;\n    }\n}\nclass GridCanvasInfo {\n    getWidth(node) {\n        return ((node.columns || 8) * 16) + 20 + 80;\n    }\n    getHeight(node) {\n        return ((node.rows || 8) * 16) + (3 * 16) + 4;\n    }\n}\nclass XYCanvasInfo {\n    getWidth(node) {\n        return (node.width || 250) + 20 + 80;\n    }\n    getHeight(node) {\n        return (node.height || 250) + (3 * 16) + 4;\n    }\n}\nclass DebugNodeHtmlPluginInfo {\n    constructor() {\n        this.getWidth = (node) => {\n            if (node && node.visualizer && node.visualizer == \"xycanvas\") {\n                const visualizerInfo = new XYCanvasInfo();\n                return visualizerInfo.getWidth(node);\n            }\n            else if (node && node.visualizer && node.visualizer == \"gridcanvas\") {\n                const visualizerInfo = new GridCanvasInfo();\n                return visualizerInfo.getWidth(node);\n            }\n            else if (node && node.visualizer && node.visualizer == \"animatedgridcanvas\") {\n                const visualizerInfo = new AnimatedGridCanvasInfo();\n                return visualizerInfo.getWidth(node);\n            }\n            const visualizerInfo = new GenericDebugNodeHtmlPluginInfo();\n            return visualizerInfo.getWidth(node);\n        };\n    }\n    getHeight(node) {\n        if (node && node.visualizer && node.visualizer == \"xycanvas\") {\n            const visualizerInfo = new XYCanvasInfo();\n            return visualizerInfo.getHeight(node);\n        }\n        else if (node && node.visualizer && node.visualizer == \"gridcanvas\") {\n            const visualizerInfo = new GridCanvasInfo();\n            return visualizerInfo.getHeight(node);\n        }\n        else if (node && node.visualizer && node.visualizer == \"animatedgridcanvas\") {\n            const visualizerInfo = new AnimatedGridCanvasInfo();\n            return visualizerInfo.getHeight(node);\n        }\n        const visualizerInfo = new GenericDebugNodeHtmlPluginInfo();\n        return visualizerInfo.getHeight(node);\n    }\n}\nclass GridEditNodeHtmlPluginInfo {\n    getWidth(node) {\n        return (((node && node.columns) || 8) * 16) + 20 + 60;\n    }\n    getHeight(node) {\n        return (((node && node.rows) || 8) * 16) + (3 * 16) + 4 + 150;\n    }\n}\nclass GenericDebugNodeHtmlPluginInfo {\n    getWidth(node) {\n        return (node.width || 250) + 20 + 80;\n    }\n    getHeight(node) {\n        return (node.height || 250) + (3 * 16) + 4;\n    }\n}\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/visualizers/info.tsx?");

/***/ }),

/***/ "./src/render-html-node.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"setPluginRegistry\": () => (/* binding */ setPluginRegistry),\n/* harmony export */   \"renderHtmlNode\": () => (/* binding */ renderHtmlNode),\n/* harmony export */   \"getNodeInstance\": () => (/* binding */ getNodeInstance)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var _components_html_plugins_execute_node__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/components/html-plugins/execute-node.tsx\");\n/* harmony import */ var _components_html_plugins_visualizers_info__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"./src/components/html-plugins/visualizers/info.tsx\");\n/* harmony import */ var _components_html_plugins_slider_node__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(\"./src/components/html-plugins/slider-node.tsx\");\n/* harmony import */ var _components_html_plugins_input_node__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(\"./src/components/html-plugins/input-node.tsx\");\n/* harmony import */ var _components_html_plugins_form_node__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(\"./src/components/html-plugins/form-node.tsx\");\n/* harmony import */ var _components_html_plugins_data_grid_node__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(\"./src/components/html-plugins/data-grid-node.tsx\");\n\n\n\n\n\n\n\n\nconst DebugNodeHtmlPlugin = react__WEBPACK_IMPORTED_MODULE_0__.lazy(() => __webpack_require__.e(/* import() */ \"src_components_html-plugins_debug-node_tsx\").then(__webpack_require__.bind(__webpack_require__, \"./src/components/html-plugins/debug-node.tsx\")).then(({ DebugNodeHtmlPlugin }) => ({ default: DebugNodeHtmlPlugin })));\nconst GridEditNodeHtmlPlugin = react__WEBPACK_IMPORTED_MODULE_0__.lazy(() => Promise.all(/* import() */[__webpack_require__.e(\"vendors-node_modules_react-konva_es_ReactKonva_js\"), __webpack_require__.e(\"src_components_html-plugins_grid-edit_tsx\")]).then(__webpack_require__.bind(__webpack_require__, \"./src/components/html-plugins/grid-edit.tsx\")).then(({ GridEditNodeHtmlPlugin }) => ({ default: GridEditNodeHtmlPlugin })));\nlet _pluginRegistry;\nconst setPluginRegistry = (pluginRegistry) => {\n    _pluginRegistry = pluginRegistry;\n};\nconst renderHtmlNode = (node, flowrunnerConnector, flow, taskSettings, formNodesubject, flowId) => {\n    let htmlPlugin = node.htmlPlugin;\n    if (!htmlPlugin || htmlPlugin == \"\") {\n        htmlPlugin = taskSettings.htmlPlugin;\n    }\n    if (htmlPlugin == \"iframe\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"iframe\", { width: node.width || 250, height: node.height || 250, src: node.url });\n    }\n    else if (htmlPlugin == \"executeNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_html_plugins_execute_node__WEBPACK_IMPORTED_MODULE_1__.ExecuteNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node });\n    }\n    else if (htmlPlugin == \"sliderNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_html_plugins_slider_node__WEBPACK_IMPORTED_MODULE_3__.SliderNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node, flow: flow });\n    }\n    else if (htmlPlugin == \"gridEditNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, { fallback: react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", null, \"Loading...\") },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(GridEditNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node, flow: flow }));\n    }\n    else if (htmlPlugin == \"inputNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_html_plugins_input_node__WEBPACK_IMPORTED_MODULE_4__.InputNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node });\n    }\n    else if (htmlPlugin == \"formNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_html_plugins_form_node__WEBPACK_IMPORTED_MODULE_5__.FormNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node, taskSettings: taskSettings, isInFlowEditor: true, formNodesubject: formNodesubject });\n    }\n    else if (htmlPlugin == \"dataGridNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(_components_html_plugins_data_grid_node__WEBPACK_IMPORTED_MODULE_6__.DataGridNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node });\n    }\n    else if (htmlPlugin == \"debugNode\") {\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, { fallback: react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", null, \"Loading...\") },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(DebugNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node, flow: flow }));\n    }\n    else if (_pluginRegistry[htmlPlugin]) {\n        const Plugin = _pluginRegistry[node.htmlPlugin].VisualizationComponent;\n        node.visualizer = \"children\";\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Suspense, { fallback: react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", null, \"Loading...\") },\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(DebugNodeHtmlPlugin, { key: (flowId ? \"\" : flowId) + node.name, flowrunnerConnector: flowrunnerConnector, node: node, flow: flow },\n                react__WEBPACK_IMPORTED_MODULE_0__.createElement(Plugin, null)));\n    }\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { style: {\n            width: node.width || 250,\n            height: node.height || 250,\n            backgroundColor: \"white\"\n        } });\n};\nconst getNodeInstance = (node, flowrunnerConnector, flow, taskSettings) => {\n    if (!node) {\n        return;\n    }\n    let htmlPlugin = node.htmlPlugin;\n    if (!htmlPlugin || htmlPlugin == \"\") {\n        if (taskSettings) {\n            htmlPlugin = taskSettings.htmlPlugin;\n        }\n    }\n    if (htmlPlugin == \"executeNode\") {\n        return new _components_html_plugins_execute_node__WEBPACK_IMPORTED_MODULE_1__.ExecuteNodeHtmlPluginInfo();\n    }\n    else if (htmlPlugin == \"sliderNode\") {\n        return new _components_html_plugins_slider_node__WEBPACK_IMPORTED_MODULE_3__.SliderNodeHtmlPluginInfo();\n    }\n    else if (htmlPlugin == \"gridEditNode\") {\n        return new _components_html_plugins_visualizers_info__WEBPACK_IMPORTED_MODULE_2__.GridEditNodeHtmlPluginInfo();\n    }\n    else if (htmlPlugin == \"inputNode\") {\n        return new _components_html_plugins_input_node__WEBPACK_IMPORTED_MODULE_4__.InputNodeHtmlPluginInfo();\n    }\n    else if (htmlPlugin == \"formNode\") {\n        return new _components_html_plugins_form_node__WEBPACK_IMPORTED_MODULE_5__.FormNodeHtmlPluginInfo(taskSettings);\n    }\n    else if (htmlPlugin == \"debugNode\") {\n        return new _components_html_plugins_visualizers_info__WEBPACK_IMPORTED_MODULE_2__.DebugNodeHtmlPluginInfo();\n    }\n    else if (htmlPlugin == \"dataGridNode\") {\n        return new _components_html_plugins_data_grid_node__WEBPACK_IMPORTED_MODULE_6__.DataGridNodeHtmlPluginInfo();\n    }\n    return;\n};\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/render-html-node.tsx?");

/***/ })

}]);