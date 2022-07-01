import * as React from 'react';
export interface IAnnotationSectionProps {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
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
export declare const AnnotationSection: React.ForwardRefExoticComponent<IAnnotationSectionProps & React.RefAttributes<unknown>>;
