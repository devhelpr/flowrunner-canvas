import * as React from 'react';
import { useRef, useEffect, useState, useLayoutEffect } from 'react';

import { Stage, Layer , Circle, Text, Rect } from 'react-konva';
import { FlowLoader } from '../../../flowrunner-plugins/components/flow-loader';
import { FlowTask, FlowEventRunner } from '@devhelpr/flowrunner';
import { registerTasks } from '../../../flow-tasks';

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


export const AnimatedGridCanvas = (props : AnimatedGridCanvasProps) => {
	const [payload , setPayload ] = useState({data: []} as any);
	const [performanceTimer, setPerformanceTimer] = useState(0);
	const active = useRef(true);
	const flowIsRunning = useRef(false);
	const flowRunner = useRef(new FlowEventRunner());
	useEffect(() => {
		active.current = true;
		console.log("AnimatedGridCanvas, start useEffect");
		const loader = new FlowLoader();
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
						const renderLoop = function() {
							if (!active.current) return
							
							let perfStart = performance.now();
							flowRunner.current.executeNode("start", {}).then((data) => {
								
								if (!active.current) return

								requestAnimationFrame(renderLoop);
								const perfEnd = performance.now() - perfStart;
								setPerformanceTimer(perfEnd);
								setPayload(data);
							}).catch((err) => {
								console.log("error after executeNode in renderLoop AnimatedGridCanvas", err);
							});
						}

						requestAnimationFrame(renderLoop);
					});					
				});

		return () => {
			console.log("AnimatedGridCanvas, unsubscribe useEffect");
			if (active) {
				active.current = false;
			}
			if (flowRunner && flowRunner.current && flowIsRunning && flowIsRunning.current) {
				flowRunner.current.destroyFlow();    	
			}
		}
	}, [props.node, props.payloads]); // props.node, props.payloads

	const getWidth = () => {
		return ((props.node.columns || 8) * 16);
	}

	const getHeight = () => {
		return ((props.node.rows || 8) * 16);
	}

	let circles : any = null;
	let {node} = props;

	let list = payload.data;

	let currentPayload = payload;
	circles = list.map((payload, index) => {
		let circle : any = null;
			
		let x = index % (currentPayload.columns);
		let y = Math.floor(index / currentPayload.rows);

		if (payload >= 1 || payload <= -1) {
			circle = <Circle 
					key={"xycanvasgrid-" + index}
					x={(x * 16)+8}
					y={(y * 16)+8}
					radius={13}
					stroke={payload <= -1 ? "#ff0000" : "#000000"}
					strokeWidth={2}
					width={13}
					height={13}
					opacity={1}
					fill={payload <= -1 ? "#ff0000" : "#000000"} 
					perfectDrawEnabled={false}>
				</Circle>
		} else if (payload != 0) {
			circle = <Circle 
			key={"xycanvasgrid-" + index}
			x={(x * 16)+8}
			y={(y * 16)+8}
			radius={13 * Math.abs(payload)}
			stroke={payload < 0 ? "#ff0000" : "#000000"}
			strokeWidth={2}
			width={13 * Math.abs(payload)}
			height={13 * Math.abs(payload)}
			opacity={1}
			fill={payload < 0 ? "#ff0000" : "#000000"} 
			perfectDrawEnabled={false}>
		</Circle>
		}
		
		return circle;
	});
	list = null;
	currentPayload = null;
	node = null;
	
	return <Stage
			pixelRatio={1} 
			width={getWidth() || props.node.width || 250}
			height={getHeight() || props.node.height || 250}>		
		<Layer>
		{circles}
		{performanceTimer > 0 && <>
			<Rect x={4} y={4} height={32} width={100} opacity={0.5} fill="#000000" ></Rect>
			<Text align="left"
				fontSize={18}
				y={4}
				x={4}
				height={32}
				verticalAlign="middle"
				fill="#ffffff"
				text={performanceTimer.toFixed(2) + "ms"}></Text>
			</>
		}
		</Layer>
	</Stage>;
}