import React from 'react';
import { useState , useRef, useEffect } from 'react';
import { IFlowrunnerConnector } from '../../../interfaces/FlowrunnerConnector';
import { FlowConnector } from '../../../flow-connector';
import { MultiFormView } from '../../userinterface-view/multi-form-view';
import { getFlowAgent } from '../../../flow-agent';

export interface IMultiForm {
	node : any;
	settings : any;
	flowrunnerConnector : IFlowrunnerConnector;
	renderHtmlNode: any;
	getNodeInstance: any;
}

export const MultiForm = (props: IMultiForm) => {
	const [formStep , setFormStep] = useState(0);
	const [flowEnabled, setFlowEnabled] = useState(false);
	const workerRef = useRef(null);
	const flowrunnerConnector = useRef(null);
	useEffect(() => {

		// WARNING ... this causes duplicate Worker bundles and conflicts..
		// TODO : refactor to use a module which loads the worker. This module should also be 
		//    used elsewhere

		(workerRef.current as any) = getFlowAgent();
		(workerRef.current as any).postMessage("worker", {
			command: 'init'
		});

		(flowrunnerConnector.current as any) = new FlowConnector();	
		(flowrunnerConnector.current as any).registerWorker(workerRef.current);
		//(flowrunnerConnector.current as any).registerDestroyAndRecreateWorker(onDestroyAndRecreateWorker);
		setFlowEnabled(true);
		return () => {
			if (workerRef.current) {
				(workerRef.current as any).terminate();
				(workerRef.current as any) = null;
			}
		}
		
	}, [props.node, formStep]);

	const onNextStep = (event) => {
		event.preventDefault();
		if (formStep < props.node?.formFlows?.length - 1) {
			setFlowEnabled(false);
			setFormStep(formStep + 1);
		}
		return false;
	}

	const onPreviousStep = (event) => {
		event.preventDefault();
		if (formStep > 0) {
			setFlowEnabled(false);
			setFormStep(formStep - 1);
		}
		return false;
	}
	
	return <>
		<p>MultiForm form-step: {formStep + 1} / {props.node?.formFlows?.length}</p>
		<div>
			{flowEnabled && props.node && props.node.formFlows && props.node.formFlows.length > 0 && 
				<div className="card">
					<div className="card-body">
						<MultiFormView 
							renderHtmlNode={props.renderHtmlNode}
							getNodeInstance={props.getNodeInstance}
							flowrunnerConnector={(flowrunnerConnector.current as unknown) as IFlowrunnerConnector}
							flowId={(props.node.formFlows[formStep] as any).flowId}></MultiFormView>
					</div>
				</div>
			}				
		</div>
		<div className="row mt-2">			
			{formStep > 0 &&
				<div className="col-auto">
					<button className="btn btn-outline-primary" onClick={onPreviousStep}>Previous</button>
				</div>		
			}
			{formStep < props.node?.formFlows?.length - 1 &&
				<div className="col-auto">
					<button className="btn btn-primary" onClick={onNextStep}>Next</button>
				</div>
			}
		</div>
	</>;
}