import { FlowTask, FlowEventRunner } from '@devhelpr/flowrunner';
import { replaceValues } from '../helpers/replace-values';

export class ApiProxyTask extends FlowTask {
  public override execute(node: any, services: any) {
    const promise = new Promise((resolve, reject) => {
      node.payload = Object.assign({}, node.payload);
      try {
        fetch('/api/proxy', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: replaceValues(node.url, node.payload, true),
            body: !!node.sendPayloadToApi && node.payload,
            httpMethod: node.httpMethod || 'get',
          }),
        })
          .then((res) => {
            if (res.status >= 400) {
              throw new Error('Api-proxy : Bad response from server (' + node.name + ')');
            }
            return res.json();
          })
          .then((response) => {
            if (Array.isArray(response)) {
              resolve({ ...node.payload, result: [...response] });
            } else {
              if (node.prefixOutputProps) {
                let responseObject = {};
                Object.keys(response).forEach((keyName) => {
                  responseObject[`${node.prefixOutputProps}${keyName}`] = response[keyName];
                });
                resolve({ ...node.payload, ...responseObject });
              } else {
                resolve({ ...node.payload, ...response });
              }
            }
          })
          .catch((err) => {
            console.error(err);
            reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
          });
      } catch (err) {
        console.error(err);
        reject('Api-proxy : Bad response from server (' + node.name + ') : ' + err);
      }
    });

    return promise;
  }

  public override getName() {
    return 'ApiProxyTask';
  }
}
