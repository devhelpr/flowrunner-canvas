import * as React from 'react';
import { replaceValues } from '../../helpers/replace-values';

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
	render() {
		return React.createElement(this.props.tag, 
			{
				className : this.props.cssClassName
			}, 
			this.props.value);
	}
}

export class Text extends React.Component<TextProps, TextState> {
	state = {
				
	}

	render() {
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

		if (!!this.props.node.asElement) {
			return <Element cssClassName={this.props.node.cssClassName} tag={this.props.node.htmlElement} value={ data + afterLabel}></Element>
		}
		
		return <div className="h-auto d-flex align-items-center">
			{this.props.node.cssClassName ? <span className={this.props.node.cssClassName}>{data}{afterLabel}</span> :
				<strong className={"h1 font-weight-bolder text-wrap" + this.props.node.cssClassName || ""}>{data}{afterLabel}</strong>}
		</div>;
	}
}