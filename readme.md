DON'T USE except for experiments! Still in active development

# What is Flowrunner-canvas?

Flowrunner-canvas is a flow based programming environment that can be used standalone but also very easily be added to an existent frontend javascript/typescript toolchain. 
When used standalone it can be used without writing code, but it is extendable in various ways depending on your needs.

Flowrunner-canvas is a visual editor for creating flows that can be run with the @devhelpr/flowrunner npm package. It runs within your dev environment in the browser, locally on a dev machine,

Flowrunner-canvas can use Nodejs express to add some basic http services to read and store the flows on the location where you specify it to be stored. But this is not a requirement, it can also use a custom storage provider, and a localstorage provider is provided.

The basic flowrunner-canvas just uses the standard flowrunner taskplugins, but you can add plugins depending on your needs.

[Codesandbox](https://codesandbox.io/s/flowrunner-canvas-wljy9)

[Codesandbox wasm-tixy](https://codesandbox.io/s/flowrunner-canvas-wasm-example-p68pz)

# The simplest way to start playing with flowrunner-canvas

- clone this github repo
- yarn install
- npx gulp

# Using create-react-app

- npx create-react-app flow-app --template typescript
- cd flow-app
- yarn add @devhelpr/flowrunner-canvas@latest
- replace the code in src/App.tsx with:

```
import {
  FlowrunnerCanvas,
  flowrunnerLocalStorageProvider
} from "@devhelpr/flowrunner-canvas";

import "@devhelpr/flowrunner-canvas/assets/fira_code.css";
import "@devhelpr/flowrunner-canvas/assets/bootstrap.min.css";
import "@devhelpr/flowrunner-canvas/assets/react-draft-wysiwyg.css";
import "@devhelpr/flowrunner-canvas/assets/main.css";

export default () => {
  return (
    <FlowrunnerCanvas
      flowStorageProvider={flowrunnerLocalStorageProvider}
    ></FlowrunnerCanvas>
  );
}
```

- yarn start

This starts a flowrunner-canvas editors which stores its flow locally

# Ways to use flowrunner-canvas

- as a playground to prototype applications
- together with the layout editor, build an application with it
- as a flow editor for other applications like a backend app with
	its own flowrunner

# Publish and build instruction in case you want to contribute to flowrunner-canvas itself

- npx gulp 

	(also needed before publishing a new version)

- npm version [new version number]
- npm publish

# Esbuild experimental builder

npx gulp esbuild