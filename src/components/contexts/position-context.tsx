import React from 'react'

import {
	createContext,
	useContext,
	ReactNode,
	useRef
} from 'react';

export interface IPosition {
	x?: number;
	y?: number;
	xstart?: number;
	ystart?: number;
	xend?: number;
	yend?: number;
}

export interface IPositionContext {
	positions : Map<string, IPosition>,
	orgPositions : Map<string, IPosition>	
}

export const PositionContext = createContext<IPositionContext>({
	positions : new Map<string, IPosition>(),
	orgPositions : new Map<string, IPosition>()
});

export const usePositionContext = () => {
	const positionContext = useContext(PositionContext);
	
	const clearPositions = () => {
		positionContext.positions = new Map();
	};
	  
	const getPositions = () => {
		return positionContext.positions;
	};
	  
	const setPosition = (nodeName: string, position: any) => {
		//positions[nodeName] = position;
		positionContext.positions.set(nodeName, position);
	  };
	  
	const getPosition = (nodeName: string) => {
		//return positions[nodeName];
		return positionContext.positions.get(nodeName);
	  };
	  
	const setCommittedPosition = (nodeName: string, position: any) => {
		//positions[nodeName] = position;
		positionContext.orgPositions.set(nodeName, position);
	};
	
	const getCommittedPosition = (nodeName: string) => {
		//return positions[nodeName];
		return positionContext.orgPositions.get(nodeName);
	};
	
	return {
		clearPositions, getPositions,
		setPosition,
		getPosition,
		setCommittedPosition,
		getCommittedPosition 
	};
}

export interface IPositionPropsProvider {
	children : ReactNode;
}

export const PositionProvider = (props : IPositionPropsProvider) => {
	const positionRef = useRef({
		positions : new Map<string, IPosition>(),
		orgPositions : new Map<string, IPosition>()
	});
	return <PositionContext.Provider value={positionRef.current}>{props.children}</PositionContext.Provider>;
}
