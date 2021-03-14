const analyzeButton = document.querySelector("#analyze");
const outputTextarea = document.querySelector("#output");

analyzeButton.addEventListener("click", function () {
  const text = document.querySelector("#code").value;
  const output = process(text);
  console.log(output);
  outputTextarea.value = output;
});

function process(text) {
  const list = esprima.parseScript(text).body;
  // console.log(JSON.stringify(list, null, 2));
  let output = list.map((tree) => getFunction(tree)).join("");
  output += "\n\n" + getJQueryEventListeners(text);
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
