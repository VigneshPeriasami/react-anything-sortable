"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _createReactClass = _interopRequireDefault(require("create-react-class"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _utils = require("./utils");

var _SortableItemMixin = _interopRequireDefault(require("./SortableItemMixin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var doc = (typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' ? window.document : {};
var STACK_SIZE = 6;

var getSortTarget = function getSortTarget(child) {
  // `onSortableItemReadyToMove` only exist when using mixins or decorators
  return child && child.props && (0, _utils.isFunction)(child.props.onSortableItemReadyToMove);
};
/**
 * @class Sortable
 */


var Sortable = (0, _createReactClass["default"])({
  displayName: "Sortable",
  propTypes: {
    /**
     * callback fires after sort operation finish
     * function (dataSet){
     *   //dataSet sorted
     * }
     */
    onSort: _propTypes["default"].func,
    className: _propTypes["default"].string,
    sortHandle: _propTypes["default"].string,
    containment: _propTypes["default"].bool,
    dynamic: _propTypes["default"].bool,
    direction: _propTypes["default"].string,
    children: _propTypes["default"].arrayOf(_propTypes["default"].node)
  },
  setArrays: function setArrays(currentChildren) {
    var children = Array.isArray(currentChildren) ? currentChildren : [currentChildren];
    var sortChildren = children.filter(getSortTarget);
    this.sortChildren = sortChildren; // keep tracking the dimension and coordinates of all children

    this._dimensionArr = sortChildren.map(function () {
      return {};
    }); // keep tracking the order of all children

    this._orderArr = [];
    var i = 0;

    while (i < this._dimensionArr.length) {
      this._orderArr.push(i++);
    }
  },
  getInitialState: function getInitialState() {
    this.setArrays(this.props.children);
    return {
      isDragging: false,
      placeHolderIndex: null,
      left: null,
      top: null
    };
  },
  componentDidUpdate: function componentDidUpdate() {
    var container = _reactDom["default"].findDOMNode(this);

    var rect = container.getBoundingClientRect();
    var scrollTop = doc.documentElement && doc.documentElement.scrollTop || doc.body.scrollTop;
    var scrollLeft = doc.documentElement && doc.documentElement.scrollLeft || doc.body.scrollLeft;
    this._top = rect.top + scrollTop;
    this._left = rect.left + scrollLeft;
    this._bottom = this._top + rect.height;
    this._right = this._left + rect.width;
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _this$props = this.props,
        children = _this$props.children,
        dynamic = _this$props.dynamic;

    if (dynamic && nextProps.children !== children) {
      this.setArrays(nextProps.children);
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.unbindEvent();
  },
  bindEvent: function bindEvent() {
    var _this = this;

    // so that the focus won't be lost if cursor moving too fast
    this.__mouseMoveHandler = function (e) {
      /**
       * Since Chrome may trigger redundant mousemove event evne if
       * we didn't really move the mouse, we should make sure that
       * mouse coordinates really changed then respond to mousemove
       * event
       * @see https://code.google.com/p/chromium/issues/detail?id=327114
       */
      if ((e.pageX || e.clientX) === _this._prevX && (e.pageY || e.clientY) === _this._prevY || _this._prevX === null && _this._prevY === null) {
        return false;
      }

      _this.handleMouseMove.call(_this, e);
    };

    this.__mouseUpHandler = function (e) {
      _this.handleMouseUp.call(_this, e);
    };

    this.__touchMoveHandler = function (e) {
      // blocks the default scrolling as we sort an element
      e.preventDefault();

      _this.handleMouseMove.call(_this, {
        target: e.target,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY
      });
    };

    this.__touchEndOrCancelHandler = function (e) {
      _this.handleMouseUp.call(_this, e);
    };

    (0, _utils.on)(doc, 'touchmove', this.__touchMoveHandler);
    (0, _utils.on)(doc, 'touchend', this.__touchEndOrCancelHandler);
    (0, _utils.on)(doc, 'touchcancel', this.__touchEndOrCancelHandler);
    (0, _utils.on)(doc, 'mousemove', this.__mouseMoveHandler);
    (0, _utils.on)(doc, 'mouseup', this.__mouseUpHandler);
  },
  unbindEvent: function unbindEvent() {
    (0, _utils.off)(doc, 'touchmove', this.__touchMoveHandler);
    (0, _utils.off)(doc, 'touchend', this.__touchEndOrCancelHandler);
    (0, _utils.off)(doc, 'touchcancel', this.__touchEndOrCancelHandler);
    (0, _utils.off)(doc, 'mousemove', this.__mouseMoveHandler);
    (0, _utils.off)(doc, 'mouseup', this.__mouseUpHandler);
    this.__mouseMoveHandler = null;
    this.__mouseUpHandler = null;
    this.__touchMoveHandler = null;
    this.__touchEndOrCancelHandler = null;
  },

  /**
   * getting ready for dragging
   * @param  {object} e     React event
   * @param  {index} index of pre-dragging item
   */
  handleMouseDown: function handleMouseDown(e, index) {
    this._draggingIndex = index;
    this._prevX = e.pageX || e.clientX;
    this._prevY = e.pageY || e.clientY;
    this._initOffset = e.offset;
    this._isReadyForDragging = true;
    this._hasInitDragging = false; // start listening mousemove and mouseup

    this.bindEvent();
  },

  /**
   * `add` a dragging item and re-calculating position of placeholder
   * @param  {object} e     React event
   */
  handleMouseMove: function handleMouseMove(e) {
    this._isMouseMoving = true;

    if (!this._isReadyForDragging) {
      return false;
    }

    if (!this._hasInitDragging) {
      this._dimensionArr[this._draggingIndex].isPlaceHolder = true;
      this._hasInitDragging = true;
    }

    if (this.props.containment) {
      var x = e.pageX || e.clientX;
      var y = e.pageY || e.clientY;

      if (x < this._left || x > this._right || y < this._top || y > this._bottom) {
        return false;
      }
    }

    var newOffset = this.calculateNewOffset(e);
    var newIndex = this.calculateNewIndex(e);
    this._draggingIndex = newIndex;
    this.setState({
      isDragging: true,
      top: this.props.direction === 'horizontal' ? this._initOffset.top : newOffset.top,
      left: this.props.direction === 'vertical' ? this._initOffset.left : newOffset.left,
      placeHolderIndex: newIndex
    });
    this._prevX = e.pageX || e.clientX;
    this._prevY = e.pageY || e.clientY;
  },

  /**
   * replace placeholder with dragging item
   */
  handleMouseUp: function handleMouseUp() {
    var _hasMouseMoved = this._isMouseMoving;
    this.unbindEvent();
    var draggingIndex = this._draggingIndex; // reset temp lets

    this._draggingIndex = null;
    this._isReadyForDragging = false;
    this._isMouseMoving = false;
    this._initOffset = null;
    this._prevX = null;
    this._prevY = null;

    if (this.state.isDragging) {
      this._dimensionArr[this.state.placeHolderIndex].isPlaceHolder = false;

      if (_hasMouseMoved) {
        this.setState({
          isDragging: false,
          placeHolderIndex: null,
          left: null,
          top: null
        });
      } // sort finished, callback fires


      if ((0, _utils.isFunction)(this.props.onSort)) {
        var sortData = this.getSortData();
        this.props.onSort(sortData, sortData[draggingIndex], draggingIndex);
      }
    }
  },

  /**
   * when children mounted, return its size(handled by SortableItemMixin)
   * @param  {object} offset {top:1, left:2}
   * @param  {number} width
   * @param  {number} height
   * @param  {number} fullWidth  (with margin)
   * @param  {number} fullHeight (with margin)
   * @param  {number} index
   */
  handleChildUpdate: function handleChildUpdate(offset, width, height, fullWidth, fullHeight, index) {
    (0, _utils.assign)(this._dimensionArr[index], {
      top: offset.top,
      left: offset.left,
      width: width,
      height: height,
      fullWidth: fullWidth,
      fullHeight: fullHeight
    });
  },

  /**
   * get new index of all items by cursor position
   * @param {object} offset {left: 12, top: 123}
   * @param {string} direction cursor moving direction, used to aviod blinking when
   *                 interchanging position of different width elements
   * @return {number}
   */
  getIndexByOffset: function getIndexByOffset(offset, direction) {
    if (!offset || !(0, _utils.isNumeric)(offset.top) || !(0, _utils.isNumeric)(offset.left)) {
      return 0;
    }

    var _dimensionArr = this._dimensionArr;
    var offsetX = offset.left;
    var offsetY = offset.top;
    var prevIndex = this.state.placeHolderIndex !== null ? this.state.placeHolderIndex : this._draggingIndex;
    var newIndex;

    _dimensionArr.every(function (item, index) {
      var relativeLeft = offsetX - item.left;
      var relativeTop = offsetY - item.top;

      if (relativeLeft < item.fullWidth && relativeTop < item.fullHeight) {
        if (relativeLeft < item.fullWidth / 2 && direction === 'left') {
          newIndex = index;
        } else if (relativeLeft > item.fullWidth / 2 && direction === 'right') {
          newIndex = Math.min(index + 1, _dimensionArr.length - 1);
        } else if (relativeTop < item.fullHeight / 2 && direction === 'up') {
          newIndex = index;
        } else if (relativeTop > item.fullHeight / 2 && direction === 'down') {
          newIndex = Math.min(index + 1, _dimensionArr.length - 1);
        } else {
          return true;
        }

        return false;
      }

      return true;
    });

    return newIndex !== undefined ? newIndex : prevIndex;
  },

  /**
   * untility function
   * @param  {array} arr
   * @param  {number} src
   * @param  {number} to
   * @return {array}
   */
  swapArrayItemPosition: function swapArrayItemPosition(arr, src, to) {
    if (!arr || !(0, _utils.isNumeric)(src) || !(0, _utils.isNumeric)(to)) {
      return arr;
    }

    var srcEl = arr.splice(src, 1)[0];
    arr.splice(to, 0, srcEl);
    return arr;
  },

  /**
   * calculate new offset
   * @param  {object} e MouseMove event
   * @return {object}   {left: 1, top: 1}
   */
  calculateNewOffset: function calculateNewOffset(e) {
    var deltaX = this._prevX - (e.pageX || e.clientX);
    var deltaY = this._prevY - (e.pageY || e.clientY);
    var prevLeft = this.state.left !== null ? this.state.left : this._initOffset.left;
    var prevTop = this.state.top !== null ? this.state.top : this._initOffset.top;
    var newLeft = prevLeft - deltaX;
    var newTop = prevTop - deltaY;
    return {
      left: newLeft,
      top: newTop
    };
  },

  /**
   * calculate new index and do swapping
   * @param  {object} e MouseMove event
   * @return {number}
   */
  calculateNewIndex: function calculateNewIndex(e) {
    var placeHolderIndex = this.state.placeHolderIndex !== null ? this.state.placeHolderIndex : this._draggingIndex; // Since `mousemove` is listened on document, when cursor move too fast,
    // `e.target` may be `body` or some other stuff instead of
    // `.ui-sortable-item`

    var target = (0, _utils.get)('.ui-sortable-dragging') || (0, _utils.closest)(e.target || e.srcElement, '.ui-sortable-item');
    var offset = (0, _utils.position)(target);
    var currentX = e.pageX || e.clientX;
    var currentY = e.pageY || e.clientY;
    var deltaX = Math.abs(this._prevX - currentX);
    var deltaY = Math.abs(this._prevY - currentY);
    var direction;

    if (deltaX > deltaY) {
      // tend to move left/right
      direction = this._prevX > currentX ? 'left' : 'right';
    } else {
      // tend to move up/down
      direction = this._prevY > currentY ? 'up' : 'down';
    }

    var newIndex = this.getIndexByOffset(offset, this.getPossibleDirection(direction));

    if (newIndex !== placeHolderIndex) {
      this._dimensionArr = this.swapArrayItemPosition(this._dimensionArr, placeHolderIndex, newIndex);
      this._orderArr = this.swapArrayItemPosition(this._orderArr, placeHolderIndex, newIndex);
    }

    return newIndex;
  },
  getSortData: function getSortData() {
    var _this2 = this;

    return this._orderArr.map(function (itemIndex) {
      var item = _this2.sortChildren[itemIndex];

      if (!item) {
        return undefined;
      }

      return item.props.sortData;
    });
  },
  getPossibleDirection: function getPossibleDirection(direction) {
    this._stack = this._stack || [];

    this._stack.push(direction);

    if (this._stack.length > STACK_SIZE) {
      this._stack.shift();
    }

    if (this._stack.length < STACK_SIZE) {
      return direction;
    }

    return (0, _utils.findMostOften)(this._stack);
  },

  /**
   * render all sortable children which mixined with SortableItemMixin
   */
  renderItems: function renderItems() {
    var _this3 = this;

    var _dimensionArr = this._dimensionArr,
        _orderArr = this._orderArr;
    var draggingItem;

    var items = _orderArr.map(function (itemIndex, index) {
      var item = _this3.sortChildren[itemIndex];

      if (!item) {
        return;
      }

      if (index === _this3._draggingIndex && _this3.state.isDragging) {
        draggingItem = _this3.renderDraggingItem(item);
      }

      var isPlaceHolder = _dimensionArr[index].isPlaceHolder;
      var itemClassName = "ui-sortable-item\n                             ".concat(isPlaceHolder && 'ui-sortable-placeholder', "\n                             ").concat(_this3.state.isDragging && isPlaceHolder && 'visible');
      var sortableProps = {
        sortableClassName: "".concat(item.props.className, " ").concat(itemClassName),
        sortableIndex: index,
        onSortableItemReadyToMove: isPlaceHolder ? undefined : function (e) {
          _this3.handleMouseDown.call(_this3, e, index);
        },
        onSortableItemMount: _this3.handleChildUpdate,
        sortHandle: _this3.props.sortHandle
      };

      if (item.key === undefined) {
        sortableProps.key = index;
      }

      return _react["default"].cloneElement(item, sortableProps);
    });

    var children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
    var result = children.map(function (child) {
      if (getSortTarget(child)) {
        return items.shift();
      }

      return child;
    }).concat([draggingItem]);
    return result;
  },

  /**
   * render the item that being dragged
   * @param  {object} item a reference of this.props.children
   */
  renderDraggingItem: function renderDraggingItem(item) {
    if (!item) {
      return;
    }

    var style = {
      top: this.state.top,
      left: this.state.left,
      width: this._dimensionArr[this._draggingIndex].width,
      height: this._dimensionArr[this._draggingIndex].height
    };
    return _react["default"].cloneElement(item, {
      sortableClassName: "".concat(item.props.className, " ui-sortable-item ui-sortable-dragging"),
      key: '_dragging',
      sortableStyle: style,
      isDragging: true,
      sortHandle: this.props.sortHandle
    });
  },
  render: function render() {
    var className = "ui-sortable ".concat(this.props.className || '');
    return _react["default"].createElement("div", {
      className: className
    }, this.renderItems());
  }
});

var SortableContainer = function SortableContainer(_ref) {
  var className = _ref.className,
      style = _ref.style,
      onMouseDown = _ref.onMouseDown,
      onTouchStart = _ref.onTouchStart,
      children = _ref.children;

  if (_react["default"].isValidElement(children)) {
    return _react["default"].cloneElement(children, {
      className: className,
      style: style,
      onMouseDown: onMouseDown,
      onTouchStart: onTouchStart
    });
  } else {
    return _react["default"].createElement('div', {
      className: className,
      style: style,
      onMouseDown: onMouseDown,
      onTouchStart: onTouchStart,
      children: children
    });
  }
};

Sortable.SortableItemMixin = (0, _SortableItemMixin["default"])();
Sortable.sortable = _SortableItemMixin["default"];
Sortable.SortableContainer = (0, _SortableItemMixin["default"])(SortableContainer);
var _default = Sortable;
exports["default"] = _default;