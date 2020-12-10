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
  (0, _api.selector)("#totalPayment").textContent = "Pay ".concat(sum.toLocaleString());
});

function showPayment() {
  var x = document.getElementById("payment");

  if (x.style.display == "none") {
    x.style.display == "block";
  } else {
    x.style.display = "none";
  }
}