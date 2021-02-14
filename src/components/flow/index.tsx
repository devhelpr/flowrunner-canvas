import * as React from 'react';
import { useEffect } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface IFlowProps {
	flow : any[];
	flowrunnerConnector: IFlowrunnerConnector;
}

export const Flow = (props : IFlowProps) => {
	
	useEffect(() => {
		console.log("FLOW in flow component useEffect", props.flow);
		props.flowrunnerConnector.pushFlowToFlowrunner(props.flow, true);	
	}, [props.flow]);

	return <></>;
}