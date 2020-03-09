export const replaceValues = (content : string, payload : any) => {
	let resultContent = content;
	let matches = resultContent.match(/{.+?}/g);
	if (matches) {
		matches.map((match) => {
			const matchValue = match.slice(1, -1);
			const splittedValues = matchValue.split(":");
			const variableName = splittedValues[0];
			let value = payload[variableName];
			if (splittedValues.length > 1) {
				const format = splittedValues[1];
				if (format == "currency") {
					value = parseFloat(value).toFixed(2).replace(".",",");
				} else 
				if (format == "integer") {
					value = parseFloat(value).toFixed(0);
				}
			} 
			const allOccurancesOfMatchRegex = new RegExp(match, 'g');
			resultContent = resultContent.replace(allOccurancesOfMatchRegex, value);
		});
	}
	return resultContent;
}