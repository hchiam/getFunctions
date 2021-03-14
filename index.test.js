const fs = require("fs");
const esprima = require("esprima");

const process = require("./index");

test("works on try.js", () => {
  fs.readFile("try.js", "utf8", (err, text) => {
    if (err) {
      console.error(err);
      return;
    }
    const output = process(text);
    const expected = `outer
  inner
    innerInner
      innerInnerInner
  anotherInner
  yetAnotherInner
  another
add
multiply


$(".selector1")    .on("click"
el    .on("click"
`;

    expect(output).toBe(expected);
  });
});
