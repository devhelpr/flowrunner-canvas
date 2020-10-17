import * as React from 'react';
import { useEffect } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

export interface IFlowProps {
	flow : any[];
	flowrunnerConnector: IFlowrunnerConnector;
}

export const Flow = (props : IFlowProps) => {
	
	useEffect(() => {
		props.flowrunnerConnector.pushFlowToFlowrunner(props.flow);	
	}, [props.flow]);

	return <></>;
}