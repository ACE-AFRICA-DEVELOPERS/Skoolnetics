"use strict";

var _api = require("./api.js");

var total = (0, _api.selector)("#total-paid");
total.addEventListener("click", function (event) {
  event.preventDefault();
  var target = [];
  Array.from((0, _api.selectAll)(".check")).map(function (e, i) {
    if (e.checked) {
      target.push(Number(e.id));
    }
  });
  var sum = target.reduce(function (a, b) {
    return a + b;
  });
  (0, _api.selector)("#totalPayment").textContent = "#".concat(sum.toLocaleString());
});