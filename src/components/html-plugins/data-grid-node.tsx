import * as React from 'react';
import { connect } from "react-redux";

import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';

import { storeFlowNode } from '../../redux/actions/flow-actions';
import { ICanvasMode } from '../../redux/reducers/canvas-mode-reducers';

export class DataGridNodeHtmlPluginInfo {
	getWidth = (node) => {
		return (node && node.columns && ((node.columns + 1) * 100)) || 250;
	}

	getHeight(node) {
		return  ((node && node.rows && ((node.rows + 2) * 50)) + 20 )  || 250;
	}
}

export interface DataGridNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
	flow: any;

	selectedNode: any;
	canvasMode: ICanvasMode;

	storeFlowNode: (node, orgNodeName) => void;
}

export interface DataGridNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
	currentValue: string;
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
	}
}

class ContainedDataGridNodeHtmlPlugin extends React.Component<DataGridNodeHtmlPluginProps, DataGridNodeHtmlPluginState> {

	state = {
		value : "",
		values : [],
		node : {},
		currentValue: ""
	};

	info = new DataGridNodeHtmlPluginInfo();

	componentDidMount() {
		this.setState({
			values : this.props.node.values,
			node : this.props.node
		});
	}	
	
	onSubmit = (event: any) => {
		event.preventDefault();
		return false;
	}

	storeNode = () => {
		this.props.storeFlowNode(this.state.node, this.props.node.name);		
	}

	onCurrentValueChange = (event: any) => {
		event.preventDefault();
		this.setState({currentValue: event.target.value});
		return false;
	}

	onFocus =  (rowIndex, cellIndex, event: any) => { 
		event.preventDefault();
		if (rowIndex >= 0) {
			let row = this.state.values[rowIndex];
			this.setState({currentValue : row[cellIndex]});
		}

		return false;
	}

	onBlur = (event : any) => {
		event.preventDefault();
		//this.setState({currentValue : ""});
		return false;
	}

	onChange = (rowIndex, cellIndex, event: any) => {
		
		console.log("input", rowIndex, cellIndex, event.target.value, this.props.node);
		if (rowIndex >= 0) {
			let data : any[] = [...this.state.values];
			let row = [...data[rowIndex]];
			row[cellIndex] = event.target.value;
			data[rowIndex] = row;
			this.setState({
				values: data, 
				node : {...this.props.node, values: data}
			}, () => {
				this.storeNode();
			});
		} else {
			let data : any[] = [...this.state.values];
			data[cellIndex] = event.target.value;
			this.setState({
				values: data,
				node : {...this.props.node, values: data}
			}, () => {
				this.storeNode();
			});
		}
	}

	getWidth = (node) => {
		return this.info.getWidth(node);
	}

	getHeight(node) {
		return this.info.getHeight(node);
	}

	getColumnTitles = () => {
		let columnTitlesItems : any[] = [];
		let loop = 0;
		while (loop < this.props.node.columns) {
			let letter = String.fromCharCode((loop % 26) + 65)
			columnTitlesItems.push(<>{letter}</>)
			loop++;
		}
		return <div className="d-table-row">
			<div className="d-table-cell"></div>
			{columnTitlesItems.map((title, index) => {
				return <div key={"cell-title-" + index} className="d-table-cell text-center data-grid__cell-title">{title}</div>;
			})}
		</div>;
	}

	render() {
		return <div className="html-plugin-node" style={{			
			backgroundColor: "white"
		}}>
			<div className= "w-100 h-auto">
				<form className="form" onSubmit={this.onSubmit}>
					<div className="form-group">
						<input className={"form-control"} value={this.state.currentValue} onChange={this.onCurrentValueChange} />
					</div>
					<div className="form-group d-table">
						{(this.state.values || []).map((row, index) => {
							if (Array.isArray(row)) {
								//let letter = String.fromCharCode((index % 26) + 65);
								let rowTitle = (index + 1).toString();
								let columnTitles = <></>;
								if (index === 0) {
									columnTitles = this.getColumnTitles();
								}

								return <React.Fragment key={"row-" + index}>
										{columnTitles}
										<div className="d-table-row">										
											{(row as []).map((column, cellIndex) => {
												let columnTitle = <></>;
												if (cellIndex === 0) {
													columnTitle = <div key={"data-grid__row-title-" + cellIndex} className="d-table-cell data-grid__row-title">{rowTitle}</div>;
												}
												return <React.Fragment key={"data-grid__" + index + "-" + cellIndex}>
													{columnTitle}
													<div key={"cell-" + index + "-" + cellIndex} className="d-table-cell">
														<input className={"form-control " +(isNaN(column) ? "" : "text-right")} 
															value={column} 
															onChange={this.onChange.bind(this, index, cellIndex )} 
															onFocus={this.onFocus.bind(this, index, cellIndex )}
															onBlur={this.onBlur}
														/>
													</div>
												</React.Fragment>
											})}
										</div>
									</React.Fragment>;
							} else {
								return <div key={"row-" + index} className="d-table-cell">
									<input className={"form-control " + (isNaN(row) ? "" : "text-right")} value={row} onChange={this.onChange.bind(this, -1, index)} />
								</div>;
							}
						})}
					</div>						
					<button className="d-none">OK</button>
				</form>
			</div>
		</div>;
	}
}

export const DataGridNodeHtmlPlugin = connect(mapStateToProps, mapDispatchToProps)(ContainedDataGridNodeHtmlPlugin);