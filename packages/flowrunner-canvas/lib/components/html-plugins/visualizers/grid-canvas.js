import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Stage, Layer, Circle, Line } from 'react-konva';
export class GridCanvas extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }
    componentDidMount() {
    }
    getWidth() {
        return ((this.props.node.columns || 8) * 16);
    }
    getHeight() {
        return ((this.props.node.rows || 8) * 16);
    }
    render() {
        let circles = null;
        let { node, payloads } = this.props;
        let list = (node.mode === "matrix" ? ((payloads[payloads.length - 1] || { data: [] }).data || []) : payloads);
        let currentPayload = payloads[payloads.length - 1];
        circles = list.map((payload, index) => {
            let circle = null;
            if (node.mode === "matrix") {
                let x = index % (currentPayload.columns);
                let y = Math.floor(index / currentPayload.rows);
                if (payload >= 1 || payload <= -1) {
                    circle = _jsx(Circle, { x: (x * 16) + 8, y: (y * 16) + 8, radius: 16, stroke: payload <= -1 ? "#ff0000" : "#000000", strokeWidth: 2, width: 16, height: 16, opacity: 1, fill: payload <= -1 ? "#ff0000" : "#000000", perfectDrawEnabled: false }, "xycanvasgrid-" + index);
                }
                else if (payload != 0) {
                    circle = _jsx(Circle, { x: (x * 16) + 8, y: (y * 16) + 8, radius: 16 * Math.abs(payload), stroke: payload < 0 ? "#ff0000" : "#000000", strokeWidth: 2, width: 16 * Math.abs(payload), height: 16 * Math.abs(payload), opacity: 1, fill: payload < 0 ? "#ff0000" : "#000000", perfectDrawEnabled: false }, "xycanvasgrid-" + index);
                }
            }
            else if (node.mode !== "matrix" && node.xProperty && node.yProperty) {
                if (!isNaN(payload[node.xProperty]) && !isNaN(payload[node.yProperty])) {
                    const opacity = node.ageProperty ? (payload[node.ageProperty] || (payload[node.ageProperty] === 0 ? 0 : 1)) : ((index + 1) / (payloads.length * 2));
                    let indexNextLine = index + 1;
                    if (index >= payloads.length - 1) {
                        indexNextLine = 0;
                    }
                    circle = _jsxs(React.Fragment, { children: [!!node.includeLines &&
                                index < indexNextLine &&
                                payload[node.xProperty] < payloads[indexNextLine][node.xProperty] &&
                                _jsx(Line, { points: [
                                        payload[node.xProperty] * 16,
                                        payload[node.yProperty] * 16,
                                        payloads[indexNextLine][node.xProperty] * 16,
                                        payloads[indexNextLine][node.yProperty] * 16
                                    ], tension: 0.5, opacity: opacity, stroke: "black" }), _jsx(Circle, { x: (payload[node.xProperty] * 16), y: (payload[node.yProperty] * 16), radius: 16, stroke: "#000000", strokeWidth: 2, width: 16, height: 16, opacity: opacity, fill: "#000000", perfectDrawEnabled: false }, "xycanvasgrid-" + index)] }, "xycanvas-wrapper" + index);
                }
            }
            return circle;
        });
        list = null;
        currentPayload = null;
        node = null;
        payloads = null;
        return _jsx(Stage, { pixelRatio: 1, width: this.getWidth() || this.props.node.width || 250, height: this.getHeight() || this.props.node.height || 250, children: _jsx(Layer, { children: circles }) });
    }
}
//# sourceMappingURL=grid-canvas.js.map