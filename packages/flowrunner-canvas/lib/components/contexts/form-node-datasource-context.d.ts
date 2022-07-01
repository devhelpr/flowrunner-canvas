import React, { ReactNode } from 'react';
export interface IFormNodeDatasourceContext {
    datasources: Map<string, string>;
}
export declare const FormNodeDatasourceContext: React.Context<IFormNodeDatasourceContext>;
export declare const useFormNodeDatasourceContext: () => {
    clear: () => void;
    setDatasource: (nodeName: string, datasource: any) => void;
    getDatasource: (nodeName: string) => string | undefined;
    context: IFormNodeDatasourceContext;
};
export interface IFormNodeDatasourcenPropsProvider {
    children: ReactNode;
}
export declare const FormNodeDatasourceProvider: (props: IFormNodeDatasourcenPropsProvider) => JSX.Element;
