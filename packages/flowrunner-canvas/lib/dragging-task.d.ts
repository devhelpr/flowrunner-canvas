import React from 'react';
export interface DragginTaskProps {
    id?: string | undefined;
    style: any;
    children: React.ReactNode;
    listeners: any;
}
export declare const DragginTask: React.ForwardRefExoticComponent<DragginTaskProps & React.RefAttributes<unknown>>;
