import { jsx as _jsx } from "react/jsx-runtime";
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from './item';
export function SortableItem(props) {
    const animateLayoutChanges = (args) => args.isSorting || args.wasSorting
        ? defaultAnimateLayoutChanges(args)
        : true;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
    const style = {
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? "100" : "auto",
        opacity: isDragging ? 0 : 1
    };
    return (_jsx(Item, { ref: setNodeRef, style: style, ...attributes, listeners: { ...listeners }, id: props.id, node: props.node, isObjectListNodeEditing: props.isObjectListNodeEditing, onSetValue: props.onSetValue, datasources: props.datasources, viewMode: props.viewMode, payload: props.payload, listItem: props.listItem, index: props.index, isInFlowEditor: props.isInFlowEditor, editIndex: props.editIndex, onEditItem: props.onEditItem, metaInfo: props.metaInfo, deleteClick: props.deleteClick, onEditNodeKeyValue: props.onEditNodeKeyValue, isBeingSorted: props.isBeingSorted }));
}
//# sourceMappingURL=sortable-context.js.map