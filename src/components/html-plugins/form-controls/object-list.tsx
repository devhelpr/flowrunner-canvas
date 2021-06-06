import * as React from 'react';
import { useState, useEffect } from 'react';
import {
	DndContext, 
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	AnimateLayoutChanges
} from '@dnd-kit/sortable';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

import { FormNodeHtmlPlugin } from '../form-node';
import { onFocus } from './helpers/focus';
import { SortableItem } from './helpers/sortable-context';
import { Item } from './helpers/item';
/*
	Purpose:
		show list of form-nodes
		props.metaInfo.metaNodeInfo contains fields to edit with formNode
		props.values is array of objects

		isObjectListNodeEditing : set on FormNode to indicating editing via object-list
			.. form-node should not store values in flow directly

			.. we need read only mode 
				isReadOnly

		form-node should be editable using an object-list
*/

export const ObjectList = (props: IFormControlProps) => {
	const { metaInfo, node } = props;
	const [activeId, setActiveId] = useState(-1);
	const [ isAdding , setAdding] = useState(false);
	const [ newValue, setNewValue ] = useState({});
	const [ editIndex , setEditIndex] = useState(-1);
	let formControl = useFormControlFromCode(props.value || [], metaInfo, props.onChange);
	
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		formControl.setValue(props.value);
	}, [props.value]);

	const deleteClick = (event, index) => {
		event.preventDefault();
		event.stopPropagation();
		setAdding(false);

		let newList = [...formControl.value];
		newList.splice(index, 1);
		formControl.handleChangeByValue(newList);
		return false;
	}

	const addItem = (event) => {
		event.preventDefault();
		
		setAdding(true);

		return false;
	}

	const onAppendValue = (event) => {
		event.preventDefault();

		let newList = [...formControl.value];
		newList.push(newValue);
		formControl.handleChangeByValue(newList);

		setAdding(false);
		setNewValue({});

		return false;
	}
	
	const onEditNodeKeyValue = (index, value, fieldName) => {
		const clonedValue = {...formControl.value[index]};
		clonedValue[fieldName] = value;
		let newList = [...formControl.value];
		newList[index] = clonedValue;
		formControl.handleChangeByValue(newList);
	}

	const onAddNodeKeyValue = (value, fieldName) => {
		const clonedValue = {...newValue};
		clonedValue[fieldName] = value;
		setNewValue(clonedValue);
	}

	const onCloseAppendValue = (event) => {
		event.preventDefault();

		setAdding(false);

		return false;
	}

	const onEditItem = (index, event) => {
		event.preventDefault();
		event.stopPropagation();
		setEditIndex(index);
		return false;
	}

	function handleDragStart(event) {
		const {active} = event;		
		let index = parseInt(active.id);
		setActiveId(index);
		console.log("handleDragStart", index, active);
	}	  

	function handleDragEnd(event) {
		const {active, over} = event;
		let index = parseInt(active.id);
		let overIndex = parseInt(over.id);
		console.log("handleDragEnd", index, overIndex);
		if (index !== overIndex) {
			let newList = [...formControl.value];
			let oldIndex = index;
			let newIndex = overIndex;
			/*newList.map((item, index) => {
				if (item.id == active.id) {
					oldIndex = index;
				} else 
				if (item.id == over.id) {
					newIndex = index;
				}
			});*/
			formControl.handleChangeByValue(arrayMove(newList, oldIndex, newIndex));						
		}
		setActiveId(-1);
	}

	/*

	<DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map(id => <SortableItem key={id} id={id} />)}
      </SortableContext>
      <DragOverlay>
        {activeId ? <Item id={activeId} /> : null}
      </DragOverlay>
    </DndContext>

	*/

	return <div className="form-group" data-helper="object-list">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong></label>
			{!!props.isInFlowEditor ? <>{metaInfo.viewMode && metaInfo.viewMode == "table" && metaInfo.metaInfo ?
				<table>
					<tbody>
					{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
						let isSelected = false;									
						if (props.payload && props.node && props.payload["_" + props.node.name + "-node"] !== undefined) {
							if (index == props.payload["_" + props.node.name + "-node"]) {
								isSelected = true;
							}
						}

						if (index != editIndex) {
							
							return <tr key={"table-row" + index} className={isSelected ? "bg-primary text-white" : ""}>
								<td>
									<a href="#" onFocus={onFocus} onClick={(event) => onEditItem(index, event)} className={"fas fa-edit"}></a>
								</td>						
								{metaInfo.metaInfo.map((item , index) => {
									return <td key={"cell" + index} className={"p-2"}>{listItem[item.fieldName]}</td>
								})}
							</tr>	
						} else {
							return <tr key={"table-row" + index}>
								<td colSpan={metaInfo.metaInfo.length + 1}>
									<div className="form-control__object-list-node" key={"input" + metaInfo.fieldName + index}>
										<a href="#" onFocus={onFocus} onClick={(event) => deleteClick(event, index)} className="form-control__object-list-node-delete fas fa-trash-alt"></a>
										<FormNodeHtmlPlugin 
											node={{...formControl.value[index], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index}}
											isObjectListNodeEditing={true}
											isInFlowEditor={props.isInFlowEditor}
											onSetValue={(value, fieldName) => onEditNodeKeyValue(index, value, fieldName)}
											datasources={props.datasources}
										></FormNodeHtmlPlugin>
									</div>
								</td>
							</tr>
						}
					})}
					</tbody>
				</table>
				:
					<>
						{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
							return <div className="form-control__object-list-node" key={"input" + metaInfo.fieldName + index}>
								<a href="#" onFocus={onFocus} onClick={(event) => deleteClick(event, index)} className="form-control__object-list-node-delete fas fa-trash-alt"></a>
								<FormNodeHtmlPlugin 
									node={{...formControl.value[index], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index}}
									isObjectListNodeEditing={true}
									isInFlowEditor={props.isInFlowEditor}
									onSetValue={(value, fieldName) => onEditNodeKeyValue(index, value, fieldName)}
									datasources={props.datasources}
								></FormNodeHtmlPlugin>
							</div>
						})}
					</>
				}</>		
				:
				<>{metaInfo.viewMode && metaInfo.viewMode == "table" && metaInfo.metaInfo ?
				<table>
					<tbody>
						<DndContext 
						
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
						>
							<SortableContext 								
								items={formControl.value}
								strategy={verticalListSortingStrategy}
							>
								{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
									return <SortableItem 
										key={"viewmode-table-" + index} 
										id={index.toString()} 
										index={index}
										node={{...formControl.value[index], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index}}
										isObjectListNodeEditing={true}
										onSetValue={(value, fieldName) => onEditNodeKeyValue(index, value, fieldName)}
										datasources={props.datasources}
										viewMode={metaInfo.viewMode}
										isInFlowEditor={props.isInFlowEditor}
										payload={props.payload}
										listItem={listItem}																			
										editIndex={editIndex}
										onEditItem={onEditItem}
										metaInfo={metaInfo}
										isBeingSorted={false}
										deleteClick={deleteClick}
										onEditNodeKeyValue={onEditNodeKeyValue}
									/>									
								})
							}
							</SortableContext>
							<DragOverlay>
								{activeId >= 0 ? <Item id={activeId.toString()}
									style={{}}
									children={{}}	
									listeners={{}}		
									index={activeId}
									node={{...formControl.value[activeId], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + activeId, 
										id: props.node.name + "-edit-" + activeId}}
									isObjectListNodeEditing={true}
									onSetValue={(value, fieldName) => onEditNodeKeyValue(activeId, value, fieldName)}
									datasources={props.datasources}
									viewMode={"table-dragging"}
									payload={props.payload}
									listItem={formControl.value[activeId]}

									isInFlowEditor={props.isInFlowEditor}
									editIndex={editIndex}
									onEditItem={onEditItem}
									metaInfo={metaInfo}
									isBeingSorted={false}
									deleteClick={deleteClick}
									onEditNodeKeyValue={onEditNodeKeyValue}		
								></Item> : null}
							</DragOverlay>
						</DndContext>
					</tbody>
				</table>
			: <DndContext 
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext 
					items={formControl.value}
					strategy={verticalListSortingStrategy}
				>{Array.isArray(formControl.value) && formControl.value.map((listItem, index) => {
					return <SortableItem 
							key={"viewmode-list-" + index} 
							id={index.toString()} 
							index={index}
							node={{...formControl.value[index], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + index, id: props.node.name + "-edit-" + index}}
							isObjectListNodeEditing={true}
							onSetValue={(value, fieldName) => onEditNodeKeyValue(index, value, fieldName)}
							datasources={props.datasources}
							viewMode={metaInfo.viewMode}
							payload={props.payload}
							listItem={listItem}									
							isInFlowEditor={props.isInFlowEditor}
							editIndex={editIndex}
							isBeingSorted={index == activeId}
							onEditItem={onEditItem}
							metaInfo={metaInfo}
							deleteClick={deleteClick}
							onEditNodeKeyValue={onEditNodeKeyValue}
						/>
					})
				}
				</SortableContext>
				<DragOverlay>
					{activeId >= 0 ? <Item id={activeId.toString()}
						style={{}}						
						children={{}}		
						listeners={{}}	
						index={activeId}
						node={{...formControl.value[activeId], metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-edit-" + activeId, 
							id: props.node.name + "-edit-" + activeId}}
						isObjectListNodeEditing={true}
						onSetValue={(value, fieldName) => onEditNodeKeyValue(activeId, value, fieldName)}
						datasources={props.datasources}
						viewMode={"dragging"}
						payload={props.payload}
						listItem={formControl.value[activeId]}									
						isInFlowEditor={props.isInFlowEditor}
						editIndex={editIndex}
						onEditItem={onEditItem}
						metaInfo={metaInfo}
						deleteClick={deleteClick}
						isBeingSorted={false}
						onEditNodeKeyValue={onEditNodeKeyValue}		
					></Item> : null}
				</DragOverlay>
				</DndContext>
			}</>}
			{isAdding ?
				<div className="form-control__object-list-node">
					<FormNodeHtmlPlugin 
						node={{...newValue, metaInfo:props.metaInfo.metaInfo, name: props.node.name + "-add", id: props.node.name + "-add"}}
						isObjectListNodeEditing={true}
						isInFlowEditor={props.isInFlowEditor}
						onSetValue={onAddNodeKeyValue}
						datasources={props.datasources}
					></FormNodeHtmlPlugin>
					<div className="form-control__object-list-node-controls">
						<button onFocus={onFocus} onClick={onAppendValue} className="btn btn-primary mr-2">Add</button>
						<button onFocus={onFocus} onClick={onCloseAppendValue} className="btn btn-outline-primary">Close</button>
					</div>
				</div> :
				<div>
					<a href="#" onFocus={onFocus} onClick={addItem} className="fas fa-plus-circle"></a>
				</div>
			}
	</div>;
}