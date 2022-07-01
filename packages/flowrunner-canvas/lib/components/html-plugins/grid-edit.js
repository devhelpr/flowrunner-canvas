import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import { PresetManager } from './components/preset-manager';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class GridEditNodeHtmlPlugin extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            value: this.props.node.defaultValue || 0,
            receivedPayload: [],
            data: []
        };
        this.observableId = uuidV4();
        this.unmounted = false;
        this.clickCircle = (matrixValue, event) => {
            event.evt.preventDefault();
            if (matrixValue) {
                let list = [...this.state.data];
                let item = list[matrixValue.x + matrixValue.y * ((this.props.node && this.props.node.columns) || 8)];
                item.value = (item.value == 1 ? 0 : 1);
                this.setState({ data: list });
                let values = [];
                list.map((value, index) => {
                    if (value.value == 1) {
                        values.push({ ...value });
                    }
                });
                this.props.flowrunnerConnector.modifyFlowNode(this.props.node.name, this.props.node.propertyName, values, this.props.node.name);
            }
            return false;
        };
        this.onLoadPreset = () => {
        };
        this.onGetData = () => {
            let values = [];
            this.state.data.map((value, index) => {
                if (value.value == 1) {
                    values.push({ ...value });
                }
            });
            return values;
        };
        this.onSetData = (data) => {
            let values = [];
            let list = new Array((this.props.node.columns || 8) * (this.props.node.rows || 8)).fill(0).map((item, index) => {
                return {
                    value: 0,
                    x: index % (this.props.node.columns || 8),
                    y: Math.floor(index / (this.props.node.columns || 8))
                };
            });
            data.map((value, index) => {
                if (value.value == 1) {
                    list[value.y * (this.props.node.columns || 8) + value.x].value = 1;
                    values.push({ ...value });
                }
            });
            this.setState({ data: list });
            this.props.flowrunnerConnector.modifyFlowNode(this.props.node.name, this.props.node.propertyName, values, this.props.node.name);
        };
    }
    componentDidMount() {
        console.log("componentDidMount slider");
        if (this.props.node) {
            this.props.flowrunnerConnector.modifyFlowNode(this.props.node.name, this.props.node.propertyName, this.props.node.defaultValue || 0, "");
            this.setState({ data: new Array((this.props.node.columns || 8) *
                    (this.props.node.rows || 8)).fill(0).map((item, index) => {
                    return {
                        value: 0,
                        x: index % (this.props.node.columns || 8),
                        y: Math.floor(index / (this.props.node.columns || 8))
                    };
                })
            });
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.flow != this.props.flow) {
            if (this.props.node) {
                this.props.flowrunnerConnector.modifyFlowNode(this.props.node.name, this.props.node.propertyName, this.state.value, this.props.node.onChange || this.props.node.name);
            }
        }
    }
    componentWillUnmount() {
        this.unmounted = true;
    }
    getWidth() {
        return (((this.props.node && this.props.node.columns) || 8) * 16) + 20;
    }
    getHeight() {
        return (((this.props.node && this.props.node.rows) || 8) * 16) + (3 * 16) + 4 + 150;
    }
    getCanvasHeight() {
        return (((this.props.node && this.props.node.rows) || 8) * 16) + (1 * 16) + 4;
    }
    render() {
        let circles = null;
        let { node } = this.props;
        if (!this.state.data) {
            return null;
        }
        let list = this.state.data;
        circles = list.map((matrixValue, index) => {
            let circle = null;
            let x = matrixValue.x;
            let y = matrixValue.y;
            if (matrixValue.value == 1) {
                circle = _jsxs(React.Fragment, { children: [_jsx(Circle, { x: (x * 16) + 18, y: (y * 16) + 10, radius: 14, stroke: "#000000", strokeWidth: 2, width: 14, height: 14, opacity: 1, fill: "#ffffff", onClick: this.clickCircle.bind(this, matrixValue), perfectDrawEnabled: false }, "xycanvas-gridedit-alive-circle-" + index), _jsx(Circle, { x: (x * 16) + 18, y: (y * 16) + 10, radius: 16, stroke: "#ffffff", strokeWidth: 2, width: 12, height: 12, opacity: 1, fill: "#000000", onClick: this.clickCircle.bind(this, matrixValue), perfectDrawEnabled: false }, "xycanvas-gridedit-alive-inner-" + index)] }, "xycanvas-gridedit-alive-" + index);
            }
            else {
                circle = _jsx(Circle, { x: (x * 16) + 18, y: (y * 16) + 10, radius: 14, stroke: "#000000", strokeWidth: 1, width: 14, height: 14, opacity: 1, fill: "#ffffff", onClick: this.clickCircle.bind(this, matrixValue), perfectDrawEnabled: false }, "xycanvas-gridedit-dead-" + index);
            }
            return circle;
        });
        list = null;
        node = null;
        return _jsxs("div", { className: "html-plugin-node html-plugin-node__grid-edit", style: {
                backgroundColor: "white",
                width: (this.getWidth() || this.props.node.width || 250) + "px",
                height: (this.getHeight() || this.props.node.height || 250) + "px"
            }, children: [_jsx(Stage, { className: "stage-div", pixelRatio: 1, width: this.getWidth() || this.props.node.width || 250, height: (this.getCanvasHeight()) || this.props.node.height || 250, children: _jsx(Layer, { children: circles }) }), _jsx(PresetManager, { node: this.props.node, onLoadPreset: this.onLoadPreset, onGetData: this.onGetData, onSetData: this.onSetData })] });
    }
}
//# sourceMappingURL=grid-edit.js.map