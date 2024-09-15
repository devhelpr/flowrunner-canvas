
***this project is deprecated***



# The simplest way to start playing with flowrunner-canvas

- clone this github repo
- this is a monorepo, run from root of this repo:
- yarn install
- yarn start (under the hood this runs: nx serve code-flow-canvas)
- in other tab: yarn startapi
  
## project setup

- monorepo using nx
- react/express/postcss/tailwind
- libraries used that will be replaced by tailwind/custom : 
  - material-ui
  - bootstrap v5 / react-bootstrap
  
## publising steps

- commit & push all changes

from workspace root:

- yarn nx build
- yarn versionandpublishpackages

	webapps that use flowrunner-canvas need :

	<link
      rel="stylesheet"
      href=".../bootstrap.min.css"
    />
    <link
      rel="stylesheet"
      href=".../fira_code.css"
    />
    <link
      rel="stylesheet"
      href=".../react-draft-wysiwyg.css"
    />

	... and other asset from assets

## build code-flow-canvas app

  yarn nx build code-flow-canvas
  ... output staat in ./dist/apps/code-flow-canvas

   
## Create new build-in task

- Create task-plugin in flowrunner-canvas-core/flowrunner-plugins
- Create config in flowrunner-canvas-core/config.ts
- Register task-class with flow.registerTask in flowrunner-canvas-core/flow-tasks and add it to
getDefaultUITasks as well
- (Optional) to add task to taskbar category.. add this to flowrunner-canvas/taskbar (this will change in the near future)

If it has a custom node which needs to be rendered in the flow..
- Create tsx file in flowrunner-canvas-core/html-plugins
- There's a useReceivedPayload hook which returns the payload when received when the node is triggered
- Add component to flowrunner-canvas-core/renderHtmlNode and getNodeInstance
- Does the component need to be visible in user-uiview? add hasUI to config in config.ts

## Create custom task outside flowrunner-canvas-core

If it has only a task-plugin an NO custom node appearance:
- Create task-plugin in app/code-flow-canvas/flow-plugins
- Register task-plugin with registerCustomNodeType in registerCustomPlugins in app/code-flow-canvas/flow-plugins/index.ts (config is specified there as well)

If it has a custom node which needs to be rendered in the flow..
- Creaate tsx file in app/code-flow-canvas/html-plugins
- Register task-plugin and custom node with registerFlowRunnerCanvasPlugin in app/code-flow-canvas/main.tsx (this will change in the near future)
