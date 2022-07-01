import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import fetch from 'cross-fetch';
export class Login extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            username: '',
            password: '',
            passwordCompare: '',
            email: '',
            firstname: '',
            lastname: '',
            isRegistratingNewUser: false,
        };
        this.onChange = (event) => {
            event.preventDefault();
            const newState = { [event.target.name]: event.target.value };
            this.setState(newState);
            return false;
        };
        this.switchToRegisterNewUser = event => {
            event.preventDefault();
            this.setState({ isRegistratingNewUser: !this.state.isRegistratingNewUser });
            return false;
        };
        this.showLoadingScreen = () => {
            let loadingElement = document.getElementById("loading");
            if (loadingElement && !loadingElement.classList.contains("loaded")) {
                loadingElement.classList.add("loaded");
                setTimeout(() => {
                    let loadingElement = document.getElementById("loading");
                    if (loadingElement) {
                        loadingElement.classList.remove("hidden");
                    }
                }, 350);
            }
        };
        this.onSubmit = event => {
            event.preventDefault();
            if (this.state.isRegistratingNewUser) {
                if (this.state.password !== this.state.passwordCompare) {
                    alert('Passwords do not match');
                    return false;
                }
                fetch('/api/register-user', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                        firstname: this.state.firstname,
                        lastname: this.state.lastname,
                        email: this.state.email,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(res => {
                    if (res.status >= 400) {
                        alert('Register new user failed, please try again');
                        throw new Error('Bad response from server');
                    }
                    return res.json();
                })
                    .then(repsonse => {
                    if (repsonse.jwt !== undefined && repsonse.jwt !== '') {
                        this.showLoadingScreen();
                        this.props.onClose();
                    }
                    else {
                        alert('Register new user failed, please try again');
                    }
                })
                    .catch(err => {
                    console.error(err);
                });
            }
            else {
                fetch('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(res => {
                    if (res.status >= 400) {
                        alert('Login failed, please try again');
                        throw new Error('Bad response from server');
                    }
                    return res.json();
                })
                    .then(repsonse => {
                    if (repsonse.jwt !== undefined && repsonse.jwt !== '') {
                        this.showLoadingScreen();
                        this.props.onClose();
                    }
                    else {
                        alert('Login failed, please try again');
                    }
                })
                    .catch(err => {
                    console.error(err);
                });
            }
            return false;
        };
    }
    componentDidMount() {
        let loadingElement = document.getElementById("loading");
        if (loadingElement && !loadingElement.classList.contains("loaded")) {
            loadingElement.classList.add("loaded");
            setTimeout(() => {
                let loadingElement = document.getElementById("loading");
                if (loadingElement) {
                    loadingElement.classList.add("hidden");
                }
            }, 350);
        }
    }
    render() {
        return (_jsxs(Modal, { show: true, centered: true, size: "sm", children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: this.state.isRegistratingNewUser ? 'Register' : 'Login' }) }), _jsx(Modal.Body, { children: _jsxs("form", { className: "form mx-auto", onSubmit: this.onSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "userName", children: "Username" }), _jsx("input", { type: "text", required: true, value: this.state.username, onChange: this.onChange, className: "form-control", id: "userName", name: "username" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { type: "password", required: true, className: "form-control", id: "password", name: "password", value: this.state.password, onChange: this.onChange })] }), this.state.isRegistratingNewUser && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "passwordCompare", children: "Password compare" }), _jsx("input", { type: "password", required: true, className: "form-control", id: "passwordCompare", name: "passwordCompare", value: this.state.passwordCompare, onChange: this.onChange })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "firstname", children: "First name" }), _jsx("input", { type: "text", required: true, value: this.state.firstname, onChange: this.onChange, className: "form-control", id: "firstname", name: "firstname" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "lastname", children: "Last name" }), _jsx("input", { type: "text", required: true, value: this.state.lastname, onChange: this.onChange, className: "form-control", id: "lastname", name: "lastname" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "E-mail" }), _jsx("input", { type: "email", required: true, value: this.state.email, onChange: this.onChange, className: "form-control", id: "email", name: "email" })] }), _jsx("button", { type: "submit", className: "btn btn-primary", children: "Register" }), _jsx("a", { href: "#", className: "ml-2", onClick: this.switchToRegisterNewUser, children: "Login" })] })), !this.state.isRegistratingNewUser && (_jsxs(_Fragment, { children: [_jsx("button", { type: "submit", className: "btn btn-primary", children: "Login" }), _jsx("a", { href: "#", className: "ml-2", onClick: this.switchToRegisterNewUser, children: "Register new user" })] }))] }) })] }));
    }
}
//# sourceMappingURL=index.js.map