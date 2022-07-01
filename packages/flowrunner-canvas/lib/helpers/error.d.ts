import * as React from 'react';
export interface IErrorBoundaryProps {
}
export interface IErrorBoundaryState {
    hasError: boolean;
}
export declare class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    render(): React.ReactNode;
}
