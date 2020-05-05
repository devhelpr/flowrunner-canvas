import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface InputNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface InputNodeHtmlPluginState {
	value : string;
	values : string[];
}

export class InputNodeHtmlPlugin extends React.Component<InputNodeHtmlPluginProps, InputNodeHtmlPluginState> {

	state = {
		value : "",
		values : []
	};

	componentDidMount() {
		if (this.props.node) {
			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				this.props.node.defaultValue || "",
				""
			);
			this.setState({value : this.props.node.defaultValue || ""});
		}
	}
	
	onSubmit = (event: any) => {
		event.preventDefault();
		if (this.props.node.formMode !== false) {
			this.props.flowrunnerConnector.executeFlowNode(this.props.node.executeNode || this.props.node.name, {});
		}
		return false;
	}

	onChange = (event: any) => {
		console.log("input", event.target.value, this.props.node);
		if (this.props.node) {

			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				event.target.value,
				this.props.node.onChange || ""
			);

			this.setState({value : event.target.value});
		}
	}

	onChangeList = (index, event: any) => {
		//console.log("input", event.target.value, this.props.node);
		if (this.props.node) {

			if (this.props.node.mode && this.props.node.mode === "list") {
							
				let newState : string[] = this.state.values;
				newState[parseInt(index)] = event.target.value;

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

	deleteListItem = (index, event: any) => {
		event.preventDefault();
		if (this.props.node) {

			if (this.props.node.mode && this.props.node.mode === "list") {
				let newState : string[] = this.state.values;
				if (index > -1) {
					newState.splice(index, 1);

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
		return false;
	}

	onAddValue = (event) => {
		event.preventDefault();
		if (this.props.node) {
			let newState : string[] = this.state.values;
			newState.push("");

			this.props.flowrunnerConnector.modifyFlowNode(
				this.props.node.name, 
				this.props.node.propertyName, 
				newState,
				this.props.node.onChange || ""
			);

			this.setState({values : newState});
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
											onChange={this.onChangeList.bind(this, index)} 
										/>
										<div className="input-group-append">
											<a href="#" title="delete item" onClick={this.deleteListItem.bind(this, index)} role="button" className="btn btn-outline-secondary">D</a>
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