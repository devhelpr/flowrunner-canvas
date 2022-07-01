import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useRef } from 'react';
export const FormNodeDatasourceContext = createContext({
    datasources: new Map()
});
export const useFormNodeDatasourceContext = () => {
    const context = useContext(FormNodeDatasourceContext);
    const clear = () => {
        context.datasources.clear();
    };
    const setDatasource = (nodeName, datasource) => {
        context.datasources.set(nodeName, datasource);
    };
    const getDatasource = (nodeName) => {
        return context.datasources.get(nodeName);
    };
    return {
        clear,
        setDatasource,
        getDatasource,
        context
    };
};
export const FormNodeDatasourceProvider = (props) => {
    const datasourceRef = useRef({
        datasources: new Map()
    });
    return _jsx(FormNodeDatasourceContext.Provider, { value: { ...datasourceRef.current }, children: props.children });
};
//# sourceMappingURL=form-node-datasource-context.js.map