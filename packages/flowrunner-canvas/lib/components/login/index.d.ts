import * as React from 'react';
export interface LoginPopupProps {
    onClose: any;
}
export interface LoginPopupState {
    username: string;
    password: string;
    passwordCompare: string;
    email: string;
    firstname: string;
    lastname: string;
    isRegistratingNewUser: boolean;
}
export declare class Login extends React.Component<LoginPopupProps, LoginPopupState> {
    state: {
        username: string;
        password: string;
        passwordCompare: string;
        email: string;
        firstname: string;
        lastname: string;
        isRegistratingNewUser: boolean;
    };
    componentDidMount(): void;
    onChange: (event: {
        preventDefault: any;
        target: {
            name: keyof LoginPopupState;
            value: any;
        };
    }) => boolean;
    switchToRegisterNewUser: (event: any) => boolean;
    showLoadingScreen: () => void;
    onSubmit: (event: any) => boolean;
    render(): JSX.Element;
}
