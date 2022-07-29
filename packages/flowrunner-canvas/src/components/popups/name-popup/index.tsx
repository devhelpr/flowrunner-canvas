import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';


export interface NamePopupProps {
	nameCaption: string;
	onClose : () => void;
	onSave: (name : string) => void;
}

export const NamePopup = (props: NamePopupProps) => {
	const [preshow, setPreShow] = useState(false);
	const [show, setShow] = useState(false);
	const [value, setValue] = useState("");
	const containerRef = useRef(null);

	useLayoutEffect(() => {
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls
		setPreShow(true);
	}, [preshow]);

	useEffect(() => {
		setShow(true);
	}, []);

	const onSave= (e) => {
		if (value === "") {
			alert(`${props.nameCaption} is required.`);
		} else {
			props.onSave(value);
		}
		e.preventDefault();
		return false;
	}
	
	const onChangeName = (event) => {
		event.preventDefault();
		setValue(event.target.value);
		return false;

	}
	
	return <>
		<div ref={containerRef}></div>
		<Modal 
			show={show} 
			centered 
			size={"sm"} 
			container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>Edit {props.nameCaption}</Modal.Title>
			</Modal.Header>
		
			<Modal.Body>
				<div className="form-group">
					<label>{props.nameCaption}</label>
					<input className="form-control"
						value={value} 
						required
						onChange={onChangeName}
					></input>
				</div>				
			</Modal.Body>
		
			<Modal.Footer>
				<Button variant="secondary" onClick={props.onClose}>Close</Button>
				<Button variant="primary" onClick={onSave}>OK</Button>
			</Modal.Footer>
		</Modal>
	</>;
}
