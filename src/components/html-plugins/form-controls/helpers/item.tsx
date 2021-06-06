
import React, {forwardRef} from 'react';
​import { FormNodeHtmlPlugin } from '../../form-node';
import { onFocus } from './focus';

export interface ItemProps {
	id? : string;
	style : any;
	children: React.ReactNode;
	listeners : any;

	node : any;
	isObjectListNodeEditing : boolean;
	onSetValue : any;
	datasources : any;

	viewMode: string;
	payload: any;
	listItem: any;
	index: number;

	editIndex: number;
	onEditItem: any;
	metaInfo: any;
	deleteClick: any;
	onEditNodeKeyValue: any;
	isInFlowEditor : boolean;

	isBeingSorted : boolean;
}
export const Item = forwardRef((props: ItemProps, ref?: any) => {

	if (props.viewMode && props.viewMode == "table-dragging" && props.metaInfo.metaInfo) {
		let isSelected = false;									
		if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
			if (props.index == props.payload["_" + props.node.name + "-node"]) {
				isSelected = true;
			}
		}

		if (props.index != props.editIndex) {										
			return <table style={props.style}  key={"table" + props.index} 
				{...props.listeners} ref={ref} >
					<tbody>
						<tr className={isSelected ? "bg-primary text-white" : ""}>
							<td>
								<a href="#" onFocus={onFocus} onClick={
									(event) => props.onEditItem(props.index, event)} className={"fas fa-edit"}></a>
							</td>						
							{props.metaInfo.metaInfo.map((item , index) => {
								return <td key={"cell" + index} className={"p-2"}>{props.listItem[item.fieldName]}</td>
							})}
						</tr>
					</tbody>
			</table>	
		} else {
			return <table style={props.style} 
				{...props.listeners} 
				ref={ref} 
				key={"table" + props.index}>
					<tbody>
						<tr>
							<td colSpan={props.metaInfo.metaInfo.length + 1}>
								<div className="form-control__object-list-node" key={"input" + props.metaInfo.fieldName + props.index}>
									<a href="#" onFocus={onFocus} onClick={(event) => props.deleteClick(event, props.index)} className="form-control__object-list-node-delete fas fa-trash-alt"></a>
									<FormNodeHtmlPlugin 
										node={{...props.node}}
										isObjectListNodeEditing={true}
										isInFlowEditor={props.isInFlowEditor}
										onSetValue={(value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName)}
										datasources={props.datasources}
									></FormNodeHtmlPlugin>
								</div>
							</td>
						</tr>
					</tbody>
			</table>
		}
	} else
	if (props.viewMode && props.viewMode == "table" && props.metaInfo.metaInfo) {
		let isSelected = false;									
		if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
			if (props.index == props.payload["_" + props.node.name + "-node"]) {
				isSelected = true;
			}
		}

		if (props.index != props.editIndex) {
										
			return <tr ref={ref} 
				style={props.style} 
				{...props.listeners}
				key={"table-row" + props.index} className={isSelected ? "bg-primary text-white" : ""}>
				<td>
					<a href="#" onFocus={onFocus} onClick={
						(event) => props.onEditItem(props.index, event)} className={"fas fa-edit"}></a>
				</td>						
				{props.metaInfo.metaInfo.map((item , index) => {
					return <td key={"cell" + index} className={"p-2"}>{props.listItem[item.fieldName]}</td>
				})}
			</tr>	
		} else {
			return <tr 
				style={props.style} 
				{...props.listeners} 
				ref={ref} 
				key={"table-row" + props.index}>
				<td colSpan={props.metaInfo.metaInfo.length + 1}>
					<div className="form-control__object-list-node" key={"input" + props.metaInfo.fieldName + props.index}>
						<a href="#" onFocus={onFocus} onClick={(event) => props.deleteClick(event, props.index)} className="form-control__object-list-node-delete fas fa-trash-alt"></a>
						<FormNodeHtmlPlugin 
							node={{...props.node}}
							isObjectListNodeEditing={true}
							isInFlowEditor={props.isInFlowEditor}
							onSetValue={(value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName)}
							datasources={props.datasources}
						></FormNodeHtmlPlugin>
					</div>
				</td>
			</tr>
		}
	} else {
		return <div ref={ref} 
			style={props.style} 
			
			className={"form-control__object-list-node form-control__object-list-node--sortable " + 
				(props.isBeingSorted ? "form-control__object-list-node--sorting" : "")} 
			key={"input" + props.metaInfo.fieldName + props.index}>
			<a href="#" onFocus={onFocus} 
			{	...props.listeners} 				
				className="form-control__object-list-node-grip fas fa-grip-vertical"></a>
			<a href="#" onFocus={onFocus} 
				onMouseOver={() => {
					// TODO : set onhoverstate in object-list and disable useSortable...
				}} 
				onMouseOut={() => {
					// TODO : set onhoverstate in object-list to -1 and enable useSortable...
				}} 
				onClick={(event) => props.deleteClick(event, props.index)} 
				className="form-control__object-list-node-delete fas fa-trash-alt"></a>
			<FormNodeHtmlPlugin 
				node={{...props.node}}
				isObjectListNodeEditing={true}
				isInFlowEditor={props.isInFlowEditor}
				onSetValue={(value, fieldName) => props.onEditNodeKeyValue(props.index, value, fieldName)}
				datasources={props.datasources}
			></FormNodeHtmlPlugin>
		</div>;
	}
	/*
  return (
    <div {...props} ref={ref}>
		<FormNodeHtmlPlugin 
			node={{...props.node}}
			isObjectListNodeEditing={props.isObjectListNodeEditing}
			onSetValue={props.onSetValue}
			datasources={props.datasources}
		></FormNodeHtmlPlugin>
				

								
	</div>
  )
  */
});