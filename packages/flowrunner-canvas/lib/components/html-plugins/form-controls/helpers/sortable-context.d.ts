export interface SortableItemProps {
    id: string;
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
export declare function SortableItem(props: SortableItemProps): JSX.Element;
