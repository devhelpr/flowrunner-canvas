import * as React from 'react';
import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { storeFlowNode } from '../../redux/actions/flow-actions';
import { modifyRawFlow } from '../../redux/actions/raw-flow-actions';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

export interface InputNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;

	selectedNode: any;
	canvasMode: ICanvasMode;

	storeFlowNode: (node, orgNodeName) => void;
	modifyRawFlow: (node, orgNodeName) => void;	
}

export interface InputNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
}

const mapStateToProps = (state : any) => {
	return {
		selectedNode : state.selectedNode,
		flow: state.flow,
		canvasMode: state.canvasMode
	}
}

const mapDispatchToProps = (dispatch : any) => {
	return {
		storeFlowNode: (node, orgNodeName) => dispatch(storeFlowNode(node, orgNodeName)),
		modifyRawFlow: (node, orgNodeName) => dispatch(modifyRawFlow(node, orgNodeName)),
	}
}

class ContainedInputNodeHtmlPlugin extends React.Component<InputNodeHtmlPluginProps, InputNodeHtmlPluginState> {

	state = {
		value : "",
		values : [],
		node : {}
	};

	componentDidMount() {
		if (this.props.node) {

			if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {
				if (this.props.node.mode && this.props.node.mode === "list") {
					this.setState({node: this.props.node, values : this.props.node.values || this.props.node.defaultValues || []});
				} else {
					this.setState({node: this.props.node, value : this.props.node.value || this.props.node.defaultValue || ""});
				}
			} else {
				this.props.flowrunnerConnector.modifyFlowNode(
					this.props.node.name, 
					this.props.node.propertyName, 
					this.props.node.defaultValue || "",
					""
				);
				this.setState({node: this.props.node, value : this.props.node.defaultValue || ""});
			}
		}
	}
	
	onSubmit = (event: any) => {
		event.preventDefault();

		if (!!this.props.canvasMode.isFlowrunnerPaused) {
			return;
		}
		
		if (this.props.node.formMode !== false) {
			this.props.flowrunnerConnector.executeFlowNode(this.props.node.executeNode || this.props.node.name, {});
		}
		return false;
	}

	storeNode = () => {
		this.props.modifyRawFlow(this.state.node, this.props.node.name);
		this.props.storeFlowNode(this.state.node, this.props.node.name);

		this.props.flowrunnerConnector.pushFlowToFlowrunner(this.props.flow);
	}

	onChange = (event: any) => {
		console.log("input", event.target.value, this.props.node);
		if (this.props.node) {
			if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {

				this.setState({
					node : {...this.props.node, value: this.props.node.value }, 
					value: this.props.node.value}, 
					() => {
					this.storeNode();
				});
				
			} else {
				this.props.flowrunnerConnector.modifyFlowNode(
					this.props.node.name, 
					this.props.node.propertyName, 
					event.target.value,
					this.props.node.onChange || ""
				);

				this.setState({value : event.target.value});
			}

			
		}
	}

	onChangeList = (index, event: any) => {
		//console.log("input", event.target.value, this.props.node);
		if (this.props.node) {

			if (this.props.node.mode && this.props.node.mode === "list") {
				let newState : string[] = [...this.state.values];
				console.log("newState", newState);
				newState[parseInt(index)] = event.target.value;
			
				if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {
					this.setState({
						node : {...this.props.node, values: newState }, 
						values: newState}, 
						() => {
						this.storeNode();
					});
	
				} else {
				
					console.log("newState", newState);

					this.props.flowrunnerConnector.modifyFlowNode(
						this.props.node.name, 
						this.props.node.propertyName, 
						newState,
						this.props.node.onChange || ""
					);
					this.setState({values : newState});
				
				}
				
			}
		}
	}

	deleteListItem = (index, event: any) => {
		event.preventDefault();

		if (!!this.props.canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (this.props.node) {

			if (this.props.node.mode && this.props.node.mode === "list") {
				let newState : string[] = [...this.state.values];
				if (index > -1) {
					newState.splice(index, 1);

					if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {
						this.setState({
							node : {...this.props.node, values: newState }, 
							values: newState} , 
							() => {
							this.storeNode();
						});
	
					} else {						
						this.props.flowrunnerConnector.modifyFlowNode(
							this.props.node.name, 
							this.props.node.propertyName, 
							newState,
							this.props.node.onChange || ""
						);
						this.setState({values : newState});
					}
	
					
				}
			}
		}
		return false;
	}

	onAddValue = (event) => {
		event.preventDefault();

		if (!!this.props.canvasMode.isFlowrunnerPaused) {
			return;
		}

		if (this.props.node) {
			let newState : string[] = [...this.state.values];
			newState.push("");

			if (this.props.node.nodeDatasource && this.props.node.nodeDatasource === "flow") {

				this.setState({
					node : {...this.props.node, values: newState}, 
					values: newState } , 
					() => {
					this.storeNode();
				});

			} else {
				this.props.flowrunnerConnector.modifyFlowNode(
					this.props.node.name, 
					this.props.node.propertyName, 
					newState,
					this.props.node.onChange || ""
				);
				this.setState({values : newState});
			}
			
		}
		return false;
	}

	render() {
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className={this.props.node.mode && this.props.node.mode === "list"? "w-100 overflow-y-scroll no-wheel" : "w-100 h-auto"}>
				<form className="form" onSubmit={this.onSubmit}>
					<div className="form-group">						
						<div>
							<label htmlFor={"input-" + this.props.node.name}><strong>{this.props.node.title || this.props.node.name}</strong></label>
						</div>
						{this.props.node.mode && this.props.node.mode === "list" ? <>
							{(this.state.values || []).map((value, index) => {
								return <React.Fragment key={"index-f-" + index}>
										<div className="input-group mb-1">
											<input 
												key={"index" + index}
												className="form-control"
												id={"input-" + this.props.node.name + "-" + index}
												value={value}
												data-index={index}
												disabled={!!this.props.canvasMode.isFlowrunnerPaused}
												onChange={this.onChangeList.bind(this, index)} 
										/>
										<div className="input-group-append">
											<a href="#" title="delete item" 
												onClick={this.deleteListItem.bind(this, index)} 											
												role="button" className="btn btn-outline-secondary">D</a>
										</div>
									</div>
								</React.Fragment>
							})}
							<div className="d-flex">
								<button onClick={this.onAddValue} className="ml-auto mt-2 btn btn-primary pl-4 pr-4">ADD</button>
							</div>
							{!!this.props.node.formMode && <>
								<br /><hr /><br />
							</>}
						</> :
						<input 
							className="form-control"
							id={"input-" + this.props.node.name}
							value={this.state.value}
							onChange={this.onChange} 
							disabled={!!this.props.canvasMode.isFlowrunnerPaused}
						/>
						}
						{!!this.props.node.formMode && 
							<div className="d-flex">
								<button className="ml-auto mt-2 btn btn-primary pl-4 pr-4">OK</button>
							</div>
						}
					</div>
				</form>
			</div>
		</div>;
	}
}

export const InputNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedInputNodeHtmlPlugin);