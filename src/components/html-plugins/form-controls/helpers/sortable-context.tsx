import React from 'react';
import {useSortable,
	AnimateLayoutChanges,
	defaultAnimateLayoutChanges
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {Item} from './item';

export interface SortableItemProps {
	id : string;	

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
	isInFlowEditor: boolean;

	isBeingSorted: boolean;
}
export function SortableItem(props : SortableItemProps) {
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    args.isSorting || args.wasSorting
      ? defaultAnimateLayoutChanges(args)
      : true;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id, animateLayoutChanges});
  
  /*const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  */

  const style = {
    '--translate-x': transform ? transform.x : 0,
    '--translate-y': transform ? transform.y : 0,
    transition,
  };
  //console.log("SortableItem", style);
  // WHY is the transform not changing when sorting???
  return (
    <Item ref={setNodeRef} style={style} {...attributes} 
		listeners={{...listeners}}
		id={props.id}
		node={props.node}
		isObjectListNodeEditing={props.isObjectListNodeEditing}	
		onSetValue={props.onSetValue}
		datasources={props.datasources}
		viewMode = {props.viewMode}
		payload = {props.payload}
		listItem = {props.listItem}
		index = {props.index}
		isInFlowEditor = {props.isInFlowEditor}
		editIndex = {props.editIndex}
		onEditItem = {props.onEditItem}
		metaInfo = {props.metaInfo}
		deleteClick = {props.deleteClick}
		onEditNodeKeyValue = {props.onEditNodeKeyValue}
		isBeingSorted={props.isBeingSorted}
	>      
    </Item>
  );
}