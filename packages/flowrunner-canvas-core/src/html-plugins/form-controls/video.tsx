import * as React from 'react';
import { useEffect } from 'react';

import { IFormControlProps } from './form-control-interface';
import { useFormControlFromCode } from './use-form-control';

export const Video = (props: IFormControlProps) => {
  const { metaInfo, node } = props;
  let formControl = useFormControlFromCode(props.value, metaInfo, props.onChange);

  useEffect(() => {
    formControl.setValue(props.value);
  }, [props.value]);

  // {props.payload?.imageUrl ?? metaInfo.defaultValue}
  // https://youtu.be/0rWAszqVyJo
  return (
    <div className="form-group">      
      <iframe
	 	 id={'video-' + props.node.name + '-' + metaInfo.fieldName}
        width="560"
        height="315"
		className="tw-w-full tw-h-auto tw-aspect-[560/315]"
        src="https://www.youtube.com/embed/0rWAszqVyJo"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};
