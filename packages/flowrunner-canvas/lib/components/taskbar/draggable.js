import { jsx as _jsx } from "react/jsx-runtime";
import { useDraggable } from '@dnd-kit/core';
export const Draggable = (props) => {
    const { isDragging, attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
    });
    return (_jsx("button", { ref: setNodeRef, className: "taskbar-draggable", ...listeners, ...attributes, children: props.children }));
};
//# sourceMappingURL=draggable.js.map