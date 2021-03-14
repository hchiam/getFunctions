function outer() {
  function inner() {
    function innerInner() {
      function innerInnerInner() {}
    }
  }
  let anotherInner = () => {};
  var yetAnotherInner = () => {};
  const another = function () {};
}

const add = (a, b) => {
  return a + b;
};

const multiply = (a, b, c = 1) => {
  return a * b * c;
};

$(".selector1")
  .off("click")
  .on("click", function () {
    alert();
  });

const el = $(".selector2");
el.off("click").on("click", function () {
  alert();
});
