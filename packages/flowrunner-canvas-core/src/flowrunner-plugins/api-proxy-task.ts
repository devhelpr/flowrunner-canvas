import { FlowTask, FlowEventRunner } from '@devhelpr/flowrunner';
import { replaceValues } from '../helpers/replace-values';

export class ApiProxyTask extends FlowTask {
  public override execute(node: any, services: any) {
    const promise = new Promise((resolve, reject) => {
      node.payload = Object.assign({}, node.payload);
      let headers: any = {};
      if (node.headers) {
        Object.keys(node.headers).forEach((headerName) => {
          headers[headerName] = replaceValues(node.headers[headerName], node.payload, true);
        });
      }

      let body: any = undefined;
      // sendPayloadProperties
      if (!!node.sendPayloadToApi) {
        body = node.payload;
        if (node.sendPayloadProperties) {
          body = {};

          node.sendPayloadProperties.forEach((propertyName) => {
            body[propertyName] = node.payload[propertyName];
          });
        }
      }
      try {
        fetch('/api/proxy', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: replaceValues(node.url, node.payload, true),
            body: body,
            httpMethod: node.httpMethod || 'get',
            headers: headers,
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
