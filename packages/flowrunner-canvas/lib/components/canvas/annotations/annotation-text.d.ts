import * as React from 'react';
export interface IAnnotationTextProps {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    node: any;
    onClick: any;
    onTouchStart: any;
    onMouseStart: any;
    onMouseMove: any;
    onMouseEnd: any;
    onMouseLeave: any;
    onMouseOver: any;
    onMouseOut: any;
    onDragStart: any;
    onDragMove: any;
    onDragEnd: any;
}
export declare const AnnotationText: React.ForwardRefExoticComponent<IAnnotationTextProps & React.RefAttributes<unknown>>;
