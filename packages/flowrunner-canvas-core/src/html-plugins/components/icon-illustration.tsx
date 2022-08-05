import * as React from 'react';

import { ReactComponent as IconMap } from '@devhelpr/flowrunner-canvas-icons/src/lib/icon-map-event.svg';
import { ReactComponent as IconFilter } from '@devhelpr/flowrunner-canvas-icons/src/lib/icon-filter-event.svg';
import { ReactComponent as IconReduce } from '@devhelpr/flowrunner-canvas-icons/src/lib/icon-reduce-event.svg';
import { ReactComponent as IconLightning } from '@devhelpr/flowrunner-canvas-icons/src/lib/icon-bolt-lightning.svg';

export interface IIconIllustrationProps {
  iconIllustration: string;
}
export const IconIllustration = (props: IIconIllustrationProps) => {
  return (
    <>
      {props.iconIllustration === 'map' && (
        <div className="tw-w-100 icon-wrapper">
          <IconMap />
        </div>
      )}
      {props.iconIllustration === 'filter' && (
        <div className="tw-w-100 icon-wrapper">
          <IconFilter />
        </div>
      )}
      {props.iconIllustration === 'reduce' && (
        <div className="tw-w-100 icon-wrapper">
          <IconReduce />
        </div>
      )}
      {props.iconIllustration === 'event' && (
        <div className="tw-w-100 icon-wrapper">
          <IconLightning />
        </div>
      )}
    </>
  );
};
