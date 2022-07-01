import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import Slider from '@material-ui/core/Slider';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useSelectedNodeStore } from '../../state/selected-node-state';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class SliderNodeHtmlPluginInfo {
    constructor() {
        this.getWidth = (node) => {
            return 300;
        };
    }
    getHeight(node) {
        return;
    }
}
export const SliderNodeHtmlPlugin = (props) => {
    const [value, setValue] = useState(props.node.defaultValue || 0);
    const [receivedPayload, setReceivedPayload] = useState([]);
    const canvasMode = useCanvasModeStateStore();
    const selectedNode = useSelectedNodeStore();
    const observableId = useRef(uuidV4());
    useEffect(() => {
        console.log("componentDidMount slider");
        if (props.node) {
            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, props.node.defaultValue || 0, "");
            setValue(props.node.defaultValue || 0);
        }
    }, []);
    useEffect(() => {
        if (props.node) {
            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, value, props.node.onChange || props.node.name);
        }
    }, [props.flow]);
    const onChange = (event, value) => {
        console.log("slider", value);
        if (props.node) {
            props.flowrunnerConnector.modifyFlowNode(props.node.name, props.node.propertyName, value, props.node.onChange || props.node.name, "onChangeSlider");
            let preventLoop = false;
            if (!selectedNode || !selectedNode.node.payload) {
            }
            setValue(value);
        }
    };
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: _jsxs("div", { className: "w-100 h-auto text-center", children: [props.node.title && _jsx("div", { className: "text-center", children: _jsx("strong", { children: props.node.title }) }), _jsxs("div", { style: {
                        fontSize: "24px",
                        marginBottom: "20px"
                    }, children: [props.node.preLabel && _jsx("span", { children: props.node.preLabel }), _jsx("span", { children: (selectedNode &&
                                selectedNode.node &&
                                selectedNode.node.payload &&
                                props.node.propertyName &&
                                selectedNode.node.payload[props.node.propertyName]) || value }), props.node.afterLabel && _jsx("span", { children: props.node.afterLabel })] }), _jsx(Slider, { min: props.node.minValue || 0, max: props.node.maxValue || 100, disabled: !!canvasMode.isFlowrunnerPaused, value: (selectedNode &&
                        selectedNode.node &&
                        selectedNode.node.payload &&
                        props.node.propertyName &&
                        selectedNode.node.payload[props.node.propertyName]) ||
                        value || 0, onChange: onChange })] }) });
};
//# sourceMappingURL=slider-node.js.map