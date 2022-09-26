import * as React from 'react';

import { IconMapEvent } from '@devhelpr/flowrunner-canvas-icons';
import { IconFilterEvent } from '@devhelpr/flowrunner-canvas-icons';
import { IconReduceEvent } from '@devhelpr/flowrunner-canvas-icons';
import { IconBoltLightning } from '@devhelpr/flowrunner-canvas-icons';

export interface IIconIllustrationProps {
  iconIllustration: string;
}
export const IconIllustration = (props: IIconIllustrationProps) => {
  return (
    <>
      {props.iconIllustration === 'map' && (
        <div className="tw-w-100 icon-wrapper">
          <IconMapEvent />
        </div>
      )}
      {props.iconIllustration === 'filter' && (
        <div className="tw-w-100 icon-wrapper">
          <IconFilterEvent />
        </div>
      )}
      {props.iconIllustration === 'reduce' && (
        <div className="tw-w-100 icon-wrapper">
          <IconReduceEvent />
        </div>
      )}
      {props.iconIllustration === 'event' && (
        <div className="tw-w-100 icon-wrapper">
          <IconBoltLightning />
        </div>
      )}
    </>
  );
};
