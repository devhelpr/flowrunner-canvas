import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import fetch from 'cross-fetch';

// /api/taskdoc/

export interface HelpPopupProps {
  taskName : string;
}

export interface HelpPopupState {
  open : boolean;
  content: string;
  taskName : string;
}

export class HelpPopup extends React.Component<HelpPopupProps, HelpPopupState> {

	state = {
    open: false,
    content: "",
    taskName: ""    
	}
	handleClickOpen = () => {
		this.setState({open: true});
	};
	handleClose = () => {
		this.setState({open: false});
  };
  
  componentDidMount() {
    fetch('/api/taskdoc/' + this.props.taskName)
		.then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server");
			}
			return res.json();
		})
		.then(documentation => {
      // documentation.content
      // documentation.taskname
      console.log("documentation", documentation);
      this.setState({
          open: true,
          content: documentation.content, 
          taskName : documentation.taskname
      });
		})
		.catch(err => {
			console.error(err);
		});
  }

  render () {
  	return <Modal show={this.state.open} centered size="lg">
      <Modal.Header>
        <Modal.Title>{this.state.taskName}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div>{this.state.content}</div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={this.handleClose}>Close</Button>
      </Modal.Footer>
	  </Modal>;
  }
}

/*
export interface HelpPopupExternalProps {
  taskName: string;
}

export type Ref = HTMLElement;
export const HelpPopup =  React.forwardRef((props : HelpPopupExternalProps, ref) => <ContainedHelpPopup {...props} forwardedRef={ref} />);
*/