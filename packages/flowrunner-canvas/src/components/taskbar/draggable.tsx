import React from 'react';
import {useDraggable} from '@dnd-kit/core';

export const Draggable = (props) => {
  const {isDragging, attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });
  /*
  // DONT add style to draggable task.. because it will screw up the taskbar
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  */
  
  return (
    <button ref={setNodeRef} className="taskbar-draggable" {...listeners} {...attributes}>
      {props.children}
    </button>
  );
}