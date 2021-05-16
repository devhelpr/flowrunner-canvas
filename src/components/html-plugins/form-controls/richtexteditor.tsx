import * as React from 'react';
import { useState, useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import {  useFormControlFromCode } from './use-form-control';
import { EditorState, convertFromRaw, ContentState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { convertToHTML } from 'draft-convert';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import DOMPurify from 'dompurify';
import { onFocus } from './helpers/focus';

export const RichTextEditor = (props: IFormControlProps) => {
	const {metaInfo, node} = props;
	const [editorState, setEditorState] = useState(
		() => {
			const contentBlock = htmlToDraft(props.value || "");
			if (contentBlock) {
				const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
				const editorState = EditorState.createWithContent(contentState);
				return editorState;
			} else {
				return EditorState.createEmpty();
			}
		}
	);

	let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);
	
	useEffect(() => {		
		const result = convertContentToHTML();
		formControl.handleChangeByValue(result);
	}, [editorState]);

	useEffect(() => {

		try {		
			let currentHtml = convertToHTML(editorState.getCurrentContent());
			
			if (currentHtml.trim() == props.value.trim()) {
				return;
			}

			const contentBlock = htmlToDraft(props.value);
			if (contentBlock) {
				const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
				const newEditorState = EditorState.createWithContent(contentState);

				const currentSelection = editorState.getSelection();
				const stateWithContentAndSelection = EditorState.forceSelection(editorState, currentSelection);
				setEditorState(stateWithContentAndSelection);
				/*			
				setEditorState(newEditorState);		
				*/
			}		
		} catch (err) {
			console.log(`Error in Richtexteditor useEffect ${err}`);
		} 
	}, [props.value]);


	const handleEditorChange = (state) => {
		setEditorState(state);
	}

	const convertContentToHTML = () => {
		return draftToHtml(convertToRaw(editorState.getCurrentContent()));
	}

	const createMarkup = (html) => {
		return  {
		  __html: DOMPurify.sanitize(html)
		}
	  }

	return <div className="form-group">						
			<label><strong>{metaInfo.label || metaInfo.fieldName || node.name}</strong>{!!metaInfo.required && " *"}</label>
			
			<Editor
				name={metaInfo.fieldName}
				editorState={editorState}
				onEditorStateChange={handleEditorChange}
				wrapperClassName="wrapper-class"
				editorClassName="editor-class"
				toolbarClassName="toolbar-class"
				onFocus={onFocus}
			/>
			<div className="preview" dangerouslySetInnerHTML={createMarkup(draftToHtml(convertToRaw(editorState.getCurrentContent())))}></div>
	</div>;
}