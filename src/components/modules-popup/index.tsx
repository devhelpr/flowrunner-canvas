import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { Modal, Button } from 'react-bootstrap';

import { useModulesStateStore } from '../../state/modules-menu-state';
import { IFlowrunnerConnector } from '../../interfaces/IFlowrunnerConnector';
import { TestsModule } from '../modules/tests-module';

export interface ModulesPopupProps {
	onClose : () => void;
	flowrunnerConnector : IFlowrunnerConnector;
}

export const ModulesPopup = (props: ModulesPopupProps) => {
	const [show, setShow] = useState(false);
	const modulesMenu = useModulesStateStore();
	const containerRef = useRef(null);

	useEffect(() => {
		// this is needed to prevent unnessary rerender because of the container ref reference
		// when this is not here, the component rerenders after first input in input controls
		setShow(true);

	}, []);

	return <>
		<div ref={containerRef}></div>
		<Modal 
			show={show} 
			centered 
			size={"lg"} 
			container={containerRef.current}>
			<Modal.Header>
				<Modal.Title>{modulesMenu.selectedModule}</Modal.Title>
			</Modal.Header>
		
			<Modal.Body>
				{modulesMenu.selectedModule == "tests" &&
					<TestsModule flowrunnerConnector={props.flowrunnerConnector}></TestsModule>}
			</Modal.Body>
		
			<Modal.Footer>
				<Button variant="secondary" onClick={props.onClose}>Close</Button>				
			</Modal.Footer>
		</Modal>
	</>;
}
