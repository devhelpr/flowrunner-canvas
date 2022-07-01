import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import * as uuid from 'uuid';
const uuidV4 = uuid.v4;
export class CustomNodeHtmlPluginInfo {
    constructor(taskSettings) {
        this.getWidth = (node) => {
            return;
        };
        this._taskSettings = taskSettings;
    }
    getHeight(node) {
        return;
    }
}
export const CustomNodeHtmlPlugin = (props) => {
    const [receivedPayload, setReceivedPayload] = useState({});
    const observableId = useRef(uuidV4());
    const unmounted = useRef(false);
    const canvasMode = useCanvasModeStateStore();
    useEffect(() => {
        console.log("CustomNodeHtmlPlugin", props);
        return () => {
            unmounted.current = true;
        };
    }, []);
    useEffect(() => {
        var _a;
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
    const receivePayloadFromNode = useCallback((payload) => {
        console.log("receivePayloadFromNode", payload);
        if (unmounted.current) {
            return;
        }
        setReceivedPayload(payload);
        return;
    }, [props.taskSettings, props.node]);
    const config = props.taskSettings.config || props.node.config;
    return _jsx("div", { className: "html-plugin-node", style: {
            backgroundColor: "white"
        }, children: config &&
            config.objects.map((object, index) => {
                return _jsxs("div", { className: object.css || "", style: {}, children: [object.iconSpec && _jsx("i", { className: object.iconSpec }), (object.imageUrl || receivedPayload.imageUrl) && _jsx("img", { src: (receivedPayload && receivedPayload.imageUrl) || object.imageUrl, style: { objectFit: "cover" }, className: object.imageCss })] }, "custom-node-object-" + index);
            }) });
};
//# sourceMappingURL=custom-node.js.map