import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const DragginTask = forwardRef((props, ref) => {
    return _jsx("div", { ...props, ref: ref, className: "taskbar__task", children: _jsx("div", { className: "taskbar__taskname", children: props.id }) });
});
//# sourceMappingURL=dragging-task.js.map