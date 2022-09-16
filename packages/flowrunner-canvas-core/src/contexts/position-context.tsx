import React from 'react';

import { createContext, useContext, ReactNode, useRef } from 'react';

export interface IPosition {
  x?: number;
  y?: number;
  xstart?: number;
  ystart?: number;
  xend?: number;
  yend?: number;
  width?: number;
  height?: number;
}

export interface IPositionContext {
  positions: Map<string, IPosition>;
  orgPositions: Map<string, IPosition>;
}

export const PositionContext = createContext<IPositionContext>({
  positions: new Map<string, IPosition>(),
  orgPositions: new Map<string, IPosition>(),
});

export interface IPositionContextUtils {
  clearPositions: () => void;
  getPositions: () => Map<string, IPosition>;
  setPosition: (nodeName: string, position: any) => void;
  getPosition: (nodeName: string) => IPosition | undefined;
  setCommittedPosition: (nodeName: string, position: any) => void;
  getCommittedPosition: (nodeName: string) => IPosition | undefined;
  setWidthHeight: (nodeName: string, width: number, height: number) => void;
  context: IPositionContext;
}

export const usePositionContext = (): IPositionContextUtils => {
  const internalPositionContext = useContext(PositionContext);

  const clearPositions = () => {
    console.log('clearPositions');
    internalPositionContext.positions.clear();
    internalPositionContext.orgPositions.clear();
  };

  const getPositions = () => {
    return internalPositionContext.positions;
  };

  const setPosition = (nodeName: string, position: any) => {
    /*
		if (!position.width || !position.height) {
			const currentPosition = getPosition(nodeName);
			if (currentPosition) {
				position.width = currentPosition.width;
				position.height = currentPosition.height;
			}
		}*/
    internalPositionContext.positions.set(nodeName, position);
  };

  const getPosition = (nodeName: string) => {
    return internalPositionContext.positions.get(nodeName);
  };

  const setWidthHeight = (nodeName: string, width: number, height: number) => {
    const position = getPosition(nodeName);
    if (position) {
      position.width = width;
      position.height = height;
      internalPositionContext.positions.set(nodeName, position);
    }
  };

  const setCommittedPosition = (nodeName: string, position: any) => {
    internalPositionContext.orgPositions.set(nodeName, position);
  };

  const getCommittedPosition = (nodeName: string) => {
    return internalPositionContext.orgPositions.get(nodeName);
  };

  return {
    clearPositions,
    getPositions,
    setPosition,
    getPosition,
    setCommittedPosition,
    getCommittedPosition,
    setWidthHeight,
    context: internalPositionContext,
  };
};

export interface IPositionPropsProvider {
  isBridged?: boolean;
  positionContext?: IPositionContext;
  children: ReactNode;
}

export const PositionProvider = (props: IPositionPropsProvider) => {
  const positionRef = useRef<IPositionContext>(
    !!props.isBridged && props.positionContext
      ? props.positionContext
      : {
          positions: new Map<string, IPosition>(),
          orgPositions: new Map<string, IPosition>(),
        },
  );
  console.log('PositionProvider');
  return <PositionContext.Provider value={{ ...positionRef.current }}>{props.children}</PositionContext.Provider>;
};
