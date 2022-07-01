import React, { createContext, ReactNode, useContext, useRef } from 'react'

export interface IFormNodeDatasourceContext {
	datasources : Map<string, string>;
}

export const FormNodeDatasourceContext = createContext<IFormNodeDatasourceContext>({
	datasources : new Map<string, string>()
});

export const useFormNodeDatasourceContext = () => {
	const context = useContext(FormNodeDatasourceContext);
	const clear = () => {
		context.datasources.clear();
	}

	const setDatasource = (nodeName: string, datasource: any) => {
		context.datasources.set(nodeName, datasource);
	}

	const getDatasource = (nodeName: string) => {
		return context.datasources.get(nodeName);
	}

	return {
		clear,
		setDatasource,
		getDatasource,
		context
	}
}

export interface IFormNodeDatasourcenPropsProvider {
	children : ReactNode;
}

export const FormNodeDatasourceProvider = (props : IFormNodeDatasourcenPropsProvider) => {
	const datasourceRef = useRef<IFormNodeDatasourceContext>({
		datasources : new Map<string, string>()
	});
	return <FormNodeDatasourceContext.Provider value={{...datasourceRef.current}}>{props.children}</FormNodeDatasourceContext.Provider>;
}
