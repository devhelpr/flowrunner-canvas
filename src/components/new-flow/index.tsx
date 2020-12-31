import * as React from 'react';
import { connect } from "react-redux";
import fetch from 'cross-fetch';

import { Modal, Button } from 'react-bootstrap';
import { storeFlowNode } from '../../redux/actions/flow-actions';
import { selectNode } from '../../redux/actions/node-actions';

export interface NewFlowProps {
	selectedNode : any;
	onClose : () => void;
	onSave: (id : number | string, flowType : string) => void;
	storeFlowNode: (node : any, orgNodeName : string) => void;
	selectNode: (name: string, node : any) => void;
}

export interface NewFlowState {
	value: string;
	orgNodeName: string;
	orgNodeValues: any;
	requiredNodeValues: any;
	flowType: string;
	addJSONFlow: boolean;
	json: string;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		selectNode: (name, node) => dispatch(selectNode(name, node))
	}
}

class ContainedNewFlow extends React.Component<NewFlowProps, NewFlowState> {

	constructor(props: any) {
		super(props);
		this.ref = React.createRef();
	}
	
	state = {
		value: "",
		orgNodeName : "",
		orgNodeValues: {},
		requiredNodeValues: {},
		flowType: "playground",
		addJSONFlow : false,
		json: ""
	}

	ref;

	componentDidMount() {
		
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls

		this.setState({value: ""});
	}

	saveNode(e) {
		if (this.state.addJSONFlow) {
			try {
				let flow = JSON.parse(this.state.json);
				if (!Array.isArray(flow)) {
					alert("The JSON should be an array of nodes and connections");
					return;
				}
			} catch (err) {
				alert("Error in JSON: " + err);
				return;
			}
		}
		try {
			fetch('/flow?flow=' + this.state.value + 
				"&flowType=" + this.state.flowType +
				"&addJSONFlow=" + this.state.addJSONFlow, {
				method : "post",
				body: JSON.stringify({
					nodes : JSON.parse(this.state.json || "[]")
				}),
				headers: {
					"Content-Type": "application/json"
				}
			}).then((response) => {
				if (response.status >= 400) {
					throw new Error("Bad response from server");
				}
				return response.json();
			}).then((result) => {
				this.props.onSave(result.id, this.state.flowType);
			});
			
		} catch (err) {
			console.log("new-flow err", err);
			alert("Error while adding flow");
		}

		e.preventDefault();
		return false;
	}

	onAddJSONFlow = (event) => {
		event.preventDefault();
		this.setState({addJSONFlow: !this.state.addJSONFlow});
		return false;
	}

	onChangeJson = (event) => {
		event.preventDefault();
		this.setState({json: event.target.value})
		return false;
	}

	onChangeFlowName = (event) => {
		event.preventDefault();
		this.setState({value: event.target.value});
		return false;

	}

	onChangeFlowType = (event) => {
		event.preventDefaul();
		this.setState({flowType: event.target.value});
		return false;
	}

	render() {
		return <div ref={this.ref}>
			<Modal 
				show={true} 
				centered 
				size={this.state.addJSONFlow ? "xl" : "sm"} 
				container={this.ref.current}>
				<Modal.Header>
					<Modal.Title>Add new Flow</Modal.Title>
				</Modal.Header>
			
				<Modal.Body>
					<div className="form-group">
						<label>Flow name</label>
						<input className="form-control"
							value={this.state.value} 
							required
							onChange={this.onChangeFlowName}
						></input>
					</div>
					<div className="form-group">
						<label>Flow type</label>
						<select className="form-control" value={this.state.flowType}
							onChange={this.onChangeFlowType}
						>
							<option value="playground">Playground</option>
							<option value="rustflowrunner">Rust flowrunner</option>
							<option value="mobile-app">Mobile app</option>
							<option value="backend">Backend</option>
						</select>				
					</div>
					<div className="form-group">
						<input id="addJSONFlow" type="checkbox" checked={this.state.addJSONFlow} 
							onChange={this.onAddJSONFlow} />
						<label htmlFor="addJSONFlow" className="ml-2">Enter flow as json</label>
					</div>
					{this.state.addJSONFlow && <div className="form-group">
						<textarea className="form-control" 
							value={this.state.json} 
							onChange={this.onChangeJson}></textarea>
					</div>
					}
				</Modal.Body>
			
				<Modal.Footer>
					<Button variant="secondary" onClick={this.props.onClose}>Close</Button>
					<Button variant="primary" onClick={this.saveNode.bind(this)}>Add</Button>
				</Modal.Footer>
			</Modal>
	  </div>;
	}
}

export const NewFlow = connect(mapStateToProps, mapDispatchToProps)(ContainedNewFlow);
