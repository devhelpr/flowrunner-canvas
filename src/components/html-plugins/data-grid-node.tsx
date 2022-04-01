import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';

import { IFlowrunnerConnector } from '../../interfaces/FlowrunnerConnector';

import { useFlowStore} from '../../state/flow-state';
import { useCanvasModeStateStore} from '../../state/canvas-mode-state';
import { useSelectedNodeStore} from '../../state/selected-node-state';

export class DataGridNodeHtmlPluginInfo {
	getWidth = (node) => {
		return (node && node.columns && ((node.columns + 1) * 100) + 24) || 250;
	}

	getHeight(node) {
		return  ((node && node.rows && ((node.rows + 2) * 50)) + 20 + 24 )  || 250;
	}
}

export interface DataGridNodeHtmlPluginProps {
	flowrunnerConnector : IFlowrunnerConnector;
	node : any;
}

export interface DataGridNodeHtmlPluginState {
	value : string;
	values : string[];
	node : any;
	currentValue: string;
}

export const DataGridNodeHtmlPlugin = (props : DataGridNodeHtmlPluginProps) => {
	const [value, setValue] = useState("");
	const [values, setValues] = useState([] as any[]);
	const [node, setNode] = useState({} as any);
	const [currentValue, setCurrentValue] = useState("");

	const flow = useFlowStore();
	const canvasMode = useCanvasModeStateStore();
	const selectedNode = useSelectedNodeStore();

	const info = new DataGridNodeHtmlPluginInfo();

	useEffect(() => {
		setValues(props.node.values);
		setNode(props.node);
	}, []);
	
	const onSubmit = (event: any) => {
		event.preventDefault();
		return false;
	}

	const storeNode = (newNode) => {
		console.log("datagrid", newNode);
		flow.storeFlowNode(newNode, props.node.name);	
		
		props.flowrunnerConnector?.modifyFlowNode(
			props.node.name, 
			"", 
			"",
			props.node.name,
			'',
			newNode
		);
	}

	const onCurrentValueChange = (event: any) => {
		event.preventDefault();
		setCurrentValue(event.target.value);
		return false;
	}

	const onFocus =  (rowIndex, cellIndex, event: any) => { 
		event.preventDefault();
		if (rowIndex >= 0) {
			let row = values[rowIndex];
			setCurrentValue(row[cellIndex]);
		}

		return false;
	}

	const onBlur = (event : any) => {
		event.preventDefault();
		//setState({currentValue : ""});
		return false;
	}

	const onChange = (rowIndex, cellIndex, event: any) => {
		
		console.log("input", rowIndex, cellIndex, event.target.value, props.node);
		if (rowIndex >= 0) {
			let data : any[] = [...values];
			let row = [...data[rowIndex]];
			row[cellIndex] = event.target.value;
			data[rowIndex] = row;
			const newNode = {...props.node, values: data};
			setValues(data);
			setNode(newNode);
			storeNode(newNode);			
		} else {
			let data : any[] = [...values];
			data[cellIndex] = event.target.value;
			setValues(data);
			const newNode = {...props.node, values: data};
			storeNode(newNode);						
		}
	}

	const getWidth = (node) => {
		return info.getWidth(node);
	}

	const getHeight = (node) => {
		return info.getHeight(node);
	}

	const addColumn = (event) => {
		event.preventDefault();

		let data : any[] = [...values];
		data = data.map((row) => {
			let newRow = [...row];
			newRow.push("0");
			return newRow;
		});
		
		setValues(data);
		const newNode = {...props.node, values: data, columns: (props.node as any).columns + 1};		
		flow.storeFlowNode({...newNode}, 
			props.node.name
		);
		return false;
	}

	const addRow = (event) => {
		event.preventDefault();

		let data : any[] = [...values];
		data.push(new Array(props.node.columns || 8).fill("0"));
		setValues(data);
		const newNode = {...props.node, values: data, rows: (props.node as any).rows + 1};
		flow.storeFlowNode({...newNode}, 
			props.node.name
		);

		return false;
	}

	const getColumnTitles = () => {
		let columnTitlesItems : any[] = [];
		let loop = 0;
		while (loop < props.node.columns) {
			let letter = String.fromCharCode((loop % 26) + 65)
			columnTitlesItems.push(<>{letter}</>)
			loop++;
		}
		return <div className="d-table-row">
			<div className="d-table-cell"></div>
			{columnTitlesItems.map((title, index) => {
				return <div key={"cell-title-" + index} className="d-table-cell text-center data-grid__cell-title">{title}</div>;
			})}
			<a href="#" onClick={addColumn} className="d-table-cell text-center data-grid__cell-title data-grid__cell-add-column">+</a>
		</div>;
	}

	return <div className="html-plugin-node" style={{			
		backgroundColor: "white"
	}}>
		<div className= "w-100 h-auto">
			<form className="form" onSubmit={onSubmit}>
				<div className="form-group">
					<input className={"form-control"} value={currentValue} onChange={onCurrentValueChange} />
				</div>
				<div className="form-group d-table">
					{(values || []).map((row, index) => {
						if (Array.isArray(row)) {
							//let letter = String.fromCharCode((index % 26) + 65);
							let rowTitle = (index + 1).toString();
							let columnTitles = <></>;
							if (index === 0) {
								columnTitles = getColumnTitles();
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
														onChange={(event) => onChange(index, cellIndex, event )} 
														onFocus={(event) => onFocus(index, cellIndex, event )}
														onBlur={onBlur}
													/>
												</div>
											</React.Fragment>
										})}
									</div>
								</React.Fragment>;
						} else {
							return <div key={"row-" + index} className="d-table-cell">
								<input className={"form-control " + (isNaN(row) ? "" : "text-right")} value={row} onChange={(event) => onChange(-1, index, event)} />
							</div>;
						}
					})}
					<div className="d-table-row">
						<a href="#" onClick={addRow} className="d-table-cell text-center data-grid__cell-title data-grid__cell-add-row">+</a>
					</div>
				</div>						
				<button className="d-none">OK</button>
			</form>
		</div>
	</div>;
}

