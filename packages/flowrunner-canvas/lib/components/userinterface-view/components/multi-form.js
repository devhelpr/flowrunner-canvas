import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { FlowConnector } from '../../../flow-connector';
import { MultiFormView } from '../../userinterface-view/multi-form-view';
import { getFlowAgent } from '../../../flow-agent';
export const MultiForm = (props) => {
    var _a, _b, _c, _d;
    const [formStep, setFormStep] = useState(0);
    const [flowEnabled, setFlowEnabled] = useState(false);
    const workerRef = useRef(null);
    const flowrunnerConnector = useRef(null);
    useEffect(() => {
        workerRef.current = getFlowAgent();
        workerRef.current.postMessage("worker", {
            command: 'init'
        });
        flowrunnerConnector.current = new FlowConnector();
        flowrunnerConnector.current.registerWorker(workerRef.current);
        setFlowEnabled(true);
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [props.node, formStep]);
    const onNextStep = (event) => {
        var _a, _b;
        event.preventDefault();
        if (formStep < ((_b = (_a = props.node) === null || _a === void 0 ? void 0 : _a.formFlows) === null || _b === void 0 ? void 0 : _b.length) - 1) {
            setFlowEnabled(false);
            setFormStep(formStep + 1);
        }
        return false;
    };
    const onPreviousStep = (event) => {
        event.preventDefault();
        if (formStep > 0) {
            setFlowEnabled(false);
            setFormStep(formStep - 1);
        }
        return false;
    };
    return _jsxs(_Fragment, { children: [_jsxs("p", { children: ["MultiForm form-step: ", formStep + 1, " / ", (_b = (_a = props.node) === null || _a === void 0 ? void 0 : _a.formFlows) === null || _b === void 0 ? void 0 : _b.length] }), _jsx("div", { children: flowEnabled && props.node && props.node.formFlows && props.node.formFlows.length > 0 &&
                    _jsx("div", { className: "card", children: _jsx("div", { className: "card-body", children: _jsx(MultiFormView, { renderHtmlNode: props.renderHtmlNode, getNodeInstance: props.getNodeInstance, flowrunnerConnector: flowrunnerConnector.current, flowId: props.node.formFlows[formStep].flowId }) }) }) }), _jsxs("div", { className: "row mt-2", children: [formStep > 0 &&
                        _jsx("div", { className: "col-auto", children: _jsx("button", { className: "btn btn-outline-primary", onClick: onPreviousStep, children: "Previous" }) }), formStep < ((_d = (_c = props.node) === null || _c === void 0 ? void 0 : _c.formFlows) === null || _d === void 0 ? void 0 : _d.length) - 1 &&
                        _jsx("div", { className: "col-auto", children: _jsx("button", { className: "btn btn-primary", onClick: onNextStep, children: "Next" }) })] })] });
};
//# sourceMappingURL=multi-form.js.map