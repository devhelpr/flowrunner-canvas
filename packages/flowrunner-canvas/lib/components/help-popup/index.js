import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import fetch from 'cross-fetch';
export class HelpPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            content: '',
            taskName: '',
        };
        this.handleClickOpen = () => {
            this.setState({ open: true });
        };
        this.handleClose = () => {
            this.setState({ open: false });
        };
        this.ref = React.createRef();
    }
    componentDidMount() {
        fetch('/api/taskdoc/' + this.props.taskName)
            .then(res => {
            if (res.status >= 400) {
                throw new Error('Bad response from server');
            }
            return res.json();
        })
            .then(documentation => {
            console.log('documentation', documentation);
            this.setState({
                open: true,
                content: documentation.content,
                taskName: documentation.taskname,
            });
        })
            .catch(err => {
            console.error(err);
        });
    }
    render() {
        return (_jsx("div", { ref: this.ref, children: _jsxs(Modal, { show: this.state.open, centered: true, size: "lg", container: this.ref.current, children: [_jsx(Modal.Header, { children: _jsx(Modal.Title, { children: this.state.taskName }) }), _jsx(Modal.Body, { children: _jsx("div", { children: this.state.content }) }), _jsx(Modal.Footer, { children: _jsx(Button, { variant: "secondary", onClick: this.handleClose, children: "Close" }) })] }) }));
    }
}
//# sourceMappingURL=index.js.map