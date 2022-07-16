# The simplest way to start playing with flowrunner-canvas

- clone this github repo
- this is a monorepo, run from root of this repo:
- yarn install
- yarn start (under the hood this runs: nx serve code-flow-canvas)

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