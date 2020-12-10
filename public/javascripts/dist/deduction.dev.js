"use strict";

var _api = require("./api.js");

var total = (0, _api.selector)("#total-paid");
total.addEventListener("click", function (event) {
  var target = [];
  Array.from((0, _api.selectAll)(".check")).map(function (e, i) {
    if (e.checked) {
      target.push(e.id);
    }
  });
  console.log(target);
});