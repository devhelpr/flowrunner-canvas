import * as React from 'react';
export interface TextProps {
    node: any;
    payloads: any[];
}
export interface TextState {
}
export declare class RichText extends React.Component<TextProps, TextState> {
    state: {};
    createMarkup: (html: any) => {
        __html: any;
    };
    render(): JSX.Element;
}
