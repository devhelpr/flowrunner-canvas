import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useRef } from 'react';
export const PositionContext = createContext({
    positions: new Map(),
    orgPositions: new Map()
});
export const usePositionContext = () => {
    const internalPositionContext = useContext(PositionContext);
    const clearPositions = () => {
        console.log("clearPositions");
        internalPositionContext.positions.clear();
        internalPositionContext.orgPositions.clear();
    };
    const getPositions = () => {
        return internalPositionContext.positions;
    };
    const setPosition = (nodeName, position) => {
        internalPositionContext.positions.set(nodeName, position);
    };
    const getPosition = (nodeName) => {
        return internalPositionContext.positions.get(nodeName);
    };
    const setWidthHeight = (nodeName, width, height) => {
        const position = getPosition(nodeName);
        if (position) {
            position.width = width;
            position.height = height;
            internalPositionContext.positions.set(nodeName, position);
        }
    };
    const setCommittedPosition = (nodeName, position) => {
        internalPositionContext.orgPositions.set(nodeName, position);
    };
    const getCommittedPosition = (nodeName) => {
        return internalPositionContext.orgPositions.get(nodeName);
    };
    return {
        clearPositions, getPositions,
        setPosition,
        getPosition,
        setCommittedPosition,
        getCommittedPosition,
        setWidthHeight,
        context: internalPositionContext
    };
};
export const PositionProvider = (props) => {
    const positionRef = useRef(!!props.isBridged && props.positionContext ? props.positionContext : {
        positions: new Map(),
        orgPositions: new Map()
    });
    console.log("PositionProvider");
    return _jsx(PositionContext.Provider, { value: { ...positionRef.current }, children: props.children });
};
//# sourceMappingURL=position-context.js.map