import React, {forwardRef} from 'react';

export interface DragginTaskProps {
	id? : string | undefined;
	style : any;
	children: React.ReactNode;
	listeners : any;
}
export const DragginTask = forwardRef((props: DragginTaskProps, ref?: any) => {
  	return <div {...props} ref={ref} className="taskbar__task">
		<div className="taskbar__taskname">{props.id}</div>
	</div>;
});