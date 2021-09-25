import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { IFlowrunnerConnector, IExecutionEvent } from '../../interfaces/IFlowrunnerConnector';
import { useFlowStore} from '../../state/flow-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

export interface DebugInfoProps {
	flowrunnerConnector : IFlowrunnerConnector;
}

export interface DebugInfoState {
	payload : any;
	fullscreen: boolean;
}



//class ContainedDebugInfo extends React.Component<DebugInfoProps, DebugInfoState> {
export const DebugInfo = (props : DebugInfoProps) => {
	const htmlElement = useRef(null);
	const timer = useRef(null as any);
	const [payload, setPayload] = useState(undefined);
	const [fullscreen, setFullscreen] = useState(false);
	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();

	useEffect(() => {
		props.flowrunnerConnector.registerFlowExecutionObserver("ContainedDebugInfo" , (executionEvent : IExecutionEvent) => {

			if (timer.current) {
				clearTimeout(timer.current);
			}

			timer.current = setTimeout(() => {
				if (executionEvent) {
					setPayload(executionEvent.payload);
				}

			}, 50);
		});
		return () => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
			
			props.flowrunnerConnector.unregisterFlowExecuteObserver("ContainedDebugInfo");
		}
	}, []);

	const onToggleFullscreen = () => {
		setFullscreen(!fullscreen);
	}

	if (canvasMode.flowType !== "playground") {
		return <></>;
	}
	
	let fullscreenCss = "";
	let iconCss = "debug-info__window-maximize far fa-window-maximize";
	if (fullscreen) {
		fullscreenCss = " debug-info--fullscreen";
		iconCss = "debug-info__window-maximize far fa-window-minimize";
	}
console.log("DEBUGINFO selectedNode", selectedNode?.node ?? "");
	if (selectedNode && selectedNode.node && selectedNode.node.name) {
		
		if (selectedNode.node.payload) {
			const debugInfo = JSON.stringify(selectedNode.node.payload, null, 2);
			return <div className={"debug-info" + fullscreenCss}>
				<div className="debug-info__debug-info">
					<a href="#" onClick={onToggleFullscreen} className={iconCss}></a> 
					<div className="debug-info__debug-info-content">
						<strong>{selectedNode.node.name}</strong><br />
						{debugInfo}
					</div>
				</div>
			</div>
		} else {
			let list = props.flowrunnerConnector.getNodeExecutionsByNodeName(selectedNode.node.name);

			if (list && list.length > 0) {
				const debugInfo = JSON.stringify(list[list.length - 1], null, 2);
				return <div className={"debug-info" + fullscreenCss}>
					<div className="debug-info__debug-info">
						<a href="#" onClick={onToggleFullscreen} className={iconCss}></a> 
						<div className="debug-info__debug-info-content">
							<strong>{selectedNode.node.name}</strong><br />
							{debugInfo}
						</div>
					</div>
				</div>
			}
		}
	}

	return null;

}
