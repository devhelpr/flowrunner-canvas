import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { Modal, Button } from 'react-bootstrap';

import { useModulesStateStore } from '@devhelpr/flowrunner-canvas-core';
import { IFlowrunnerConnector } from '@devhelpr/flowrunner-canvas-core';

import { TestsModule } from '../modules/tests-module';
import { CrudModule } from '../modules/crud-module';
import { ObjectModule } from '../modules/object-module';

export interface ModulesPopupProps {
	onClose : () => void;
	flowrunnerConnector : IFlowrunnerConnector;
}

export const ModulesPopup = (props: ModulesPopupProps) => {
	const [preshow, setPreShow] = useState(false);
	const [show, setShow] = useState(false);
	const modulesMenu = useModulesStateStore();
	const containerRef = useRef(null);

	useLayoutEffect(() => {
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls
		setPreShow(true);
	}, [preshow]);

	useEffect(() => {
		setShow(true);
	}, []);

	return <>
		<div ref={containerRef}></div>
		<Modal 
			show={show} 
			centered 
			size={"xl"} 
			container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>{modulesMenu.selectedModule}</Modal.Title>
			</Modal.Header>
		
			<Modal.Body>
				{modulesMenu.selectedModule == "tests" &&
					<TestsModule flowrunnerConnector={props.flowrunnerConnector}></TestsModule>}
				{modulesMenu.selectedModule != "tests" && modulesMenu.selectedModule != "" &&
					modulesMenu.moduleType == "crud-model" &&
					<CrudModule></CrudModule>}
				{modulesMenu.selectedModule != "tests" && modulesMenu.selectedModule != "" &&
					modulesMenu.moduleType == "object-model" &&
					<ObjectModule></ObjectModule>}	
			</Modal.Body>
		
			<Modal.Footer>
				<a href="#" className="btn btn-secondary" onClick={props.onClose}>Close</a>				
			</Modal.Footer>
		</Modal>
	</>;
}
