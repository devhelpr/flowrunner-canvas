import * as React from 'react';
import { useRef, useEffect, useState,useCallback, useLayoutEffect } from 'react';

import { Stage, Layer , Circle, Text, Rect } from 'react-konva';
import { FlowLoader } from '../../../flowrunner-plugins/components/flow-loader';
import { FlowTask, FlowEventRunner } from '@devhelpr/flowrunner';
import { registerTasks } from '../../../flow-tasks';
import { getWebassembly, IWebassembly } from '../../../flowrunner-plugins/components/webassembly';

import {
	registerExpressionFunction
} from '@devhelpr/expressionrunner';
  
registerExpressionFunction('Math.PI', (a: number, ...args: number[]) => {
	return Math.PI;
});
registerExpressionFunction('Math.sqrt', (a: number, ...args: number[]) => {
	return Math.sqrt(a);
});
registerExpressionFunction('Math.sin', (a: number, ...args: number[]) => {
	return Math.sin(a);
});
registerExpressionFunction('sin', (a: number, ...args: number[]) => {
	return Math.sin(a);
});

registerExpressionFunction('hypot', (a: number, ...args: number[]) => {
	return Math.hypot(a, args[0]);
});

registerExpressionFunction('Math.sindegree', (a: number, ...args: number[]) => {
	return Math.sin((a * Math.PI) / 180);
});
registerExpressionFunction('Math.random', (a: number, ...args: number[]) => {
	return Math.random();
});
registerExpressionFunction('Math.atan', (a: number, ...args: number[]) => {
	return Math.atan(a);
});

// -.4/(hypot(x-((t/1000)%10),y-((t/1000)%8))-((t/1000)%2)*9)

//Math.sin((t/100)-Math.sqrt((x-7.5)^2+(y-6)^2))
//Math.sin(x+0.5*y+0.5*time/100)
//Math.sin((Math.sqrt(((x-7.5)*(x-7.5))+((-7.5+y)*(-7.5+y))))*time/10000)
//Math.sin(time/10000-(Math.sqrt(((x-7.5)*(x-7.5))+((-7.5+y)*(-7.5+y)))))
//Math.sin(x/2) - Math.sin(x-t/1000) - y+6
registerExpressionFunction('Math.floor', (a: number, ...args: number[]) => {
	return Math.floor(a);
});

registerExpressionFunction('Math.ceil', (a: number, ...args: number[]) => {
	return Math.ceil(a);
});

registerExpressionFunction('Math.round', (a: number, ...args: number[]) => {
	return Math.round(a);
});
 

export interface AnimatedGridCanvasProps {
	node : any;
	payloads : any[];
}

