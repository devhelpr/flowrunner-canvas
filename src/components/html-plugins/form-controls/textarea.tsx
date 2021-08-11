import * as React from 'react';
import { useState, useEffect , useRef, useLayoutEffect} from 'react';
import { onFocus } from './helpers/focus';

import { IFormControlProps } from './form-control-interface';
import { useFormControl } from './use-form-control';

export const Textarea = (props: IFormControlProps) => {
	const textAreaRef = useRef(null);
	const [minRows, setMinRows] = useState(2);
	const [maxRows, setMaxRows] = useState(30);
	const [rows, setRows] = useState(2);
	const {metaInfo, node} = props;
	let formControl = useFormControl(props.value, metaInfo, props.onChange);
	
	useEffect(() => {
		console.log("calculateTextareaHeight on mount");
		//calculateTextareaHeight();
	}, []);
	
	useLayoutEffect(() => {
		formControl.setValue(props.value);
		//console.log("Textarea", props.value, props);
		//calculateTextareaHeight();
	}, [props.value]);
	/*
	useEffect(() => {
		//formControl.setValue(props.value);
		//console.log("Textarea", props.value, props);
		//calculateTextareaHeight();
	}, [props.value]);
	*/

	const calculateTextareaHeight = () => {
        if (textAreaRef && textAreaRef.current) {
			console.log("TEXTAREA calculateTextareaHeight");
            const textareaLineHeight = 24;            
            if (textAreaRef.current != null) {
				const textArea = (textAreaRef.current as any);
				const previousRows = textArea.rows;
				textArea.rows = minRows; 
				const currentRows = Math.floor(textArea.scrollHeight / textareaLineHeight);
				console.log("TEXTAREA calculateTextareaHeight", textArea.scrollHeight, textareaLineHeight,  textArea.rows, currentRows);
				if (currentRows === previousRows) {
					textArea.rows = currentRows;
				}
				
				if (currentRows >= maxRows) {
					textArea.rows = maxRows;
					textArea.scrollTop = textArea.scrollHeight;
				}
				
				setRows(currentRows < maxRows ? currentRows : maxRows);   
			}
        } else {
			console.log("TEXTAREA REF is nog niet gezet in calculateTextareaHeight");
		}
	}
	
	const onChange= (event) => {
		event.preventDefault();
		formControl.onChange(event);
		console.log("calculateTextareaHeight onchange");

		//calculateTextareaHeight();
		return false;
	}

	return <div className="form-group">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong>{!!metaInfo.required && " *"}</label>
			<textarea 				
				className="form-control"
				name={metaInfo.fieldName} 							
				value={formControl.value} 
				onChange={onChange}
				onFocus={onFocus}
				readOnly={!props.selected}
				rows={props.node.rows || metaInfo.rows || 3}
				ref={ref => ((textAreaRef as any).current = ref)} 
			></textarea>
	</div>;
}