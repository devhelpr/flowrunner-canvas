import * as React from 'react';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
export interface InputNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface InputNodeHtmlPluginState {
	value : string;
}

export class InputNodeHtmlPlugin extends React.Component<InputNodeHtmlPluginProps, InputNodeHtmlPluginState> {

	state = {
		value : ""
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

	render() {
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className="w-100 h-auto">
				<form className="form" onSubmit={this.onSubmit}>
					<div className="form-group">						
						<div>
							<label htmlFor={"input-" + this.props.node.name}><strong>{this.props.node.title || this.props.node.name}</strong></label>
						</div>
						<input 
							className="form-control"
							id={"input-" + this.props.node.name}
							value={this.state.value}
							onChange={this.onChange} 
						/>
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