"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.on = on;
exports.off = off;
exports.isFunction = isFunction;
exports.isNumeric = isNumeric;
exports.position = position;
exports.width = width;
exports.height = height;
exports.outerWidthWithMargin = outerWidthWithMargin;
exports.outerHeightWithMargin = outerHeightWithMargin;
exports.closest = closest;
exports.assign = assign;
exports.get = get;
exports.findMostOften = findMostOften;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @fileOverview jQuery replacement
 * @author jasonslyvia
 */
function on(el, eventName, callback) {
  if (el.addEventListener) {
    el.addEventListener(eventName, callback, false);
  } else if (el.attachEvent) {
    el.attachEvent("on".concat(eventName), function (e) {
      callback.call(el, e || window.event);
    });
  }
}

function off(el, eventName, callback) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, callback);
  } else if (el.detachEvent) {
    el.detachEvent("on".concat(eventName), callback);
  }
}

function isFunction(func) {
  return typeof func === 'function';
}

function isNumeric(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

function position(el) {
  if (!el) {
    return {
      left: 0,
      top: 0
    };
  }

  return {
    left: el.offsetLeft,
    top: el.offsetTop
  };
}

function width(el) {
  return el.offsetWidth;
}

function height(el) {
  return el.offsetHeight;
}

function outerWidthWithMargin(el) {
  var _width = el.offsetWidth;
  var style = el.currentStyle || getComputedStyle(el);
  _width += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
  return _width;
}

function outerHeightWithMargin(el) {
  var _height = el.offsetHeight;
  var style = el.currentStyle || getComputedStyle(el);
  _height += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
  return _height;
}

function hasClass(elClassName, className) {
  return " ".concat(elClassName, " ").replace(/[\n\t]/g, ' ').indexOf(" ".concat(className, " ")) > -1;
}

function closest(el, className) {
  className = className.replace(/^[\b\.]/, '');

  var finder = function finder(_el, _className) {
    var _elClassName = _typeof(_el.className) === 'object' ? _el.className.baseVal : _el.className;

    if (_elClassName && hasClass(_elClassName, _className)) {
      return _el;
    } else if (_el.parentNode === null) {
      // matches document
      return null;
    }

    return finder(_el.parentNode, _className);
  };

  return finder(el, className);
}

function assign(target) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);

  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];

    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    var keysArray = Object.keys(Object(nextSource));

    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }

  return to;
}

function get(selector) {
  return document.querySelector(selector);
}

function findMostOften(arr) {
  var obj = {};
  arr.forEach(function (i) {
    obj[i] = obj[i] ? obj[i] + 1 : 1;
  });
  return Object.keys(obj).sort(function (a, b) {
    return obj[b] - obj[a];
  })[0];
}