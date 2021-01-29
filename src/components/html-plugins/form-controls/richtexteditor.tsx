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
		
		//console.log("RichTextEditor useeffect editorState");

		const result = convertContentToHTML();
		//console.log("handleEditorChange editorState", result);
		formControl.handleChangeByValue(result);
	}, [editorState]);

	useEffect(() => {
		let currentHtml = convertToHTML(editorState.getCurrentContent());
		
		if (currentHtml.trim() == props.value.trim()) {
			//console.log("RichTextEditor useeffect equal!");
			return;
		}
		//console.log("RichTextEditor useeffect", currentHtml, props.value);

		const contentBlock = htmlToDraft(props.value);
		if (contentBlock) {
			const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
			const editorState = EditorState.createWithContent(contentState);
			setEditorState(editorState);
		}		
	}, [props.value]);


	const handleEditorChange = (state) => {
		setEditorState(state);
	}

	const convertContentToHTML = () => {
		//let currentContentAsHTML = convertToHTML(editorState.getCurrentContent());
		//setConvertedContent(currentContentAsHTML);
		//return currentContentAsHTML;

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
			/>
			<div className="preview" dangerouslySetInnerHTML={createMarkup(draftToHtml(convertToRaw(editorState.getCurrentContent())))}></div>
	</div>;
}