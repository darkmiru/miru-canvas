'use strict';

var myUtil = {
  getTouchEvt: function(event) {
    if (event.touches !== undefined && event.touches.length > 0) {
      return event.touches[0];
    }
    else if (event.changedTouches !== undefined && event.changedTouches.length > 0) {
      return event.changedTouches[0];
    }

    return event;
  },

  getElement: function (elem, condition) {
    var tmp = elem;
    if (condition) {
      while (tmp && condition(tmp) === false) {
        tmp = tmp.parentElement;
      }
    }
    return tmp;
  },

  inArray: function( elem, array ) {
    if ( array.indexOf ) {
      return array.indexOf( elem );
    }

    for (var i = array.length - 1; i >= 0; i-- ) {
      if ( array[ i ] === elem ) {
        return i;
      }
    }

    return -1;
  },

  trim: function(str) {
    var  str = str.replace(/^\s\s*/, ''),
      ws = /\s/,
      i = str.length;
    while (ws.test(str.charAt(--i))) {}
    return str.slice(0, i + 1);
  },

  hasClass: function(el, classe) {
    var className = el.className;
    if (className === undefined) {
      return false;
    }
    return (myUtil.inArray(classe, className.split(' ')) > -1);
  },

  addClass: function(el, classe) {
    var className = el.className;
    if (className === undefined) {
      el.className = classe;
      return;
    }

    var hasClass = myUtil.inArray(classe, className.split(' ')) > -1, outClass;

    if ( !hasClass ) {
      outClass = [className, classe].join(' ');

      el.className = myUtil.trim(outClass);
    }
  },

  removeClass: function(el, classe) {
    if (el === undefined || el === null) {
      return;
    }
    var className = el.className;
    if (className === undefined) {
      return;
    }

    var clsList = className.split(' ');
    var removeList = classe.split(' ');
    var outClass = className;
    for (var i = 0; i < removeList.length; i++) {
      var idx = myUtil.inArray(removeList[i], clsList);
      if (idx > -1) {
        clsList.splice(idx, 1);
        //outClass = outClass.replace(removeList[i], '');
      }
    }

    outClass = clsList.join(' ');

    el.className = myUtil.trim(outClass);
  },

  rgb2hex: function(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? '#' +
      ('0' + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ('0' + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  },

  hex2rgb: function(hex, opacity){
    hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    var result = null;
    if (opacity === undefined) {
      result = 'rgb(' + r + ',' + g + ',' + b + ')';
    } else {
      result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
    }
    return result;
  },

  getCSS: function(elem, cssProp) {
    var cStyle = document.defaultView.getComputedStyle(elem, null);
    if (cStyle) {
      return cStyle.getPropertyValue(cssProp);
    }
  },

  getCSSNum: function(elem, cssProp) {
    return myUtil.getNumber(myUtil.getCSS(elem, cssProp));
  },

  isNumber: function(value) {
    return !isNaN(parseInt(value, 10));
  },

  getNumber: function(str) {
    if (typeof(str) === 'number') {
      return str;
    }
    if (str !== undefined) {
      var pos = str.indexOf('px');
      if (pos > -1) {
        str = str.substring(0, pos);
      }
      //alert(' === ' + str);
      var ret = parseInt(str);
      if (myUtil.isNumber(ret)) {
        return ret;
      }
    }
    return 0;
  },

  dataURLtoBlob: function(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }
};

function MC_Drag(elem, sendNext) {
  this.elem = elem;
  this._enable = true;
  this.scaleOwner = null;
  this.sendNext = (sendNext) ? sendNext: false;

  this.origin = {
    x: 0,
    y: 0
  };

  this.attachEvent();
}

MC_Drag.prototype.setOrigin = function(x, y) {
  this.origin.x = x;
  this.origin.y = y;
};

MC_Drag.prototype.setScale = function(x, y) {
  if (this.scaleOwner === null) {
    this.scaleOwner = {
      scaleX: 1,
      scaleY: 1
    };
  }

  this.scaleOwner.scaleX = x;

  if (y === undefined) {
    this.scaleOwner.scaleY = x;
  } else {
    this.scaleOwner.scaleY = y;
  }
};

MC_Drag.prototype.attachEvent = function() {
  var instance = this;

  var isPressed = false;

  var prev = {
    x : -1,
    y: -1
  }

  var px = -1;
  var py = -1;

  var isClick = true;
  var isDrag = false;

  var move = function (ev) {
    //console.log('move ' + isPressed);
    var e = myUtil.getTouchEvt(ev);
    if (isPressed) {
      var scaleX = 1;
      var scaleY = 1;
      if (instance.scaleOwner) {
        scaleX = instance.scaleOwner.scaleX;
        scaleY = instance.scaleOwner.scaleY;
      }

      var movX = (e.pageX - prev.x) / scaleX;
      var movY = (e.pageY - prev.y) / scaleY;

      if (px !== movX || py !== movY) {
        instance.notifyDragMove(movX, movY, (e.pageX - instance.origin.x) / scaleX, (e.pageY - instance.origin.y) / scaleY, ev);
        px = movX;
        py = movY;
      }

      if ( 5 < movX || movX < -5 || 5 < movY || movY < -5 ) {
        isClick = false;
      }
      else {
        isClick = true;
      }

      //console.log( movX + ' / ' + movY + ' / ' + isClick );

      isDrag = (movX !== 0 || movY !== 0);
    }
    ev.preventDefault();
    if (instance.sendNext === false) {
      ev.stopPropagation();
    }
  };

  var moveEnd = function (ev) {
    var e = myUtil.getTouchEvt(ev);
    isPressed = false;

    //instance.elem.style.cursor = '';

    document.removeEventListener( 'touchmove', instance.moveCB, false);
    document.removeEventListener( 'mousemove', instance.moveCB, false);

    document.removeEventListener( 'mouseup', instance.moveEndCB, false);
    document.removeEventListener( 'touchend', instance.moveEndCB, false);

    instance.notifyDragEnd(isDrag, ev);

    if (isClick) {
      instance.notifyClickAction(ev); // 클릭을 가상으로 처리.
    }

    if (instance.sendNext === false) {
      ev.stopPropagation();
    }
  };

  var checkClassFunc = function(elem) {
    return (elem !== null && elem.className !== null && elem.className.length > 0);
  };

  var moveStart = function (ev) {
    var target = myUtil.getElement(ev.target, checkClassFunc);
    if (isPressed === true || (target && myUtil.hasClass(target, 'nde'))) {
      return;
    }

    if (instance.onBeforeStart && instance.onBeforeStart(ev.target) === false) {
      return;
    }
    
    if (instance.onStart) {
      instance.onStart();
    }

    isPressed = true;
    isClick = true;
    isDrag = false;

    var e = myUtil.getTouchEvt(ev);

    document.addEventListener( 'touchmove', instance.moveCB, false);
    document.addEventListener( 'mousemove', instance.moveCB, false);

    document.addEventListener( 'mouseup', instance.moveEndCB, false);
    document.addEventListener( 'touchend', instance.moveEndCB, false);

    var scaleX = 1;
    var scaleY = 1;
    if (instance.scaleOwner) {
      scaleX = instance.scaleOwner.scaleX;
      scaleY = instance.scaleOwner.scaleY;
    }

    prev.x = e.pageX;
    prev.y = e.pageY;

    instance.notifyDragStart((e.pageX - instance.origin.x) / scaleX, (e.pageY - instance.origin.y) / scaleY, ev);
    if (instance.sendNext === false) {
      ev.stopPropagation();
    }
  };

  instance.moveCB = move;
  instance.moveEndCB = moveEnd;
  instance.moveStartCB = moveStart;

  instance.elem.addEventListener('mousedown', moveStart, false);
  instance.elem.addEventListener('touchstart', moveStart, false);
};

MC_Drag.prototype.notifyDragStart = function(X, Y, ev) {
  if (this.onDragStart) {
    this.onDragStart(X, Y, ev);
  }
};

MC_Drag.prototype.notifyDragMove = function(mX, mY, X, Y, ev) {
  if (this.onDragMove) {
    this.onDragMove(mX, mY, X, Y, ev);
  }
};

MC_Drag.prototype.notifyDragEnd = function(isMoved, ev) {
  if (this.onDragEnd) {
    this.onDragEnd(isMoved, ev);
  }
};

MC_Drag.prototype.notifyClickAction = function(ev) {
  if (this.onClickAction) {
    this.onClickAction(ev);
  }
};

MC_Drag.prototype.setEventEnable = function(val) {
  if (this._enable === val) {
    return;
  }

  var instance = this;

  this._enable = val;

  if (this._enable === true) {
    this.elem.addEventListener('mousedown', instance.moveStartCB, false);
    this.elem.addEventListener('touchstart', instance.moveStartCB, false);

    //this.elem.addEventListener('click', instance.clickCB, false);
    //this.elem.style.pointerEvents = '';
  }
  else {
    this.elem.removeEventListener('mousedown', instance.moveStartCB, false);
    this.elem.removeEventListener('touchstart', instance.moveStartCB, false);

    //this.elem.removeEventListener('click', instance.clickCB, false);
    //this.elem.style.pointerEvents = 'none';
  }
};

MC_Drag.prototype.isEventEnabled = function() {
  return this._enable;
};

// MC_Command
function MC_Command(name, target) {
  this.name = name;
  this.target = target;
  this.doList = [];
  this.undoList = [];
}

MC_Command.prototype.addCB = function(doFunc, undoFunc) {
  this.doList.push(doFunc);
  this.undoList.push(undoFunc);
};

MC_Command.prototype.do = function() {
  for (var i = 0; i < this.doList.length; i++) {
    if (this.doList[i]) {
      this.doList[i]();
    }
  }
};

MC_Command.prototype.undo = function() {
  for (var i = this.undoList.length - 1; i >= 0; i--) {
    if (this.undoList[i]) {
      this.undoList[i]();
    }
  }
};

function MC_CMDHistory() {
  this.maxSize = 50;
  this.history = [];
  this.curr = -1;
  this.last = -1;
  this.first = 0;
  this.createdCmd = null;

  this.history.length = this.maxSize;
}

MC_CMDHistory.prototype.clear = function() {
  this.first = 0;
  this.last = -1;
  this.curr = -1;
  this.history.length = 0;
};

MC_CMDHistory.prototype._moveNextIdx = function() {
  this.curr = (this.curr + 1) % this.maxSize;
  return this.curr;
};

MC_CMDHistory.prototype._movePrevIdx = function() {
  this.curr = (this.curr - 1 + this.maxSize) % this.maxSize;
  return this.curr;
};

MC_CMDHistory.prototype.undo = function() {
  if (this.curr < 0) {
    return;
  }
  if (this.createdCmd !== null) {
    var self = this;
    setTimeout(function() {
      self.undo();
    }, 50);
  }
  var curCmd = this.history[this.curr];
  curCmd.undo();
  if (this.curr === this.first) {
    this.curr = -1;
  }
  else {
    this._movePrevIdx();
  }
};

MC_CMDHistory.prototype.redo = function() {
  if (this.curr === this.last) {
    return;
  }
  if (this.createdCmd !== null) {
    var self = this;
    setTimeout(function() {
      self.redo();
    }, 50);
  }
  if (this.curr === -1) {
    this.curr = this.first;
  }
  else {
    this._moveNextIdx();
  }
  var curCmd = this.history[this.curr];
  curCmd.do();
};

MC_CMDHistory.prototype.startCMD = function(name, target, append) {
  var command = new MC_Command(name, target);
  if (append === true) {
    this._addCmd(command);
  }
  this.createdCmd = command;
  return command;
};

MC_CMDHistory.prototype.endCMD = function(command) {
  if (this.createdCmd === command) {
    this.createdCmd.do();
    this.createdCmd = null;
  }
};

MC_CMDHistory.prototype.add = function(name, target, doFunc, undoFunc, append) {
  var cmd = null;
  if (this.createdCmd === null) {
    cmd = this.startCMD(name, target, append);
  }

  this.createdCmd.addCB(doFunc, undoFunc);

  if (cmd !== null) {
    this.endCMD(cmd);
  }
};

MC_CMDHistory.prototype.runCMD = function(name, target, func) {
  var cmd = null;
  if (this.createdCmd === null) {
    cmd = this.startCMD(name, target, false);
  }

  func();

  if (cmd !== null) {
    this.endCMD(cmd);
  }
};

MC_CMDHistory.prototype._addCmd = function(cmd) {
  var pCur = this.curr;
  this.last = this._moveNextIdx();
  if (pCur !== -1 && this.last === this.first) {
    this.first = (this.last + 1) % this.maxSize;
  }
  this.history[this.last] = cmd;
};

// MC_Canvas..
function MC_Canvas(elem, options) {
  this.owner = elem;

  this._defaultPathInfo = {
    color: '#000000',
    opacity: 1.0,
    width: 1,
    rounded: true
  };

  myUtil.addClass(this.owner, 'cp-canvas');

  this.options = options || {};

  this.options.margin = this.options.margin || 0;

  if (this.options.backCanvas) {
    this.backCanvas = this.options.backCanvas;
  } else {
    this.backCanvas = document.createElement('canvas');
    this.owner.appendChild(this.backCanvas);
  }
  myUtil.addClass(this.backCanvas, 'cp-canvas-back');

  this.middleElem = document.createElement('div');
  this.owner.appendChild(this.middleElem);
  myUtil.addClass(this.middleElem, 'cp-canvas-middle');
  
  if (this.options.canvas) {
    this.canvas = this.options.canvas;
  } else {
    this.canvas = document.createElement('canvas');
    this.owner.appendChild(this.canvas);
  }
  myUtil.addClass(this.canvas, 'cp-canvas-front');

  this.context = this.canvas.getContext('2d');
  this.backContext = this.backCanvas.getContext('2d');
  this.pathInfo = {};

  for(var k in this._defaultPathInfo) {
    this.pathInfo[k] = this._defaultPathInfo[k];
  }

  this.prevX = -1;
  this.prevY = -1;

  this.lastPath = null;

  this.dragMode = -1; // 0 - draw, 1 - erase, 2 - back image move, 3 - selection mode

  this.middleElem.style.borderWidth = this.options.margin + "px";

  this.cmdHistory = new MC_CMDHistory();

  var drag = new MC_Drag(this.canvas, false);
  this.drag = drag;
  
  var instance = this;
  this.drag.onStart = function() {
    instance.reset();
  };

  this.attachEvent();
  this.applySize();
  this.applyState();

  var cw = this.backCanvas.width;
  var ch = this.backCanvas.height;

  this.backContext.fillStyle = '#FFFFFF';
  this.backContext.fillRect(0, 0, cw, ch);

  this.selection = new MC_Selection(this.owner);

  this.setDragMode(0);
}

MC_Canvas.prototype.addBox = function(cls) {
  var box = document.createElement('div');
  myUtil.addClass(box, 'selectable-item fill-box');
  if (cls != null) {
    myUtil.addClass(box, cls);
  }
  this.owner.appendChild(box);
  this.selection.apply();
};

MC_Canvas.prototype.reset = function() {
  var bound = this.canvas.getBoundingClientRect();
  this.drag.setOrigin(bound.left, bound.top);
  this.drag.setScale(bound.width / this.canvas.width, bound.height / this.canvas.height);
};

MC_Canvas.prototype.setPathInfo = function(pathInfo) {
  this.pathInfo = pathInfo;

  for(var k in this._defaultPathInfo) {
    if (this.pathInfo[k] == undefined) {
      this.pathInfo[k] = this._defaultPathInfo[k];
    }
  }

  this.applyState();
};

MC_Canvas.prototype.getPathInfo = function() {
  return this.pathInfo;
};

MC_Canvas.prototype.openImage = function() {
  var instance = this;
  
  if (this.input == undefined) {
    var input = document.createElement('input');
    input.type='file';
    input.setAttribute('multiple', '');
    input.setAttribute('accept', 'image/*');
    
    input.style.width = '0px';
    input.style.height = '0px';
    input.style.visibility = 'hidden';
    
    this.canvas.parentElement.appendChild(input);

    this.input = input;
  
    this.input.addEventListener('change', function(e) {
      if (instance._removeImageBtn) {
        instance._removeImageBtn();
      }
  
      //alert('change');
      var url = e.target.files[0];
      
      var reader = new FileReader();
  
      reader.onload = function (e) {
          // get loaded data and render thumbnail.
          instance.setBackgroundImage(e.target.result);
      };
  
      // read the image file as a data URL.
      reader.readAsDataURL(url);
      
    }, false);
  }
  
  //setTimeout(function() {
    instance.input.click();
  //}, 10);
};

MC_Canvas.prototype.setBackgroundImage = function(imgURL) {
  var instance = this;
  var img = new Image();
  
  img.onload = function() {
    var w = img.width;
    var h = img.height;
    
    var cw = instance.backCanvas.width;
    var ch = instance.backCanvas.height;
    
    var scaleX = cw / w;
    var scaleY = ch / h;

    var scale = (scaleX > scaleY) ?  scaleY : scaleX;
    
    var tw = scale * w;
    var th = scale * h;
    
    var tx = (cw - tw) / 2;
    var ty = (ch - th) / 2;
    
    instance.backInfo = {
      cw: cw,
      ch: ch,
      x: tx,
      y: ty,
      w: tw,
      h: th,
      _rotate: 0,
      img: img,
      lastMX: 0,
      lastMY: 0,
      lastX: 0,
      lastY: 0,
      lastW: 0,
      lastH: 0,
      _zoom: 100,
      context: instance.backContext,
      moveStart: function() {
        this.lastX = Math.round(((this.x - this.cw / 2) * this._zoom) / 100 + this.cw / 2);
        this.lastY = Math.round(((this.y - this.ch / 2) * this._zoom) / 100 + this.ch / 2);
        this.lastW = Math.round((this.w * this._zoom) / 100);
        this.lastH = Math.round((this.h * this._zoom) / 100);
        this.lastMX = 0;
        this.lastMY = 0;
      },
      move: function(mx, my) {
        this.context.fillStyle = '#FFFFFF';
        instance.backContext.fillRect(0, 0, this.cw, this.ch);
        instance.backContext.save();
        var transX = 0;
        var transY = 0;
        var movx = mx;
        var movy = my;
        if (this._rotate != 0) {
          transX = this.cw / 2;
          transY = this.ch / 2;
          //var r = this._rotate;
          var d = this._rotate * Math.PI / 180;
          instance.backContext.translate(transX, transY);
          instance.backContext.rotate(d);
          movx = mx * Math.cos(-d) - my * Math.sin(-d);
          movy = mx * Math.sin(-d) + my * Math.cos(-d);
        }
        instance.backContext.drawImage(img, this.lastX + movx - transX, this.lastY + movy - transY, this.lastW, this.lastH);
        instance.backContext.restore();
        this.lastMX = movx;
        this.lastMY = movy;
      },
      moveEnd: function() {
        this.x = Math.round(((this.lastX + this.lastMX) - this.cw / 2) * 100 / this._zoom + this.cw / 2);
        this.y = Math.round(((this.lastY + this.lastMY) - this.ch / 2) * 100 / this._zoom + this.ch / 2);
      },
      zoom: function(percent) {
        this._zoom = percent;
        this.moveStart();
        this.move(0, 0);
        this.moveEnd();
      },
      rotate: function(degree) {
        this._rotate = degree;
        this.moveStart();
        this.move(0, 0);
        this.moveEnd();
      }
    };
    
    instance.backInfo.zoom(instance.backInfo._zoom);
  };

  img.src = imgURL;
};

MC_Canvas.prototype.getDataURL = function(type) {
  var boxList = document.querySelectorAll('.fill-box');

  var saveImgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

  for (var i = 0; i < boxList.length; i++) {
    var box = boxList[i];
    var left = myUtil.getNumber(box.style.left);
    var top = myUtil.getNumber(box.style.top);
    var width = myUtil.getNumber(box.style.width);
    var height = myUtil.getNumber(box.style.height);

    this.context.fillStyle = '#000000';
    this.context.fillRect(left, top, width, height);
  }

  var savebackImgData = this.backContext.getImageData(0, 0, this.canvas.width, this.canvas.height);

  var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

  var alpha = 0;
  for(var i=0; i<imgData.data.length; i+=4) {
    alpha = imgData.data[i+3];
    imgData.data[i] = (alpha * imgData.data[i] + (255 - alpha) * savebackImgData.data[i]) / 255;
    imgData.data[i+1] = (alpha * imgData.data[i+1] + (255 - alpha) * savebackImgData.data[i+1]) / 255;
    imgData.data[i+2] = (alpha * imgData.data[i+2] + (255 - alpha) * savebackImgData.data[i+2]) / 255;
    imgData.data[i+3] = 255;
  }

  var mimeType = 'image/';
  if (type == 'jpg' || type == 'jpeg') {
    mimeType += 'jpeg';
  } else {
    mimeType += 'png';
  }

  var image = null;

  if (this.options.margin > 0) {
    if (this.saveCanvas == null) { 
      var canvas = window.document.createElement('canvas');
      canvas.style.display = 'none';
      document.body.append(canvas);
      this.saveCanvas = canvas;
      this.saveCanvas.width = this.backCanvas.width - this.options.margin * 2;
      this.saveCanvas.height = this.backCanvas.height - this.options.margin * 2;

      this.saveContext = this.saveCanvas.getContext('2d');
    }

    this.saveContext.putImageData(imgData, -this.options.margin, -this.options.margin);

    image = this.saveCanvas.toDataURL(mimeType);
  } else {
    this.backContext.putImageData(imgData, 0, 0);

    image = this.backCanvas.toDataURL(mimeType);
    
    this.backContext.putImageData(savebackImgData, 0, 0);
  }

  this.context.putImageData(saveImgData, 0, 0);

  return image;
};

MC_Canvas.prototype.getBlob = function(type) {
  var image = this.getDataURL(type);

  var blob = myUtil.dataURLtoBlob(image);

  return blob;
};

MC_Canvas.prototype.download = function(name, type) {
  var blob = this.getBlob(type);
  // blob는 아래와 같이 image 다운로드에 사용할 수도 있고, FormData에 append 하여 사용할 수도 있다.

  var url = (window.URL || window.webkitURL).createObjectURL(blob);
  if (this.aTag == null) { 
    var link = window.document.createElement('a');
    link.style.display = 'none';
    document.body.append(link);
    this.aTag = link;
  }
  name = name || 'image';
  var filename = name + '.';
  if (type == 'jpg' || type == 'jpeg') {
    filename += 'jpg';
  } else {
    filename += 'png';
  }

  this.aTag.download = filename;
  this.aTag.href = url;

  this.aTag.click();

  // var click = document.createEvent('Event');
  // click.initEvent('click', true, true);
  // this.aTag.dispatchEvent(click);
};

MC_Canvas.prototype.attachEvent = function() {
  var instance = this;
  this.drag.onDragStart = function(X, Y) {
    //console.log('onDragStart - ' + X + ' / ' + Y);
    if (instance.dragMode == 3) {
      return;
    }
    if (instance.dragMode == 2) {
      if (instance.backInfo) {
        instance.backInfo.moveStart();
      }
    } else {
      instance.dragStart(X, Y);
    }
  };
  this.drag.onDragMove = function(mX, mY, X, Y) {
    //console.log('onDragMove - ' + X + ' / ' + Y);
    if (instance.dragMode == 3) {
      return;
    }
    if (instance.dragMode == 2) {
      if (instance.backInfo) {
        instance.backInfo.move(mX, mY, X, Y);
      }
    } else {
      instance.dragMove(mX, mY, X, Y);
    }
  };
  this.drag.onDragEnd = function(val) {
    //console.log('onDragEnd - ' + val);
    if (instance.dragMode == 3) {
      return;
    }
    if (instance.dragMode == 2) {
      if (instance.backInfo) {
        instance.backInfo.moveEnd();
      }
    } else {
      instance.dragEnd(val);
    }
  };
  this.drag.onClickAction = function(ev) {
    //console.log('onClickAction');
  };
};

MC_Canvas.prototype.dragStart = function(X, Y) {
  //console.log('s ==== ' + X + ' / ' + Y);

  var instance = this;

  var x = X; //this.owner.ratio.H * X / this.owner.scale;
  var y = Y; //this.owner.ratio.V * Y / this.owner.scale;
  var c = this.pathInfo.color;
  var o = this.pathInfo.opacity;
  var w = this.pathInfo.width + 'px';

  var path = this.createPath(x, y, c, o, w);

  this.prevX = x;
  this.prevY = y;

  this.lastPath = path;
};

MC_Canvas.prototype.dragMove = function(mX, mY, X, Y) {
  //console.log('m ==== ' + mX + ' / ' + mY + ' /// ' + X + ' / ' + Y);

  var x = X; //this.owner.ratio.H * X / this.owner.scale;
  var y = Y; //this.owner.ratio.V * Y / this.owner.scale;
  var c = this.pathInfo.color;
  var o = this.pathInfo.opacity;
  var w = this.pathInfo.width + 'px';

  //console.log('m2 === ' + x + ' / ' + y);

  if (this.prevX !== x || this.prevY !== y) {
    this.addPoint(this.lastPath, x - this.prevX, y - this.prevY, c, o, w);
  }
  this.prevX = x;
  this.prevY = y;
};

MC_Canvas.prototype.dragEnd = function(isMoved) {
  this.lastPath = null;
  this.prevX = -1;
  this.prevY = -1;
  this.endPoint(isMoved);
};

MC_Canvas.prototype.applySize = function() {
  this.canvas.width = (this.options.width) ? myUtil.getNumber(this.options.width) : this.owner.offsetWidth;
  this.canvas.height = (this.options.height) ? myUtil.getNumber(this.options.height) : this.owner.offsetHeight;

  this.backCanvas.width = this.canvas.width;
  this.backCanvas.height = this.canvas.height;

  var bound = this.canvas.getBoundingClientRect();
  this.drag.setOrigin(bound.left, bound.top);
  this.drag.setScale(bound.width / this.canvas.width, bound.height / this.canvas.height);
};

MC_Canvas.prototype.applyState = function() {
  myUtil.removeClass(this.owner, 'curser-draw');
  myUtil.removeClass(this.owner, 'curser-erase');
  myUtil.removeClass(this.owner, 'curser-move');
  switch (this.dragMode) {
    case 0:
      myUtil.addClass(this.owner, 'curser-draw');
      break;
    case 1:
      myUtil.addClass(this.owner, 'curser-erase');
      break;
    case 2:
    case 3:
      myUtil.addClass(this.owner, 'curser-move');
      break;
  }
};

MC_Canvas.prototype.setDragMode = function(mode) {
  if (this.dragMode != mode) {
    this.dragMode = mode;
    this.applyState();
    this.selection.setEventEnable(this.dragMode == 3);
    this.drag.setEventEnable(this.dragMode != 3);
  }
};

MC_Canvas.prototype.getDragMode = function() {
  return this.dragMode;
};

MC_Canvas.prototype.setEventEnable = function(val) {
  this.drag.setEventEnable(val);
  if (val === true) {
    this.canvas.style.pointerEvents = 'all';
  } else {
    this.canvas.style.pointerEvents = 'none';
  }
};

MC_Canvas.prototype.isEventEnabled = function() {
  return this.drag.isEventEnabled();
};

MC_Canvas.prototype.setVisible = function(val) {
  if (val === true) {
    this.canvas.style.display = '';
  } else {
    this.canvas.style.display = 'none';
  }
};

MC_Canvas.prototype.isVisible = function() {
  return (this.canvas.style.display !== 'none');
};

MC_Canvas.prototype.createPath = function(x, y, color, opacity, width) {
  var path = this._createPath(x, y, color, opacity, width, true);

  if (path) {
    var instance = this;
    this.cmdHistory.add('addPath', null, function() {
      if (path.x.length > 1) {
        instance._drawPath(path, true);
      }
    }, function() {
      instance.context.putImageData(path.prevImgData, 0, 0);
    }, true);
  }
  return path;
};

MC_Canvas.prototype.addPoint = function(path, x, y, color, opacity, width) {
  this._addPoint(this.lastPath, x, y, color, opacity, width, true);
};

MC_Canvas.prototype.endPoint = function(isMoved) {
  this._endPoint(this.lastPath, 0, 0, '', 1, '', true);
};

MC_Canvas.prototype.deletePath = function(path) {
  var parent = path.parentElement;
  var instance = this;
  this.cmdHistory.add('removePath', null, function() {
    instance.context.putImageData(path.prevImgData, 0, 0);
  }, function() {
    instance._drawPath(path, true);
  }, true);

  this._deletePath(path.idx);
};

MC_Canvas.prototype._createPath = function(x, y, color, opacity, width, save) {
  // this.context.beginPath();

  this.context.strokeStyle = myUtil.hex2rgb(color, opacity);
  this.context.fillStyle = 'rgba(0,0,0,0.0)';
  //this.context.lineJoin='round';
  this.context.lineWidth = '' + myUtil.getNumber(width);

  // this.context.moveTo(x, y);

  var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  // var imgData = null;

  var path = {
    context: this.context,
    color: color,
    px: x,
    py: y,
    prevImgData: imgData,
    x: [],
    y: []
  };

  path.x.push(path.px);
  path.y.push(path.py);

  this.pathIdx++;

  path.idx = this.pathIdx;

  return path;
};

MC_Canvas.prototype._addPoint = function(path, x, y, color, opacity, width, save) {
  if (path === null) {
    return;
  }

  path.px += x;
  path.py += y;
  path.x.push(path.px);
  path.y.push(path.py);

  if (save === true) {
    this._drawPath(path, true);
  }
};

MC_Canvas.prototype._endPoint = function(path, x, y, color, opacity, width, save) {
  if (save === false) {
    this._drawPath(path, false);
  }

  if (save === true) {
    // 저장.
  }
};

MC_Canvas.prototype._drawPath = function(path, drawBack) {
  if (path.prevImgData) {
    this.context.putImageData(path.prevImgData, 0, 0);
  }

  if (this.dragMode == 1) {
    this.context.strokeStyle = '#FFFFFF';
    this.context.globalCompositeOperation = 'destination-out';
  } else {
    this.context.globalCompositeOperation = 'source-over';
  }

  this.context.lineCap = (this.pathInfo.rounded != true) ? 'butt' : 'round';
  this.context.lineJoin = (this.pathInfo.rounded != true) ? 'bevel' : 'round';
  this.context.beginPath();

  if (path.x.length > 0) {
    this.context.moveTo(path.x[0], path.y[0]);
    for (var i = 1; i < path.x.length; i++) {
      path.context.lineTo(path.x[i], path.y[i]);
    }
  }

  path.context.stroke();
};

MC_Canvas.prototype._deletePath = function(pathIdx) {
};

MC_Canvas.prototype.removeAllPath = function(deleteDB) {
  this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
};

function MC_Selection(parent, options) {
  this.parent = parent;

  this.options = options || {};

  this._rectSize = this.options._rectSize || 7;

  this.options.selectable = this.options.selectable || 'selectable-item';
  
  this._rectclass = [
    "dir-nw",
    "dir-w",
    "dir-sw",
    "dir-n",
    "dir-m",
    "dir-s",
    "dir-ne",
    "dir-e",
    "dir-se"
  ];
  
  this._cursor = [
    "nw-resize",
    "w-resize",
    "sw-resize",
    "n-resize",
    "move",
    "s-resize",
    "ne-resize",
    "e-resize",
    "se-resize"
  ];

  this._pri = {
    pLeft: -1,
    pTop: -1,
    pWidth: -1,
    pHeight: -1
  };

  
  this._isHidden = true;
  
  this.target = null;
  
  this._makeElement();
  this.attachEvent();
}

MC_Selection.prototype._makeElement = function() {
  this.elem = document.createElement("mc-selection");
  
  myUtil.addClass(this.elem, "selection dir-m");
  
  var root = null;
  if (this.elem.createShadowRoot) {
    root = this.elem.createShadowRoot();
    //<link rel="stylesheet" href="styles.css">
    var linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "stylesheet");
    linkTag.setAttribute("href", "lib/css/miru-canvas-selection.css");
    root.appendChild(linkTag);
  }
  else {
    root = this.elem;
  }
  
  this.rect = [];
  this.rect.length = this._rectclass.length;
  
  for (var i = 0; i < this._rectclass.length; i++) {
    this.rect[i] = document.createElement("div");
    myUtil.addClass(this.rect[i], "box " + this._rectclass[i]);
    root.appendChild(this.rect[i]);
  }
  
  this.parent.appendChild(this.elem);

  this.hide();
  
  this.elem.style.visibility = "hidden";
};

MC_Selection.prototype.apply = function() {
  this.parent.appendChild(this.elem);
};
  
MC_Selection.prototype.attachEvent = function() {
  var instance = this;
  
  var isPressed = false;
  var pressedIdx = -1;
  
  var prev = {
    x : -1,
    y: -1
  }
  
  var px = -1;
  var py = -1;
  
  var isClick = true;
  var isDrag = false;
  
  var move = function (ev) {
    //console.log("move " + isPressed);
    var e = myUtil.getTouchEvt(ev);
    if (isPressed) {
      var movX = e.pageX - prev.x;
      var movY = e.pageY - prev.y;

      if (px != movX || py != movY) {
        instance.dragMove(pressedIdx, movX, movY);
        px = movX;
        py = movY;
      }
      
      if ( 5 < movX || movX < -5 || 5 < movY || movY < -5 ) {
        isClick = false;
      }
      else {
        isClick = true;
      }
      
      isDrag = (movX != 0 || movY != 0);
    }
    ev.preventDefault();
  };
    
  var moveEnd = function (ev) {
    var e = myUtil.getTouchEvt(ev);
    isPressed = false;

    this._lock = false;
    
    pressedIdx = -1;
    instance.elem.style.cursor = "";

    document.removeEventListener( "touchmove", instance.moveCB, false);
    document.removeEventListener( "mousemove", instance.moveCB, false);
    
    document.removeEventListener( "mouseup", instance.moveEndCB, false);
    document.removeEventListener( "touchend", instance.moveEndCB, false);

    instance.dragEnd(pressedIdx, isDrag);
  };

  var moveStart = function (ev) {
    if (isPressed == true) {
      return;
    }
    this._lock = true;
    isPressed = true;
    isClick = true;
    isDrag = false;

    var e = myUtil.getTouchEvt(ev);
    
    for(var i = 0; i < instance._rectclass.length; i++) {
      if (myUtil.hasClass(e.target, instance._rectclass[i])) {
        pressedIdx = i;
        instance.elem.style.cursor = instance._cursor[i];
        break;
      }
    }
    
    if (pressedIdx == -1) {
      pressedIdx = 4;
    }
    
    document.addEventListener( "touchmove", instance.moveCB, false);
    document.addEventListener( "mousemove", instance.moveCB, false);
    
    document.addEventListener( "mouseup", instance.moveEndCB, false);
    document.addEventListener( "touchend", instance.moveEndCB, false);
    
    prev.x = e.pageX;
    prev.y = e.pageY;
    
    instance.dragStart(pressedIdx, e.pageX, e.pageY);
  };
  
  var checkClick = function (ev) {
    if (isClick) {
      instance.clickAction();
    }
    ev.stopPropagation();
  };
  
  instance.moveCB = move;
  instance.moveEndCB = moveEnd;
  instance.moveStartCB = moveStart;
  
  for (var i = 0; i < instance._rectclass.length; i++) {
    instance.rect[i].addEventListener("mousedown", moveStart, false);
    instance.rect[i].addEventListener("touchstart", moveStart, false);
  }
  
  this.elem.addEventListener("mousedown", moveStart, false);
  this.elem.addEventListener("touchstart", moveStart, false);
  
  this.elem.addEventListener("click", checkClick, false);

  var parentListener = function(e) {
    if (e.target && myUtil.hasClass(e.target, instance.options.selectable)) {
      instance.select(e.target);
    } else {
      instance.unselect();
    }
  };

  instance.parentListener = parentListener;
  this.parent.addEventListener('click', parentListener, false);
};

MC_Selection.prototype.dragStart = function(idx) {
  this.show();
  this.onDragStart(idx);
};
  
MC_Selection.prototype.dragMove = function(idx, mX, mY) {
  this.onDragMove(idx, mX, mY);
};

MC_Selection.prototype.dragEnd = function(idx, isMoved) {
  this.onDragEnd(idx);
};

MC_Selection.prototype.clickAction = function() {
};

MC_Selection.prototype.onDragStart = function(idx) {
  this._pri.pLeft = myUtil.getNumber(this.elem.style.left);
  this._pri.pTop = myUtil.getNumber(this.elem.style.top);
  this._pri.pWidth = myUtil.getNumber(this.elem.style.width);
  this._pri.pHeight = myUtil.getNumber(this.elem.style.height);
};

MC_Selection.prototype.onDragMove = function(idx, mX, mY) {
  //console.log(" ---- " + idx + " / " + mX + " / "  + mY);
  if (idx == 4) {
    this.elem.style.left = (this._pri.pLeft + mX) + "px";
    this.elem.style.top = (this._pri.pTop + mY) + "px";
  }
  
  var hIdx = Math.floor(idx / 3);
  var vIdx = idx % 3;

  //console.log(" ! ---- " + hIdx + " / " + vIdx);

  var x = 0, y = 0, w = 0, h = 0;
  var disableH = false, disableV = false;
      
  switch (hIdx) {
    case 0:
      x = this._pri.pLeft + mX;
      w = this._pri.pWidth - mX;
      if (w < 0) {
        x += w;
        w = -w - this._rectSize;
      }
      break;
    case 1:
      disableH = true;
      break;
    case 2:
      x = this._pri.pLeft;
      w = this._pri.pWidth + mX;
      if (w < 0) {
        x += w + this._rectSize;
        w = -w;
      }
      break;
  }
      
  switch (vIdx) {
    case 0:
      y = this._pri.pTop + mY;
      h = this._pri.pHeight - mY;
      if (h < 0) {
        y += h;
        h = -h - this._rectSize;
      }
      break;
    case 1:
      disableV = true;
      break;
    case 2:
      y = this._pri.pTop;
      h = this._pri.pHeight + mY;
      if (h < 0) {
        y += h + this._rectSize;
        h = -h;
      }
      break;
  }

  if (disableH == false) {
    this.elem.style.left = x + "px";
    this.elem.style.width = w + "px";
  }

  if (disableV == false) {
    this.elem.style.top = y + "px";
    this.elem.style.height = h + "px";
  }
};

MC_Selection.prototype.onDragEnd = function(idx) {
  this.applyTarget();
};

MC_Selection.prototype.setEventEnable = function(val) {
  if (this._enable === val) {
    return;
  }

  var instance = this;

  this._enable = val;

  if (this._enable === true) {
    this.elem.addEventListener('mousedown', instance.moveStartCB, false);
    this.elem.addEventListener('touchstart', instance.moveStartCB, false);
    this.parent.addEventListener('click', instance.parentListener, false);
  }
  else {
    this.elem.removeEventListener('mousedown', instance.moveStartCB, false);
    this.elem.removeEventListener('touchstart', instance.moveStartCB, false);
    this.parent.removeEventListener('click', instance.parentListener, false);
    this.hide();
  }
};

MC_Selection.prototype.isEventEnabled = function() {
  return this._enable;
};

MC_Selection.prototype.select = function(elem, ret) {
  this.target = elem;
  this.targetDoc = document;
  
  this.refresh();
  
  this.show();

  this._notifySelect(this.target, ret);
};

MC_Selection.prototype.unselect = function(ret) {
  this.hide();

  this.target = null;

  this._notifyUnselect(this.target, ret);
};

MC_Selection.prototype._notifySelect = function(elem, skip) {
  
};

MC_Selection.prototype._notifyUnselect = function(elem, skip) {
  
};

MC_Selection.prototype.show = function() {
  this.elem.style.display = "block";
};

MC_Selection.prototype.hide = function() {
  this.elem.style.display = "none";
};

MC_Selection.prototype.boxVisible = function(val) {
  if (val) {
    myUtil.removeClass(this.elem, "no-box");
  }
  else {
    myUtil.addClass(this.elem, "no-box");
  }
};

MC_Selection.prototype.delete = function() {
  if (this.target) {
    this.target.parentElement.removeChild(this.target);
    this.unselect();
    return this.target;
  }
  return null;
};

MC_Selection.prototype.isVisible = function() {
  return (this.elem.style.display != "none");
};

MC_Selection.prototype.refresh = function() {
  if (this.target) {
    var offsetRect = this.target.getBoundingClientRect();
    
    this.elem.style.width = offsetRect.width + "px";
    this.elem.style.height = offsetRect.height + "px";
    
    var dragArea = this.parent;
    var dragRect = dragArea.getBoundingClientRect();
    var left = dragRect.left;
    var top = dragRect.top;
    this.elem.style.left = (offsetRect.left - left) + "px";
    this.elem.style.top = (offsetRect.top - top) + "px";
  }
  
  if (this._isHidden) {
    this.elem.style.visibility = "visible";
    this._isHidden = false;
  }
};

MC_Selection.prototype.applyTarget = function() {
  if (this.target) {
    var left = myUtil.getNumber(this.elem.style.left);
    var top = myUtil.getNumber(this.elem.style.top);
    var width = myUtil.getNumber(this.elem.style.width);
    var height = myUtil.getNumber(this.elem.style.height);

    this.target.style.left = left + 'px';
    this.target.style.top = top + 'px';
    this.target.style.width = width + 'px';
    this.target.style.height = height + 'px';
  }
};

