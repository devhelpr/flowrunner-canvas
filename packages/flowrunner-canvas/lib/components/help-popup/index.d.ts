import React from 'react';
export interface HelpPopupProps {
    taskName: string;
}
export interface HelpPopupState {
    open: boolean;
    content: string;
    taskName: string;
}
export declare class HelpPopup extends React.Component<HelpPopupProps, HelpPopupState> {
    constructor(props: any);
    ref: any;
    state: {
        open: boolean;
        content: string;
        taskName: string;
    };
    handleClickOpen: () => void;
    handleClose: () => void;
    componentDidMount(): void;
    render(): JSX.Element;
}
