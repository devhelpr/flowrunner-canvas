import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useCanvasModeStateStore } from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { useFlowStore } from '../../state/flow-state';
import { getFlowAgent } from '../../flow-agent';
export const TestsModule = (props) => {
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const modulesMenu = useModulesStateStore();
    const canvasMode = useCanvasModeStateStore();
    const flow = useFlowStore();
    const workerRef = useRef(null);
    useEffect(() => {
        workerRef.current = getFlowAgent();
        workerRef.current.postMessage("worker", {
            command: 'init'
        });
        workerRef.current.addEventListener("external", onMessage);
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);
    const onMessage = useCallback((message, worker) => {
        console.log("Modules onMessage", message);
        if (message && message.data && message.data.command == "TestRunnerResults") {
            if (!!message.data.notFound) {
                setError("No tests defined");
                setResults([]);
            }
            else if (!!message.data.error) {
                setError("Error while executing tests");
                setResults([]);
            }
            else {
                setResults(message.data.results || []);
                setError("");
            }
        }
    }, [flow.flowId, flow.flow]);
    useEffect(() => {
        setResults([]);
        setError("");
        workerRef.current.postMessage("worker", {
            command: 'pushFlowToFlowrunner',
            flow: flow.flow,
            flowId: flow.flowId,
            pluginRegistry: [],
            autoStartNodes: true,
        });
    }, [flow.flowId, flow.flow]);
    const runTests = useCallback((event) => {
        event.preventDefault();
        if (workerRef.current) {
            workerRef.current.postMessage("worker", {
                command: 'runTests',
                flowId: flow.flowId
            });
        }
        return false;
    }, [flow.flowId]);
    return _jsxs(_Fragment, { children: [_jsx(Button, { variant: "primary", onClick: runTests, children: "Run tests" }), _jsx("br", {}), _jsx("br", {}), error !== "" ? error :
                results.map((result, index) => {
                    return _jsx("div", { children: _jsxs("label", { children: [result.name, result.result.result ? " : OK!" : " failed..."] }) }, index);
                })] });
};
//# sourceMappingURL=tests-module.js.map