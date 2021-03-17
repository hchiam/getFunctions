const fs = require("fs");
const esprima = require("esprima");
const ts = require("typescript");

module.exports = process;

if (require.main === module) {
  runThisFileDirectly("try.js");
} else {
  // being used as a module via require
}

function runThisFileDirectly(fileName) {
  fs.readFile(fileName, "utf8", (err, text) => {
    if (err) {
      console.error(err);
      return;
    }
    const output = process(tsToJs(text));
    console.log(output);
  });
}

function process(text) {
  const list = esprima.parseScript(text).body;
  // console.log(JSON.stringify(list, null, 2));
  let output = list.map((tree) => getFunction(tree)).join("");
  output += "\n\n" + getJQueryEventListeners(text);
  const functionsSoFar = getFunctionsSoFar(output);
  output += "\n\n" + getMoreFunctions(text, functionsSoFar);
  return output;
}

function getFunction(node, indent = 0) {
  if (!node || typeof node !== "object") return "";
  let output = "";
  output += getFunctionDeclaration(node, indent);
  output += getVariableDeclarationIfArrowFunctionExpression(node, indent);
  return output;
}

function getFunctionDeclaration(node, indent = 0) {
  if (node.type?.toLowerCase().includes("function") && node.id?.name) {
    const functionName = node.id.name;
    const functionLine = `${"  ".repeat(indent)}${functionName}\n`;
    const innerFunctions =
      node.body?.body.map((inner) => getFunction(inner, indent + 1)).join("") ||
      "";
    return functionLine + innerFunctions;
  }
  return "";
}

function getVariableDeclarationIfArrowFunctionExpression(node, indent = 0) {
  if (
    node.type === "VariableDeclaration" &&
    node.declarations?.[0].init?.type?.toLowerCase().includes("function") &&
    node.declarations?.[0].id.name
  ) {
    const functionName = node.declarations[0].id.name;
    const functionLine = `${"  ".repeat(indent)}${functionName}\n`;
    const innerFunctions =
      node.body?.body.map((inner) => getFunction(inner, indent + 1)).join("") ||
      "";
    return functionLine + innerFunctions;
  }
  return "";
}

function getJQueryEventListeners(text) {
  const regexSelectorThenPossibleOffAndThenOn = /\s*?(.+?)(\s|[\r\n])*?(\.off\(.+?\))?(\s|[\r\n])*?(\.on\(("|').+?("|'))/g;
  const matches = text.matchAll(regexSelectorThenPossibleOffAndThenOn);
  const indexOfSelectorGroup = 1;
  const indexOfEventName = 5;
  let output = "";
  for (const match of matches) {
    const selector = match[indexOfSelectorGroup].trim();
    const event = match[indexOfEventName];
    output += `${selector ?? ""}    ${event ?? ""}\n`;
  }
  return output;
}

function getMoreFunctions(text, functionNamesSoFar = new Set()) {
  let output = "";

  const regexFunction = /\s*?function\s*?(\S+?)\s*?\(/g;
  let matches = text.matchAll(regexFunction);
  let indexOfFunctionName = 1;
  for (const match of matches) {
    const functionName = match[indexOfFunctionName].trim();
    if (!functionNamesSoFar.has(functionName)) {
      output += `${functionName}\n`;
      functionNamesSoFar.add(functionName);
    }
  }

  const regexPropEqualsFunction = /\s*?(\S+?)\s*?=\s*?function\s*?\(/g;
  matches = text.matchAll(regexPropEqualsFunction);
  indexOfFunctionName = 1;
  for (const match of matches) {
    const functionName = match[indexOfFunctionName].trim();
    if (!functionNamesSoFar.has(functionName)) {
      output += `${functionName}\n`;
      functionNamesSoFar.add(functionName);
    }
  }

  return output;
}

function getFunctionsSoFar(multilineStringOfFunctionNames) {
  const output = new Set();
  const lines = multilineStringOfFunctionNames.split("\n");
  lines.map((f) => {
    output.add(f.trim());
  });
  return output;
}

function tsToJs(tsCodeString) {
  if (
    typeof ts !== "undefined" ||
    (typeof window !== "undefined" && window.ts)
  ) {
    return ts.transpile(tsCodeString);
  } else {
    return tsCodeString;
  }
}
