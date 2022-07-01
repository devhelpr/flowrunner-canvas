import React from 'react';
import { ReactNode } from 'react';
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
export declare const PositionContext: React.Context<IPositionContext>;
export declare const usePositionContext: () => {
    clearPositions: () => void;
    getPositions: () => Map<string, IPosition>;
    setPosition: (nodeName: string, position: any) => void;
    getPosition: (nodeName: string) => IPosition | undefined;
    setCommittedPosition: (nodeName: string, position: any) => void;
    getCommittedPosition: (nodeName: string) => IPosition | undefined;
    setWidthHeight: (nodeName: string, width: number, height: number) => void;
    context: IPositionContext;
};
export interface IPositionPropsProvider {
    isBridged?: boolean;
    positionContext?: IPositionContext;
    children: ReactNode;
}
export declare const PositionProvider: (props: IPositionPropsProvider) => JSX.Element;
