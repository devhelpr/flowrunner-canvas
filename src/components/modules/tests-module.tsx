import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { Button } from 'react-bootstrap';

import { PopupEnum, useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useModulesStateStore } from '../../state/modules-menu-state';
import { useFlowStore} from '../../state/flow-state';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { getFlowAgent } from '../../flow-agent';
import { IFlowAgent } from '../../interfaces/IFlowAgent';

export interface ModulesPopupProps {
	flowrunnerConnector : IFlowrunnerConnector;
}

export const TestsModule = (props: ModulesPopupProps) => {
	const [results, setResults] = useState([]);
	const [error, setError] = useState("");	
	const modulesMenu = useModulesStateStore();
	const canvasMode = useCanvasModeStateStore();
	const flow = useFlowStore();
	const workerRef = useRef(null);

	// TODO : setup modules folder and components so that TestRunner has its own file and other modules as well

	useEffect(() => {
		(workerRef.current as any) = getFlowAgent();
		(workerRef.current as any).postMessage("worker", {
			command: 'init'
		});
		(workerRef.current as any).addEventListener("external", onMessage);

		return () => {
			if (workerRef.current) {
				//(workerRef.current as any).removeEventListener("message");
				(workerRef.current as any).terminate();
				(workerRef.current as any) = null;
			}
		}
	}, []);

	const onMessage = useCallback((message, worker : IFlowAgent) => {
		console.log("Modules onMessage", message);
		/*
			message.
				data:
					command: "TestRunnerResults"
					result : [] with objects of type
						name: "basic"
						result: {result: true}

		*/
		if (message && message.data && message.data.command == "TestRunnerResults") {
			if (!!message.data.notFound) {
				setError("No tests defined");
				setResults([]);
			} else 
			if (!!message.data.error) {
				setError("Error while executing tests");
				setResults([]);
			} else {
				setResults(message.data.results || []);
				setError("");
			}
		}
	}, [flow.flowId, flow.flow]);

	useEffect(() => {
		setResults([]);
		setError("");
		(workerRef.current as any).postMessage("worker", {
			command: 'pushFlowToFlowrunner',
			flow: flow.flow,
			flowId: flow.flowId,
			pluginRegistry: [], // TODO ... use flowConnector and handle this
			autoStartNodes: true,
		  });
	}, [flow.flowId, flow.flow]);

	const runTests = useCallback((event) => {
		event.preventDefault();
		//props.flowrunnerConnector.runTests(flow.flowId);
		if (workerRef.current as any) {
			(workerRef.current as any).postMessage("worker", {
				command: 'runTests',
				flowId: flow.flowId
			});
		}
		return false;
	}, [flow.flowId]);

	return <>
		<Button variant="primary" onClick={runTests}>Run tests</Button>
		<br /><br />
		{error !== "" ? error : 
			(results as any[]).map((result, index : number) => {
				return <div key={index}>
					<label>{result.name}{result.result.result ? " : OK!" : " failed..."}</label>
				</div>;
			})
		}			
	</>;
}
