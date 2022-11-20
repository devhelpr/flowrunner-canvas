import * as React from 'react';
import { useEffect } from 'react';
import { subscribeToTimer } from '../flowrunner-plugins/timer-task';
import { useReceivedPayload } from '../hooks/use-received-payload';

import { IFlowrunnerConnector } from '../interfaces/IFlowrunnerConnector';

export class TimerNodeHtmlPluginInfo {
  getWidth = (node) => {
    return 250;
  };

  getHeight(node) {
    return 250;
  }
}

export interface TimerNodeNodeHtmlPluginProps {
  flowrunnerConnector: IFlowrunnerConnector;
  node: any;
  flow: any;
}

export const TimerNodeNodeHtmlPlugin = (props: TimerNodeNodeHtmlPluginProps) => {
  //const { payload } = useReceivedPayload(props.flowrunnerConnector, props.node, props.flow);
  const [timerRun, setTimerRun] = React.useState(0);

  useEffect(() => {
    let isMounted = true;
    let timer: any = undefined;
    const subscription = subscribeToTimer(props.node.name, (value: string) => {
      if (isMounted) {
        if (timerRun === 0) {
          setTimerRun(1);
        }
        /*
        if (timer === undefined) {
          timer = setTimeout(() => {
            timer = undefined;
            setTimerRun((value) => (value > 0 ? 0 : 1));
          }, 100);
        }
        */
      }
    });
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    };
  }, []);

  return (
    <div className="html-plugin-node tw-bg-white tw-items-center tw-self-center">
      <div
        className={`w-100 h-100 tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-[10rem] tw-duration-[${Math.floor(
          (props.node.interval || 100) / 4,
        )}ms] tw-ease-in-out tw-transition-transform ${timerRun > 0 ? 'trigger' : ''}`}
      >
        <span className="fas fa-clock"></span>
      </div>
      <div>
        <h2 className="tw-mt-2 tw-text-xl">{props.node.interval}ms</h2>
      </div>
    </div>
  );
};
