import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { Stage, Layer, Circle, Line, Text, Label } from 'react-konva';
const heightCorrection = 42;
export class XYCanvas extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
        this.getCurrentDebugNotifier = () => {
            if (this.props.selectedNode && this.props.selectedNode.node) {
                let selectedNodePayload = this.props.selectedNode.payload;
                if (selectedNodePayload) {
                    if (!selectedNodePayload.nodeExecutionId) {
                        return null;
                    }
                    let nodeExecutions = this.props.flowrunnerConnector.getNodeExecutions();
                    let executionIndex = -1;
                    nodeExecutions.map((nodeExec, index) => {
                        if (nodeExec && nodeExec.payload && nodeExec.payload.nodeExecutionId == selectedNodePayload.nodeExecutionId) {
                            executionIndex = index;
                        }
                    });
                    if (executionIndex >= 0) {
                        let isFound = false;
                        let resultPayloadIndex = -1;
                        let loop = executionIndex;
                        while (loop >= 0) {
                            let index = loop;
                            let nodeExec = nodeExecutions[loop];
                            if (!isFound && index <= executionIndex) {
                                this.props.payloads.map((payload, payloadIndex) => {
                                    if (!isFound && payload && nodeExec.payload && payload.debugId == nodeExec.payload.debugId) {
                                        isFound = true;
                                        resultPayloadIndex = payloadIndex;
                                    }
                                });
                            }
                            loop--;
                        }
                        if (resultPayloadIndex >= 0) {
                            let height = (this.props.node.height || 250) - heightCorrection;
                            let width = (this.props.node.width || 250);
                            return _jsx(Line, { points: [resultPayloadIndex, 0,
                                    resultPayloadIndex,
                                    height
                                ], tension: 0, closed: true, stroke: "#3f51b5", strokeWidth: 2 });
                        }
                    }
                }
            }
            return null;
        };
        this.getMinMax = (payloads, series, height, node) => {
            let result = {
                min: undefined,
                max: undefined,
                ratio: 1,
                correction: 0
            };
            payloads.map((payload) => {
                series.map((serie) => {
                    if (payload[serie.yProperty]) {
                        if (result.min === undefined || payload[serie.yProperty] < result.min) {
                            result.min = payload[serie.yProperty];
                        }
                        if (result.max === undefined || payload[serie.yProperty] > result.max) {
                            result.max = payload[serie.yProperty];
                        }
                    }
                });
            });
            if (node.minValue !== undefined) {
                result.min = result.min !== undefined && node.minValue > result.min ? result.min : node.minValue;
            }
            if (node.maxValue !== undefined) {
                result.max = result.max !== undefined && node.maxValue < result.max ? result.max : node.maxValue;
            }
            if (result.min !== undefined && result.max !== undefined) {
                if (result.max - result.min != 0 && height != 0) {
                    result.ratio = 1 / ((result.max - result.min) / (height - 2));
                }
                if (result.min < 0) {
                    result.correction = -(result.min * result.ratio) + 1;
                }
                else {
                    result.correction = -(result.min * result.ratio) + 1;
                }
            }
            return result;
        };
        this.getLineChart = (node, xProperty, yProperty, payload, index, payloads, color, serieIndex, title, fill, minmax) => {
            let circle = null;
            let height = (this.props.node.height || 250) - heightCorrection;
            let xPosition = index;
            if (payloads.length < 250) {
                xPosition = index + (250 - payloads.length);
            }
            if ((xProperty == "index" || !isNaN(payload[xProperty])) &&
                !isNaN(payload[yProperty])) {
                let x = 0;
                if (xProperty == "index") {
                    x = xPosition;
                }
                else {
                    x = payload[xProperty];
                }
                let y = 2 + ((height - 2) - ((payload[yProperty] * minmax.ratio) + (minmax.correction)));
                let xNext = 0;
                let yNext = 0;
                if (!!node.includeLines && (index < payloads.length - 1)) {
                    if (xProperty == "index") {
                        xNext = xPosition + 1;
                    }
                    else {
                        xNext = payloads[index + 1][xProperty];
                    }
                    yNext = 2 + ((height - 2) - ((payloads[index + 1][yProperty] * minmax.ratio) + (minmax.correction)));
                }
                circle = _jsxs(React.Fragment, { children: [!node.includeLines &&
                            _jsx(Circle, { x: x, y: y, radius: 4, stroke: color, strokeWidth: 2, width: 4, height: 4, fill: color, perfectDrawEnabled: true }, "xycanvas-" + index + "-" + serieIndex), fill !== "" && !!node.includeLines && (index < payloads.length - 1) && _jsx(Line, { points: [x, y,
                                xNext,
                                yNext,
                                xNext, height,
                                x, height
                            ], tension: 0, closed: true, strokeWidth: 1, fill: fill }), !!node.includeLines && (index < payloads.length - 1) && _jsx(Line, { points: [x, y,
                                xNext,
                                yNext
                            ], tension: 0, closed: true, stroke: color, strokeWidth: 1 }), _jsx(Label, { x: 4, y: serieIndex * 24, children: _jsx(Text, { text: title, fontSize: 18, align: 'left', height: 24, verticalAlign: "middle", listening: false, wrap: "none", ellipsis: true, fill: color, perfectDrawEnabled: true }) })] }, "xycanvas-wrapper-" + index + "-" + serieIndex);
            }
            return circle;
        };
        this.getCurved = (node, xProperty, yProperty, payloads, minmax) => {
            let height = (this.props.node.height || 250) - heightCorrection;
            let points = [];
            payloads.map((payload, index) => {
                if (index % (node.sample || 10) == 0) {
                    if ((xProperty == "index" || !isNaN(payload[xProperty])) &&
                        !isNaN(payload[yProperty])) {
                        let xPosition = index;
                        if (payloads.length < 250) {
                            xPosition = index + (250 - payloads.length);
                        }
                        let x = 0;
                        if (xProperty == "index") {
                            x = xPosition;
                        }
                        else {
                            x = payload[xProperty];
                        }
                        let y = 2 + ((height - 2) - ((payload[yProperty] * minmax.ratio) + (minmax.correction)));
                        points.push(x);
                        points.push(y);
                    }
                }
            });
            return _jsx(Line, { points: points, stroke: "#000000", bezier: true, strokeWidth: 1 });
        };
    }
    componentDidMount() {
    }
    render() {
        var _a, _b;
        let height = (this.props.node.height || 250) - heightCorrection;
        let circles = null;
        const { node, payloads } = this.props;
        let minmax = this.getMinMax(payloads, node.series ? node.series : [{ xProperty: node.xProperty, yProperty: node.yProperty }], height, this.props.node);
        if (!!node.showCurved) {
            circles = this.getCurved(node, node.xProperty, node.yProperty, payloads, minmax);
        }
        else {
            circles = payloads.map((payload, index) => {
                let circle = null;
                if (node.series) {
                    circle = node.series.map((serie, serieIndex) => {
                        if (serie.xProperty && serie.yProperty && serie.color) {
                            return this.getLineChart(node, serie.xProperty, serie.yProperty, payload, index, payloads, serie.color, serieIndex, serie.title || "", serie.fill || "", minmax);
                        }
                        return null;
                    });
                }
                else if (node.xProperty && node.yProperty) {
                    circle = this.getLineChart(node, node.xProperty, node.yProperty, payload, index, payloads, node.color || "#000000", 0, node.lineTitle || "", node.fill || "", minmax);
                }
                return circle;
            });
        }
        const yAdd = 6;
        return _jsxs(_Fragment, { children: [_jsx(Stage, { pixelRatio: 1, width: (this.props.node.width || 250) + 1, height: height, children: _jsxs(Layer, { children: [circles, this.getCurrentDebugNotifier()] }) }), _jsxs("div", { className: "xy-canvas__legend", children: [_jsxs("div", { className: "xy-canvas__text", children: ["min: ", (_a = minmax.min) === null || _a === void 0 ? void 0 : _a.toFixed(2)] }), _jsxs("div", { className: "xy-canvas__text", children: ["max: ", (_b = minmax.max) === null || _b === void 0 ? void 0 : _b.toFixed(2)] })] })] });
    }
}
//# sourceMappingURL=xy-canvas.js.map