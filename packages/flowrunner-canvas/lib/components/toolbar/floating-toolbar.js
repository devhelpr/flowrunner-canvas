import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const FloatingToolbar = (props) => {
    const canvasMode = props.useCanvasModeStateStore();
    const onPointerClick = () => {
        canvasMode.setConnectiongNodeCanvasMode(false);
    };
    const onConnectClick = () => {
        canvasMode.setConnectiongNodeCanvasMode(true);
    };
    return (_jsxs("div", { className: "floating-toolbar", children: [_jsx("a", { href: "#", title: "Pointer", onClick: onPointerClick, className: "fas fa-mouse-pointer tw-mr-[4px]" }), _jsxs("a", { href: "#", title: "Connect nodes", onClick: onConnectClick, className: `tw-mr-[8px] tw-relative ${canvasMode.isConnectingNodes ? "tw-text-blue-500" : ""}`, children: [_jsx("span", { className: 'far fa-square tw-text-[7px] tw-absolute tw-top-[-7px] tw-left-[-7px]' }), _jsx("span", { className: 'far fa-square tw-text-[7px] tw-top-[5px] tw-left-[5px] tw-absolute' }), _jsx("span", { className: 'fas fa-arrow-up tw-text-[7px] tw-top-[-2px] tw-left-[-2px] tw-absolute tw-rotate-[135deg]' })] })] }));
};
//# sourceMappingURL=floating-toolbar.js.map