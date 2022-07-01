/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["flowcanvaswebpackJsonpPlugin"] = self["flowcanvaswebpackJsonpPlugin"] || []).push([["src_components_html-plugins_visualizers_richtext_tsx"],{

/***/ "./src/components/html-plugins/visualizers/richtext.tsx":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"RichText\": () => (/* binding */ RichText)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"../../node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _helpers_replace_values__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/helpers/replace-values.ts\");\n/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(\"../../node_modules/dompurify/dist/purify.js\");\n/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(dompurify__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nclass Element extends react__WEBPACK_IMPORTED_MODULE_0__.Component {\n  render() {\n    return react__WEBPACK_IMPORTED_MODULE_0__.createElement(this.props.tag, {\n      className: this.props.cssClassName\n    }, this.props.value);\n  }\n}\nclass RichText extends react__WEBPACK_IMPORTED_MODULE_0__.Component {\n  constructor() {\n    super(...arguments);\n    this.state = {};\n    this.createMarkup = (html) => {\n      return {\n        __html: dompurify__WEBPACK_IMPORTED_MODULE_2___default().sanitize(html)\n      };\n    };\n  }\n  render() {\n    let data = \"\";\n    if (this.props.payloads.length > 0) {\n      let payload = this.props.payloads[this.props.payloads.length - 1];\n      if (this.props.node.propertyName && payload[this.props.node.propertyName]) {\n        data = payload[this.props.node.propertyName];\n      } else if (!!this.props.node.replaceValues) {\n        data = (0,_helpers_replace_values__WEBPACK_IMPORTED_MODULE_1__.replaceValues)(this.props.node.template, payload);\n      }\n    }\n    let afterLabel = \"\";\n    if (this.props.node.afterLabel) {\n      afterLabel = this.props.node.afterLabel;\n    }\n    return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", {\n      className: \"h-auto d-flex align-items-center justify-content-center\"\n    }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", {\n      className: \"richtext-visualizer \" + this.props.node.cssClassName || 0,\n      dangerouslySetInnerHTML: this.createMarkup((data || \"\").trim() + afterLabel)\n    }));\n  }\n}\n\n\n//# sourceURL=webpack://@devhelpr/flowrunner-canvas/./src/components/html-plugins/visualizers/richtext.tsx?");

/***/ })

}]);