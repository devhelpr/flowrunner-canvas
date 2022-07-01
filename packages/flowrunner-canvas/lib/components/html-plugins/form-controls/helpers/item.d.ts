import React from 'react';
export interface ItemProps {
    id?: string;
    style: any;
    children: React.ReactNode;
    listeners: any;
    node: any;
    isObjectListNodeEditing: boolean;
    onSetValue: any;
    datasources: any;
    viewMode: string;
    payload: any;
    listItem: any;
    index: number;
    editIndex: number;
    onEditItem: any;
    metaInfo: any;
    deleteClick: any;
    onEditNodeKeyValue: any;
    isInFlowEditor: boolean;
    isBeingSorted: boolean;
}
export declare const Item: React.ForwardRefExoticComponent<ItemProps & React.RefAttributes<unknown>>;
