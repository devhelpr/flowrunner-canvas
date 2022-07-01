import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Text, Rect } from 'react-konva';
import { FlowEventRunner } from '@devhelpr/flowrunner';
import { getWebassembly } from '../../../flowrunner-plugins/components/webassembly';
import { registerExpressionFunction } from '@devhelpr/expressionrunner';
registerExpressionFunction('Math.PI', (a, ...args) => {
    return Math.PI;
});
registerExpressionFunction('Math.sqrt', (a, ...args) => {
    return Math.sqrt(a);
});
registerExpressionFunction('Math.sin', (a, ...args) => {
    return Math.sin(a);
});
registerExpressionFunction('sin', (a, ...args) => {
    return Math.sin(a);
});
registerExpressionFunction('hypot', (a, ...args) => {
    return Math.hypot(a, args[0]);
});
registerExpressionFunction('Math.sindegree', (a, ...args) => {
    return Math.sin((a * Math.PI) / 180);
});
registerExpressionFunction('Math.random', (a, ...args) => {
    return Math.random();
});
registerExpressionFunction('Math.atan', (a, ...args) => {
    return Math.atan(a);
});
registerExpressionFunction('Math.floor', (a, ...args) => {
    return Math.floor(a);
});
registerExpressionFunction('Math.ceil', (a, ...args) => {
    return Math.ceil(a);
});
registerExpressionFunction('Math.round', (a, ...args) => {
    return Math.round(a);
});
export const AnimatedGridCanvas = (props) => {
    const [payload, setPayload] = useState({ data: [] });
    const [performanceTimer, setPerformanceTimer] = useState(0);
    const active = useRef(true);
    const flowIsRunning = useRef(false);
    const flowRunner = useRef(new FlowEventRunner());
    let circleRefs = useRef([]);
    let canvas = useRef(null);
    let perftext = useRef(null);
    let stage = useRef(null);
    let textRef = useRef(null);
    let wasmRef = useRef(null);
    let lastTime = useRef(performance.now());
    let activeScript = useRef("");
    let scriptId = useRef(0);
    let canvasMode = useRef("");
    let rafHandler = useRef(null);
    let currentWidth = useRef(null);
    let currentHeight = useRef(null);
    let fps = useRef(0);
    const runWasm = useCallback((lastPayload, width, height) => {
        if (!wasmRef.current) {
            console.log("wasmRef is empty");
            return;
        }
        let data = wasmRef.current;
        if (!data) {
            return;
        }
        console.log("runwasm", width, height);
        let buffer = null;
        try {
            buffer = new Uint8Array(data.instance.exports.memory.buffer, 0, width * height * 4);
        }
        catch (err) {
            console.log("runwasm error", err);
            return;
        }
        let context;
        let imageData;
        if (canvasMode.current === "pixels" && canvas.current) {
            context = canvas.current.getContext('2d');
            imageData = context.createImageData(width, height);
        }
        let currentScriptId = scriptId.current;
        let inputParameters = [];
        (wasmRef.current.inputVariables).map((input) => {
            inputParameters.push(0);
        });
        if (lastPayload) {
            (wasmRef.current.inputVariables).map((input, index) => {
                inputParameters[index] = Number(lastPayload[input]) || 0;
            });
        }
        const wasmSize = (data.wasm.length / 1000).toFixed(2);
        let quitRenderLoop = false;
        if (canvasMode.current === "circles") {
            const renderLoop = () => {
                if (!active.current) {
                    return;
                }
                if (currentScriptId != scriptId.current) {
                    console.log("quit renderloop");
                    return;
                }
                if (!quitRenderLoop) {
                    rafHandler.current = requestAnimationFrame(renderLoop);
                }
                let perfStart = performance.now();
                for (let y = 0; y < 16; y++) {
                    for (let x = 0; x < 16; x++) {
                        let time = performance.now() - lastTime.current;
                        const result = data.mainFunction(data.instance, x, y, y * 16 + x, time, width, height, ...inputParameters);
                        let radius = 0;
                        let stroke = "";
                        let fill = "";
                        let circlewidth = 13;
                        let circleheight = 13;
                        if (result >= 1 || result <= -1) {
                            radius = 13;
                            stroke = result <= -1 ? "#ff0000" : "#000000";
                            fill = result <= -1 ? "#ff0000" : "#000000";
                        }
                        else if (result != 0) {
                            radius = 13 * Math.abs(result);
                            stroke = result < 0 ? "#ff0000" : "#000000";
                            fill = result < 0 ? "#ff0000" : "#000000";
                            circlewidth = 13 * Math.abs(result);
                            circleheight = 13 * Math.abs(result);
                        }
                        let circle = circleRefs.current["circle" + (y * 16 + x)];
                        if (circle) {
                            circle.radius(radius);
                            circle.stroke(stroke);
                            circle.width(circlewidth);
                            circle.height(circleheight);
                            circle.fill(fill);
                        }
                    }
                }
                const perfEnd = performance.now() - perfStart;
                if (textRef && textRef.current) {
                    textRef.current.text(perfEnd.toFixed(2) + "ms - " + wasmSize + "kb");
                }
                if (stage && stage.current) {
                    let stageInstance = stage.current.getStage();
                    stageInstance.draw();
                }
            };
            rafHandler.current = requestAnimationFrame(renderLoop);
        }
        else if (canvasMode.current === "pixels") {
            let counter = 0;
            fps.current = performance.now();
            const renderLoopPixels = () => {
                if (!active.current) {
                    return;
                }
                if (currentScriptId != scriptId.current) {
                    return;
                }
                if (quitRenderLoop) {
                    return;
                }
                if (!buffer) {
                    return;
                }
                rafHandler.current = requestAnimationFrame(renderLoopPixels);
                let time = performance.now() - lastTime.current;
                const result = data.mainFunction(data.instance, 0, 0, 0, time, width, height, ...inputParameters);
                imageData.data.set(buffer);
                context.putImageData(imageData, 0, 0);
                const perfEnd = performance.now() - fps.current;
                fps.current = performance.now();
                counter++;
                if (counter > 25) {
                    counter = 0;
                    perftext.current.innerText = wasmSize + "kb - " + (1000 / perfEnd).toFixed(0) + "fps";
                }
            };
            rafHandler.current = requestAnimationFrame(renderLoopPixels);
        }
        return () => {
            console.log("quit renderloop");
            quitRenderLoop = true;
            buffer = undefined;
        };
    }, [props.node, props.node.width, props.node.height]);
    useEffect(() => {
        active.current = true;
        if (props.payloads.length == 0) {
            return;
        }
        canvasMode.current = props.node.mode;
        if (rafHandler.current) {
            cancelAnimationFrame(rafHandler.current);
            rafHandler.current = undefined;
        }
        console.log("AnimatedGridCanvas, start useEffect");
        let currentScript = props.payloads[props.payloads.length - 1].script;
        if (!wasmRef.current ||
            (!currentWidth.current) ||
            (!currentHeight.current) ||
            (currentWidth.current != (props.node.width || 256)) ||
            (currentHeight.current != (props.node.height || 256)) ||
            (currentScript !== undefined && currentScript !== "" &&
                currentScript !== activeScript.current)) {
            console.log("retrieve fresh webassembly", props.node.width, props.node.height);
            wasmRef.current = null;
            activeScript.current = currentScript;
            currentWidth.current = props.node.width || 256;
            currentHeight.current = props.node.height || 256;
            getWebassembly(currentScript, currentWidth.current, currentHeight.current).then((data) => {
                if (data === false) {
                    return;
                }
                wasmRef.current = data;
                scriptId.current = scriptId.current + 1;
                runWasm(props.payloads[props.payloads.length - 1], currentWidth.current, currentHeight.current);
            });
        }
        else {
            console.log("reuse existing webassembly");
            if (activeScript.current && activeScript.current !== "" && wasmRef.current) {
                console.log("pre runwasm");
                runWasm(props.payloads[props.payloads.length - 1], currentWidth.current, currentHeight.current);
            }
        }
        return () => {
            console.log("AnimatedGridCanvas, unsubscribe useEffect");
            if (active) {
                active.current = false;
            }
            if (rafHandler.current) {
                cancelAnimationFrame(rafHandler.current);
                rafHandler.current = undefined;
            }
            if (flowRunner && flowRunner.current && flowIsRunning && flowIsRunning.current) {
                flowRunner.current.destroyFlow();
            }
        };
    }, [props.node, props.payloads, props.node.width, props.node.height]);
    const getWidth = () => {
        return props.node.width || ((props.node.columns || 8) * 16);
    };
    const getHeight = () => {
        return props.node.height || ((props.node.rows || 8) * 16);
    };
    let circles = null;
    let { node } = props;
    if (node.mode === "circles") {
        circles = [];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                let index = y * 16 + x;
                let radius = 0;
                let stroke = "";
                let fill = "";
                let width = 13;
                let height = 13;
                let circle = _jsx(Circle, { x: (x * 16) + 8, y: (y * 16) + 8, ref: ref => (circleRefs.current["circle" + index] = ref), radius: radius, stroke: stroke, strokeWidth: 2, width: width, height: height, opacity: 1, fill: fill, listening: false, transformsEnabled: "position", perfectDrawEnabled: false }, "xycanvasgrid-" + index);
                circles.push(circle);
            }
        }
    }
    else if (node.mode === "pixels") {
        return _jsxs("div", { style: {
                position: "relative",
                width: node.width ? node.width + "px" : "256px",
                height: node.height ? node.height + "px" : "256px",
                alignSelf: "center",
                marginTop: "auto",
                marginBottom: "auto",
                maxWidth: "100%"
            }, children: [_jsx("div", { ref: ref => (perftext.current = ref), style: { position: "absolute", top: "0px", left: "0px", background: "rgba(0,0,0,0.5)", color: "#ffffff" }, children: "0" }), _jsx("canvas", { ref: ref => (canvas.current = ref), width: node.width || 256, height: node.height || 256 })] });
    }
    node = null;
    return _jsx(Stage, { pixelRatio: 1, listening: false, ref: ref => (stage.current = ref), width: getWidth() || props.node.width || 250, height: getHeight() || props.node.height || 250, children: _jsxs(Layer, { listening: false, children: [circles, _jsx(Rect, { x: 4, y: 4, height: 32, width: 100, opacity: 0.5, fill: "#000000" }), _jsx(Text, { align: "left", ref: ref => (textRef.current = ref), fontSize: 18, y: 4, x: 4, height: 32, verticalAlign: "middle", fill: "#ffffff", text: performanceTimer.toFixed(2) + "ms" })] }) });
};
//# sourceMappingURL=animated-grid-canvas.js.map