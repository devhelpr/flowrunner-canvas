/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["flowcanvaswebpackJsonpPlugin"] = self["flowcanvaswebpackJsonpPlugin"] || []).push([["src_components_html-plugins_visualizers_animated-grid-canvas_tsx"],{

/***/ "./src/components/html-plugins/visualizers/animated-grid-canvas.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"AnimatedGridCanvas\": () => (/* binding */ AnimatedGridCanvas)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./node_modules/react/index.js\");\n/* harmony import */ var react_konva__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./node_modules/react-konva/es/ReactKonva.js\");\n/* harmony import */ var _devhelpr_flowrunner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"./node_modules/@devhelpr/flowrunner/dist/flowrunner.esm.js\");\n/* harmony import */ var _flowrunner_plugins_components_webassembly__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(\"./src/flowrunner-plugins/components/webassembly.ts\");\n/* harmony import */ var _devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(\"./node_modules/@devhelpr/expressionrunner/dist/expressionrunner.esm.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.PI', (a, ...args) => {\r\n    return Math.PI;\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.sqrt', (a, ...args) => {\r\n    return Math.sqrt(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.sin', (a, ...args) => {\r\n    return Math.sin(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('sin', (a, ...args) => {\r\n    return Math.sin(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('hypot', (a, ...args) => {\r\n    return Math.hypot(a, args[0]);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.sindegree', (a, ...args) => {\r\n    return Math.sin((a * Math.PI) / 180);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.random', (a, ...args) => {\r\n    return Math.random();\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.atan', (a, ...args) => {\r\n    return Math.atan(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.floor', (a, ...args) => {\r\n    return Math.floor(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.ceil', (a, ...args) => {\r\n    return Math.ceil(a);\r\n});\r\n(0,_devhelpr_expressionrunner__WEBPACK_IMPORTED_MODULE_4__.registerExpressionFunction)('Math.round', (a, ...args) => {\r\n    return Math.round(a);\r\n});\r\nconst AnimatedGridCanvas = (props) => {\r\n    const [payload, setPayload] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({ data: [] });\r\n    const [performanceTimer, setPerformanceTimer] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);\r\n    const active = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(true);\r\n    const flowIsRunning = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);\r\n    const flowRunner = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(new _devhelpr_flowrunner__WEBPACK_IMPORTED_MODULE_2__.FlowEventRunner());\r\n    let circleRefs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)([]);\r\n    let canvas = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let perftext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let stage = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let textRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let wasmRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let lastTime = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(performance.now());\r\n    let activeScript = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(\"\");\r\n    let scriptId = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);\r\n    let canvasMode = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(\"\");\r\n    let rafHandler = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let currentWidth = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let currentHeight = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);\r\n    let fps = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);\r\n    const runWasm = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((lastPayload, width, height) => {\r\n        if (!wasmRef.current) {\r\n            console.log(\"wasmRef is empty\");\r\n            return;\r\n        }\r\n        let data = wasmRef.current;\r\n        if (!data) {\r\n            return;\r\n        }\r\n        console.log(\"runwasm\", width, height);\r\n        let buffer = null;\r\n        try {\r\n            buffer = new Uint8Array(data.instance.exports.memory.buffer, 0, width * height * 4);\r\n        }\r\n        catch (err) {\r\n            console.log(\"runwasm error\", err);\r\n            return;\r\n        }\r\n        let context;\r\n        let imageData;\r\n        if (canvasMode.current === \"pixels\" && canvas.current) {\r\n            context = canvas.current.getContext('2d');\r\n            imageData = context.createImageData(width, height);\r\n        }\r\n        let currentScriptId = scriptId.current;\r\n        let inputParameters = [];\r\n        (wasmRef.current.inputVariables).map((input) => {\r\n            inputParameters.push(0);\r\n        });\r\n        if (lastPayload) {\r\n            (wasmRef.current.inputVariables).map((input, index) => {\r\n                inputParameters[index] = Number(lastPayload[input]) || 0;\r\n            });\r\n        }\r\n        const wasmSize = (data.wasm.length / 1000).toFixed(2);\r\n        let quitRenderLoop = false;\r\n        if (canvasMode.current === \"circles\") {\r\n            const renderLoop = () => {\r\n                if (!active.current) {\r\n                    return;\r\n                }\r\n                if (currentScriptId != scriptId.current) {\r\n                    console.log(\"quit renderloop\");\r\n                    return;\r\n                }\r\n                if (!quitRenderLoop) {\r\n                    rafHandler.current = requestAnimationFrame(renderLoop);\r\n                }\r\n                let perfStart = performance.now();\r\n                for (let y = 0; y < 16; y++) {\r\n                    for (let x = 0; x < 16; x++) {\r\n                        let time = performance.now() - lastTime.current;\r\n                        const result = data.mainFunction(data.instance, x, y, y * 16 + x, time, width, height, ...inputParameters);\r\n                        let radius = 0;\r\n                        let stroke = \"\";\r\n                        let fill = \"\";\r\n                        let circlewidth = 13;\r\n                        let circleheight = 13;\r\n                        if (result >= 1 || result <= -1) {\r\n                            radius = 13;\r\n                            stroke = result <= -1 ? \"#ff0000\" : \"#000000\";\r\n                            fill = result <= -1 ? \"#ff0000\" : \"#000000\";\r\n                        }\r\n                        else if (result != 0) {\r\n                            radius = 13 * Math.abs(result);\r\n                            stroke = result < 0 ? \"#ff0000\" : \"#000000\";\r\n                            fill = result < 0 ? \"#ff0000\" : \"#000000\";\r\n                            circlewidth = 13 * Math.abs(result);\r\n                            circleheight = 13 * Math.abs(result);\r\n                        }\r\n                        let circle = circleRefs.current[\"circle\" + (y * 16 + x)];\r\n                        if (circle) {\r\n                            circle.radius(radius);\r\n                            circle.stroke(stroke);\r\n                            circle.width(circlewidth);\r\n                            circle.height(circleheight);\r\n                            circle.fill(fill);\r\n                        }\r\n                    }\r\n                }\r\n                const perfEnd = performance.now() - perfStart;\r\n                if (textRef && textRef.current) {\r\n                    textRef.current.text(perfEnd.toFixed(2) + \"ms - \" + wasmSize + \"kb\");\r\n                }\r\n                if (stage && stage.current) {\r\n                    let stageInstance = stage.current.getStage();\r\n                    stageInstance.draw();\r\n                }\r\n            };\r\n            rafHandler.current = requestAnimationFrame(renderLoop);\r\n        }\r\n        else if (canvasMode.current === \"pixels\") {\r\n            let counter = 0;\r\n            fps.current = performance.now();\r\n            const renderLoopPixels = () => {\r\n                if (!active.current) {\r\n                    return;\r\n                }\r\n                if (currentScriptId != scriptId.current) {\r\n                    return;\r\n                }\r\n                if (quitRenderLoop) {\r\n                    return;\r\n                }\r\n                if (!buffer) {\r\n                    return;\r\n                }\r\n                rafHandler.current = requestAnimationFrame(renderLoopPixels);\r\n                let time = performance.now() - lastTime.current;\r\n                const result = data.mainFunction(data.instance, 0, 0, 0, time, width, height, ...inputParameters);\r\n                imageData.data.set(buffer);\r\n                context.putImageData(imageData, 0, 0);\r\n                const perfEnd = performance.now() - fps.current;\r\n                fps.current = performance.now();\r\n                counter++;\r\n                if (counter > 25) {\r\n                    counter = 0;\r\n                    perftext.current.innerText = wasmSize + \"kb - \" + (1000 / perfEnd).toFixed(0) + \"fps\";\r\n                }\r\n            };\r\n            rafHandler.current = requestAnimationFrame(renderLoopPixels);\r\n        }\r\n        return () => {\r\n            console.log(\"quit renderloop\");\r\n            quitRenderLoop = true;\r\n            buffer = undefined;\r\n        };\r\n    }, [props.node, props.node.width, props.node.height]);\r\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\r\n        active.current = true;\r\n        if (props.payloads.length == 0) {\r\n            return;\r\n        }\r\n        canvasMode.current = props.node.mode;\r\n        if (rafHandler.current) {\r\n            cancelAnimationFrame(rafHandler.current);\r\n            rafHandler.current = undefined;\r\n        }\r\n        console.log(\"AnimatedGridCanvas, start useEffect\");\r\n        let currentScript = props.payloads[props.payloads.length - 1].script;\r\n        if (!wasmRef.current ||\r\n            (!currentWidth.current) ||\r\n            (!currentHeight.current) ||\r\n            (currentWidth.current != (props.node.width || 256)) ||\r\n            (currentHeight.current != (props.node.height || 256)) ||\r\n            (currentScript !== undefined && currentScript !== \"\" &&\r\n                currentScript !== activeScript.current)) {\r\n            console.log(\"retrieve fresh webassembly\", props.node.width, props.node.height);\r\n            wasmRef.current = null;\r\n            activeScript.current = currentScript;\r\n            currentWidth.current = props.node.width || 256;\r\n            currentHeight.current = props.node.height || 256;\r\n            (0,_flowrunner_plugins_components_webassembly__WEBPACK_IMPORTED_MODULE_3__.getWebassembly)(currentScript, currentWidth.current, currentHeight.current).then((data) => {\r\n                if (data === false) {\r\n                    return;\r\n                }\r\n                wasmRef.current = data;\r\n                scriptId.current = scriptId.current + 1;\r\n                runWasm(props.payloads[props.payloads.length - 1], currentWidth.current, currentHeight.current);\r\n            });\r\n        }\r\n        else {\r\n            console.log(\"reuse existing webassembly\");\r\n            if (activeScript.current && activeScript.current !== \"\" && wasmRef.current) {\r\n                console.log(\"pre runwasm\");\r\n                runWasm(props.payloads[props.payloads.length - 1], currentWidth.current, currentHeight.current);\r\n            }\r\n        }\r\n        return () => {\r\n            console.log(\"AnimatedGridCanvas, unsubscribe useEffect\");\r\n            if (active) {\r\n                active.current = false;\r\n            }\r\n            if (rafHandler.current) {\r\n                cancelAnimationFrame(rafHandler.current);\r\n                rafHandler.current = undefined;\r\n            }\r\n            if (flowRunner && flowRunner.current && flowIsRunning && flowIsRunning.current) {\r\n                flowRunner.current.destroyFlow();\r\n            }\r\n        };\r\n    }, [props.node, props.payloads, props.node.width, props.node.height]);\r\n    const getWidth = () => {\r\n        return props.node.width || ((props.node.columns || 8) * 16);\r\n    };\r\n    const getHeight = () => {\r\n        return props.node.height || ((props.node.rows || 8) * 16);\r\n    };\r\n    let circles = null;\r\n    let { node } = props;\r\n    if (node.mode === \"circles\") {\r\n        circles = [];\r\n        for (let y = 0; y < 16; y++) {\r\n            for (let x = 0; x < 16; x++) {\r\n                let index = y * 16 + x;\r\n                let radius = 0;\r\n                let stroke = \"\";\r\n                let fill = \"\";\r\n                let width = 13;\r\n                let height = 13;\r\n                let circle = react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_konva__WEBPACK_IMPORTED_MODULE_1__.Circle, { key: \"xycanvasgrid-\" + index, x: (x * 16) + 8, y: (y * 16) + 8, ref: ref => (circleRefs.current[\"circle\" + index] = ref), radius: radius, stroke: stroke, strokeWidth: 2, width: width, height: height, opacity: 1, fill: fill, listening: false, transformsEnabled: \"position\", perfectDrawEnabled: false });\r\n                circles.push(circle);\r\n            }\r\n        }\r\n    }\r\n    else if (node.mode === \"pixels\") {\r\n        return react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { style: {\r\n                position: \"relative\",\r\n                width: node.width ? node.width + \"px\" : \"256px\",\r\n                height: node.height ? node.height + \"px\" : \"256px\",\r\n                alignSelf: \"center\",\r\n                marginTop: \"auto\",\r\n                marginBottom: \"auto\",\r\n                maxWidth: \"100%\"\r\n            } },\r\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", { ref: ref => (perftext.current = ref), style: { position: \"absolute\", top: \"0px\", left: \"0px\", background: \"rgba(0,0,0,0.5)\", color: \"#ffffff\" } }, \"0\"),\r\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"canvas\", { ref: ref => (canvas.current = ref), width: node.width || 256, height: node.height || 256 }));\r\n    }\r\n    node = null;\r\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_konva__WEBPACK_IMPORTED_MODULE_1__.Stage, { pixelRatio: 1, listening: false, ref: ref => (stage.current = ref), width: getWidth() || props.node.width || 250, height: getHeight() || props.node.height || 250 },\r\n        react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_konva__WEBPACK_IMPORTED_MODULE_1__.Layer, { listening: false },\r\n            circles,\r\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_konva__WEBPACK_IMPORTED_MODULE_1__.Rect, { x: 4, y: 4, height: 32, width: 100, opacity: 0.5, fill: \"#000000\" }),\r\n            react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_konva__WEBPACK_IMPORTED_MODULE_1__.Text, { align: \"left\", ref: ref => (textRef.current = ref), fontSize: 18, y: 4, x: 4, height: 32, verticalAlign: \"middle\", fill: \"#ffffff\", text: performanceTimer.toFixed(2) + \"ms\" })));\r\n};\r\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/visualizers/animated-grid-canvas.tsx?");

/***/ })

}]);