/*
	- goal : 

		show raw canvas where each pixel is being calculated by wasm 

		wasm script will be input as text into the animatedgridcanvas

		animatedgridcanvas compiles wasm script
		wasm script will fill a memory buffer which is the canvas pixel buffer
		animatedgridcanvas will draw the pixel buffer

		canvas will be 256 x 256 pixels = 65536 x 4 = 4 pages of wasm memory 

		components

		- new plugin "ScriptTask" : 
			- assign to property (input) 
			- script (textarea)

		- wasm setpixel function : x,y,colorvalue (float)

		- memory buffer

		- ImageData canvas https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
			https://developer.mozilla.org/en-US/docs/Web/API/ImageData
				Uint8ClampedArray
				ctx.putImageData(imageData, dx, dy);

				https://github.com/ColinEberhardt/wasm-interference/blob/master/index.html


				let instance = source.instance;
				let canvasData = new Uint8Array(instance.exports.mem.buffer, 0, 320 * 200 * 4);
				let canvas = document.querySelector('canvas');
				let context = canvas.getContext('2d');
				let imageData = context.createImageData(320, 200);
				let tick = 0.0;
				(function update() {
					requestAnimationFrame(update);
					instance.exports.run(tick);
					imageData.data.set(canvasData);
					context.putImageData(imageData, 0, 0);
					tick+=0.015;
				})();

				memory is exported from wasm ... (memory (export "mem") 4)

*/
export const AnimatedGridCanvas = (props : AnimatedGridCanvasProps) => {
	const [payload , setPayload ] = useState({data: []} as any);
	const [performanceTimer, setPerformanceTimer] = useState(0);
	const active = useRef(true);
	const flowIsRunning = useRef(false);
	const flowRunner = useRef(new FlowEventRunner());
	let circleRefs = useRef([] as any);
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
		let data : IWebassembly = (wasmRef.current as unknown as IWebassembly);
		if (!data) {
			return;
		}
		//console.log("wasm output", (data as IWebassembly).instance.exports);
		console.log("runwasm", width, height);
		let buffer : any = null;
		try {
			buffer = new Uint8Array((data as IWebassembly).instance.exports.memory.buffer, 0, width * height * 4);
		//console.log("buffer", buffer);
		} catch (err) {
			console.log("runwasm error", err);
			return;
		}
		let context;
        let imageData;
		if (canvasMode.current === "pixels" && canvas.current) {
			context = (canvas.current as any).getContext('2d');
			imageData = context.createImageData(width, height);
		}
		let currentScriptId = scriptId.current; 

		let inputParameters : any[] = [];

		// initialization of input Parameters defined in wasm-script-code
		((wasmRef.current as any).inputVariables).map((input: string) => {
			inputParameters.push(0);
		});

		if (lastPayload) {			
			((wasmRef.current as any).inputVariables).map((input: string, index) => {
				inputParameters[index] = Number(lastPayload[input]) || 0;
			});
		}
		//console.log("inputparameters", (wasmRef.current as any).inputVariables, inputParameters);

		// const result = (data as any).mainFunction(payload["x"] || 0,payload["y"] || 0,payload["i"] || 0,payload["t"] || 0);
		const wasmSize = (data.wasm.length/1000).toFixed(2);

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
					(rafHandler.current as any) = requestAnimationFrame(renderLoop);
				}
				let perfStart = performance.now();

				for (let y=0; y < 16 ; y++) {
					for (let x=0; x < 16 ; x++) {
						let time = performance.now() - lastTime.current;
						const result = (data as IWebassembly).mainFunction(
							(data as IWebassembly).instance,x, y, y*16+x , time,
							width, height,
							...inputParameters);
						let radius = 0;
						let stroke = "";
						let fill = "";
						let circlewidth = 13;
						let circleheight = 13;

						if (result >= 1 || result <= -1) {
							radius = 13;			
							stroke = result <= -1 ? "#ff0000" : "#000000";
							fill = result <= -1 ? "#ff0000" : "#000000";
						} else if (result != 0) {
							radius = 13 * Math.abs(result);			
							stroke = result < 0 ? "#ff0000" : "#000000";
							fill = result < 0 ? "#ff0000" : "#000000";
							circlewidth = 13 * Math.abs(result);
							circleheight = 13 * Math.abs(result);
						}

						let circle = circleRefs.current["circle" + (y*16+x)];
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
					(textRef.current as any).text(perfEnd.toFixed(2) +  "ms - " + wasmSize + "kb");
				}

				if (stage && stage.current) {
					let stageInstance = (stage.current as any).getStage();
					stageInstance.draw();//batchDraw();
				}
			}

			(rafHandler.current as any) = requestAnimationFrame(renderLoop);
		} else 
		if (canvasMode.current === "pixels") {
			//console.log("(data as IWebassembly).mainFunction", (data as IWebassembly).mainFunction);
			let counter = 0;
			fps.current = performance.now();
			const renderLoopPixels = () => {
				if (!active.current) {
					return;
				}
				if (currentScriptId != scriptId.current) {
					//console.log("quit renderLoopPixels");
					return;
				}

				if (quitRenderLoop) {
					return;
				}

				if (!buffer) {
					return;
				}

				(rafHandler.current as any) = requestAnimationFrame(renderLoopPixels);
				
				//let perfStart = performance.now();

				let time = performance.now() - lastTime.current;
				const result = (data as IWebassembly).mainFunction(
					(data as IWebassembly).instance,0, 0, 0 , time,
					width, height,
					...inputParameters);

				imageData.data.set(buffer);
				context.putImageData(imageData, 0, 0);

				const perfEnd = performance.now() - fps.current;//perfStart;
				fps.current = performance.now();

				counter++;
				if (counter > 25) {
					counter = 0;
					(perftext.current as any).innerText =  wasmSize + "kb - " + (1000/perfEnd).toFixed(0) + "fps";
				}
				
			}

			(rafHandler.current as any) = requestAnimationFrame(renderLoopPixels);
		}
		return () => {
			console.log("quit renderloop");
			quitRenderLoop = true;
			(buffer as any) = undefined;
		}
	}, [props.node, props.node.width,props.node.height]);

	useEffect(() => {
		active.current = true;
		if (props.payloads.length == 0) {
			return;
		}
		
		canvasMode.current = props.node.mode;		
		if (rafHandler.current as any) {
			cancelAnimationFrame(rafHandler.current as any);
			(rafHandler.current as any) = undefined;
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

			getWebassembly(currentScript,
				currentWidth.current,
				currentHeight.current
			).then((data : any) => {
				if (data === false) {
					return;
				}
				(wasmRef.current as any) = data as IWebassembly | boolean;
				scriptId.current = scriptId.current + 1;
				runWasm(props.payloads[props.payloads.length - 1],
					currentWidth.current,
					currentHeight.current
				);
			});
		} else {
			console.log("reuse existing webassembly");
			if (activeScript.current && activeScript.current !== "" && wasmRef.current) {
				console.log("pre runwasm");
				runWasm(props.payloads[props.payloads.length - 1],
					currentWidth.current,
					currentHeight.current
				);
			}
			/*const loader = new FlowLoader();
			loader.getFlow(props.node.flowId, true)
				.then(flow => {
						let services = {
							flowEventRunner: flowRunner.current,
							pluginClasses: {},
							logMessage: (arg1, arg2) => {
								//console.log(arg1, arg2);
							},
							registerModel: (modelName: string, definition: any) => {},
						};
						registerTasks(flowRunner.current);

						console.log("AnimatedGridCanvas, before flowrunner.start");

						flowRunner.current.start({flow: flow}, services, true, false).then(() => {
							flowIsRunning.current = true;
							let isInitNeeded = true;
							const renderLoop = function() {
								if (!active.current) return
								
								let perfStart = performance.now();
								flowRunner.current.executeNode("start", {}).then((data) => {
									
									if (!active.current) return
									const perfEnd = performance.now() - perfStart;
									
									requestAnimationFrame(renderLoop);
									
									//setPerformanceTimer(perfEnd);

									if (textRef && textRef.current) {
										(textRef.current as any).text(perfEnd.toFixed(2) + "ms");
									}
									if (isInitNeeded) {
										isInitNeeded = false;
										setPayload(data);
									}

									let list = (data as any).data;
									list.map((payload, index) => {
										let radius = 0;
										let stroke = "";
										let fill = "";
										let width = 13;
										let height = 13;

										if (payload >= 1 || payload <= -1) {
											radius = 13;			
											stroke = payload <= -1 ? "#ff0000" : "#000000";
											fill = payload <= -1 ? "#ff0000" : "#000000";
										} else if (payload != 0) {
											radius = 13 * Math.abs(payload);			
											stroke = payload < 0 ? "#ff0000" : "#000000";
											fill = payload < 0 ? "#ff0000" : "#000000";
											width = 13 * Math.abs(payload);
											height = 13 * Math.abs(payload);
										}
										let circle = circleRefs.current["circle" + index];
										if (circle) {
											circle.radius(radius);
											circle.stroke(stroke);
											circle.width(width);
											circle.height(height);
											circle.fill(fill);										
										}

									});

									if (stage && stage.current) {
										let stageInstance = (stage.current as any).getStage();
										stageInstance.batchDraw();
									}

								}).catch((err) => {
									console.log("error after executeNode in renderLoop AnimatedGridCanvas", err);
								});
							}

							requestAnimationFrame(renderLoop);
						});					
					});
				*/
		}

		return () => {
			console.log("AnimatedGridCanvas, unsubscribe useEffect");
			if (active) {
				active.current = false;
			}
			
			if (rafHandler.current as any) {
				cancelAnimationFrame(rafHandler.current as any);
				(rafHandler.current as any) = undefined;
			}

			//(wasmRef.current as any) = undefined;
			if (flowRunner && flowRunner.current && flowIsRunning && flowIsRunning.current) {
				flowRunner.current.destroyFlow();    	
			}
		}
	}, [props.node, props.payloads, props.node.width, props.node.height]); // props.node, props.payloads

	const getWidth = () => {
		return props.node.width || ((props.node.columns || 8) * 16);
	}

	const getHeight = () => {
		return props.node.height || ((props.node.rows || 8) * 16);
	}

	let circles : any = null;
	let {node} = props;

	if (node.mode === "circles") {
		circles = [];
		for (let y=0;y<16;y++) {
			for (let x=0;x<16;x++) {
				let index = y*16 + x;
				let radius = 0;
				let stroke = "";
				let fill = "";
				let width = 13;
				let height = 13;				
				
				let circle = <Circle 
					key={"xycanvasgrid-" + index}
					x={(x * 16)+8}
					y={(y * 16)+8}
					ref={ref => (circleRefs.current["circle" + index] = ref)}
					radius={radius}
					stroke={stroke}
					strokeWidth={2}
					width={width}
					height={height}
					opacity={1}
					fill={fill}
					listening={false}
					transformsEnabled={"position"} 
					perfectDrawEnabled={false}>
				</Circle>;
				circles.push(circle);
			}
		}
	} else if (node.mode === "pixels") {
		//return 
		
		return <div style={{
					position:"relative",
					width:node.width ? node.width + "px" : "256px",
					height:node.height ? node.height + "px" : "256px",
					alignSelf: "center",
					marginTop: "auto",
					marginBottom: "auto",
					maxWidth: "100%"
				}}>
					<div ref={ref => ((perftext as any).current = ref)}
				style={{position:"absolute",top:"0px",left:"0px",background:"rgba(0,0,0,0.5)",color:"#ffffff"}}>0</div>
					<canvas
						ref={ref => ((canvas as any).current = ref)}
						width={node.width || 256}
						height={node.height || 256}>
					</canvas>
		</div>;
		
	}
	
	
	/* else {
		let list = payload.data;
		
		let currentPayload = payload;
		circles = list.map((payload, index) => {
			//let circle : any = null;
				
			let x = index % (currentPayload.columns);
			let y = Math.floor(index / currentPayload.rows);

			let radius = 0;
			let stroke = "";
			let fill = "";
			let width = 13;
			let height = 13;

			if (payload >= 1 || payload <= -1) {
				radius = 13;			
				stroke = payload <= -1 ? "#ff0000" : "#000000";
				fill = payload <= -1 ? "#ff0000" : "#000000";
			} else if (payload != 0) {
				radius = 13 * Math.abs(payload);			
				stroke = payload < 0 ? "#ff0000" : "#000000";
				fill = payload < 0 ? "#ff0000" : "#000000";
				width = 13 * Math.abs(payload);
				height = 13 * Math.abs(payload);			
			}
			
			return <Circle 
				key={"xycanvasgrid-" + index}
				x={(x * 16)+8}
				y={(y * 16)+8}
				ref={ref => (circleRefs.current["circle" + index] = ref)}
				radius={radius}
				stroke={stroke}
				strokeWidth={2}
				width={width}
				height={height}
				opacity={1}
				fill={fill}
				listening={false}
				transformsEnabled={"position"} 
				perfectDrawEnabled={false}>
			</Circle>;
		});
		list = null;
		currentPayload = null;
	}*/
	
	node = null;
	
	return <Stage
			pixelRatio={1} 
			listening={false}
			ref={ref => ((stage as any).current = ref)}
			width={getWidth() || props.node.width || 250}
			height={getHeight() || props.node.height || 250}>		
		<Layer listening={false}>
		{circles}
		
		<Rect x={4} y={4} height={32} width={100} opacity={0.5} fill="#000000" ></Rect>
		<Text align="left"
			ref={ref => ((textRef as any).current = ref)}
			fontSize={18}
			y={4}
			x={4}
			height={32}
			verticalAlign="middle"
			fill="#ffffff"
			text={performanceTimer.toFixed(2) + "ms"}></Text>
			
		</Layer>
	</Stage>;
}