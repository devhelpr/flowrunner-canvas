import * as React from 'react';
import { replaceValues } from '../../helpers/replace-values';
import DOMPurify from 'dompurify';

export interface TextProps {
	node : any;
	payloads : any[];
}

export interface TextState {
	
}
interface IElementProps {
	tag: string;
	value: string;
	cssClassName: string;
}

class Element extends React.Component<IElementProps> {
	override render() {
		return React.createElement(this.props.tag, 
			{
				className : this.props.cssClassName
			}, 
			this.props.value);
	}
}

export class RichText extends React.Component<TextProps, TextState> {
	override state = {
				
	}

	createMarkup = (html) => {
		return  {
			__html: DOMPurify.sanitize(html)
		}
	}

	override render() {
		let data = "";
		if (this.props.payloads.length > 0) {
			let payload = this.props.payloads[this.props.payloads.length - 1];
			if (this.props.node.propertyName && payload[this.props.node.propertyName]) {						
				data = payload[this.props.node.propertyName];
			} else 
			if (!!this.props.node.replaceValues) {
				data = replaceValues(this.props.node.template, payload);
			}			
		}
		let afterLabel = "";
		if (this.props.node.afterLabel) {
			afterLabel = this.props.node.afterLabel;
		}
		return <div className="h-auto d-flex align-items-center justify-content-center">
			<div className={"richtext-visualizer " + this.props.node.cssClassName || ""} 
				dangerouslySetInnerHTML={this.createMarkup((data || "").trim() + afterLabel)}></div>
		</div>;
	}
}