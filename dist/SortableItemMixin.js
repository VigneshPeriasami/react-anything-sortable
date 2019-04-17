"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function handleSortableItemReadyToMove(e) {
  // if sort handle is defined then only handle sort if the target matches the sort handle
  if (this.props.sortHandle && (0, _utils.closest)(e.target || e.srcElement, this.props.sortHandle) === null) {
    return;
  }

  var target = (0, _utils.closest)(e.target || e.srcElement, '.ui-sortable-item');
  var evt = {
    pageX: e.pageX || e.clientX || e.touches[0].pageX,
    pageY: e.pageY || e.clientY || e.touches[0].pageY,
    offset: (0, _utils.position)(target)
  };

  if (this.props.onSortableItemReadyToMove) {
    this.props.onSortableItemReadyToMove(evt, this.props.sortableIndex);
  }
}

function handleComponentDidMount() {
  var node = _reactDom["default"].findDOMNode(this); // Prevent odd behaviour in legacy IE when dragging


  if (window.attachEvent && !document.body.style['-ms-user-select']) {
    (0, _utils.on)(node, 'selectstart', function (e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    });
  }

  if ((0, _utils.isFunction)(this.props.onSortableItemMount)) {
    this.props.onSortableItemMount((0, _utils.position)(node), (0, _utils.width)(node), (0, _utils.height)(node), (0, _utils.outerWidthWithMargin)(node), (0, _utils.outerHeightWithMargin)(node), this.props.sortableIndex);
  }
}

function handleComponentDidUpdate() {
  var node = _reactDom["default"].findDOMNode(this);

  if ((0, _utils.isFunction)(this.props.onSortableItemMount)) {
    this.props.onSortableItemMount((0, _utils.position)(node), (0, _utils.width)(node), (0, _utils.height)(node), (0, _utils.outerWidthWithMargin)(node), (0, _utils.outerHeightWithMargin)(node), this.props.sortableIndex);
  }
}

var _defaultProps = {
  sortableClassName: '',
  sortableStyle: {},
  onSortableItemMount: function onSortableItemMount() {},
  onSortableItemReadyToMove: function onSortableItemReadyToMove() {}
};
/**
 * @class A factory for generating either mixin or High Order Component
 *        depending if there is an argument passed in
 *
 * @param {React} Component An optinal argument for creating HOCs, leave it
 *                blank if you'd like old mixin
 */

var _default = function _default(Component) {
  if (Component) {
    var _class, _temp;

    return _temp = _class =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(SortableItem, _React$Component);

      function SortableItem() {
        var _getPrototypeOf2;

        var _this;

        _classCallCheck(this, SortableItem);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(SortableItem)).call.apply(_getPrototypeOf2, [this].concat(args)));

        _defineProperty(_assertThisInitialized(_this), "handleSortableItemReadyToMove", function (e) {
          handleSortableItemReadyToMove.call(_assertThisInitialized(_this), e);
        });

        return _this;
      }

      _createClass(SortableItem, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          handleComponentDidMount.call(this);
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
          handleComponentDidUpdate.call(this);
        }
      }, {
        key: "render",
        value: function render() {
          var _this$props = this.props,
              sortableClassName = _this$props.sortableClassName,
              sortableStyle = _this$props.sortableStyle,
              sortableIndex = _this$props.sortableIndex,
              sortHandle = _this$props.sortHandle,
              className = _this$props.className,
              rest = _objectWithoutProperties(_this$props, ["sortableClassName", "sortableStyle", "sortableIndex", "sortHandle", "className"]);

          return _react["default"].createElement(Component, _extends({}, rest, {
            sortable: true,
            className: sortableClassName,
            style: sortableStyle,
            sortHandle: sortHandle,
            onMouseDown: this.handleSortableItemReadyToMove,
            onTouchStart: this.handleSortableItemReadyToMove
          }));
        }
      }]);

      return SortableItem;
    }(_react["default"].Component), _defineProperty(_class, "defaultProps", _defaultProps), _defineProperty(_class, "propTypes", {
      sortableClassName: _propTypes["default"].string,
      sortableStyle: _propTypes["default"].object,
      sortableIndex: _propTypes["default"].number,
      sortHandle: _propTypes["default"].string
    }), _temp;
  }

  return {
    propTypes: {
      sortableClassName: _propTypes["default"].string,
      sortableStyle: _propTypes["default"].object,
      sortableIndex: _propTypes["default"].number,
      sortHandle: _propTypes["default"].string
    },
    getDefaultProps: function getDefaultProps() {
      return _defaultProps;
    },
    handleSortableItemReadyToMove: handleSortableItemReadyToMove,
    componentDidMount: handleComponentDidMount,
    componentDidUpdate: handleComponentDidUpdate,
    renderWithSortable: function renderWithSortable(item) {
      return _react["default"].cloneElement(item, {
        className: this.props.sortableClassName,
        style: this.props.sortableStyle,
        sortHandle: this.props.sortHandle,
        onMouseDown: this.handleSortableItemReadyToMove,
        onTouchStart: this.handleSortableItemReadyToMove
      });
    }
  };
};

exports["default"] = _default;