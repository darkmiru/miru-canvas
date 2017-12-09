function onload() {
  var prop = {};
  var strs = window.location.search.split(/[?&]/);
  for (var i = 0; i < strs.length; i++) {
    if (strs.length > 0) {
      var pair = strs[i].split('=');
      prop[pair[0]] = pair[1];
    }
  }
  // alert( prop.key );
  // alert( window.outerWidth + " / " + window.outerHeight);

  var elem = document.getElementById('canvas0');
  window.myCanvas = new MC_Canvas(elem, {
    margin: 40
  });

  window.myCanvas.setPathInfo({
    color: '#000000',
    opacity: 1.0,
    width: 15,
    rounded: false
  });

  setValue(window.myCanvas.getPathInfo().width);
  setColor(window.myCanvas.getPathInfo().color);
  setZoom(100);
  setRotate(0);
}

function setValue(val) {
  if (window.myCanvas.getPathInfo().width != val) {
    window.myCanvas.getPathInfo().width = val;
    // window.myCanvas.applyState();
  }
  var width_range = document.getElementById('width_range');
  if (width_range.value != val) {
    width_range.value = val;
  }
  var width_value = document.getElementById('width_value');
  width_value.innerHTML = val;

  var width_view = document.getElementById('width_view');
  width_view.style.display = 'inline-block';
  width_view.style.width = val + 'px';
  width_view.style.height = val + 'px';
  width_view.style.borderRadius = (val / 2) + 'px';
  width_view.style.backgroundColor = "#000000";
}

function setColor(val) {
  if (window.myCanvas.getPathInfo().color != val) {
    window.myCanvas.getPathInfo().color = val;
    window.myCanvas.applyState();
  }
  var color_range = document.getElementById('color_range');
  if (color_range.value != val) {
    color_range.value = val;
  }
  var color_value = document.getElementById('color_value');
  color_value.innerHTML = val;
}

function setZoom(val) {
  if (window.myCanvas.backInfo) {
    if (window.myCanvas.backInfo._zoom != val) {
      window.myCanvas.backInfo.zoom(val);
    }
  } 
  var zoom_range = document.getElementById('zoom_range');
  if (zoom_range.value != val) {
    zoom_range.value = val;
  }
  var zoom_value = document.getElementById('zoom_value');
  zoom_value.innerHTML = val + '%';
}

function setRotate(val) {
  if (window.myCanvas.backInfo) {
    if (window.myCanvas.backInfo._rotate != val) {
      window.myCanvas.backInfo.rotate(val);
    }
  } 
  var rotate_range = document.getElementById('rotate_range');
  if (rotate_range.value != val) {
    rotate_range.value = val;
  }
  var rotate_value = document.getElementById('rotate_value');
  rotate_value.innerHTML = val + ' degree';
}

function onWidthChange(elem) {
  setValue(elem.value);
}

function onColorChange(elem) {
  setColor(elem.value);
}

function onDragSet(elem) {
  if (elem.checked == true) {
    window.myCanvas.setDragMode(0);
  }
}

function onEraserSet(elem) {
  if (elem.checked == true) {
    window.myCanvas.setDragMode(1);
  }
}

function onSelectionSet(elem) {
  if (elem.checked == true) {
    window.myCanvas.setDragMode(3);
  }
}

function onSetRounded(elem) {
  var pathInfo = window.myCanvas.getPathInfo();
  pathInfo.rounded = elem.checked;
}

function onBackMoveSet(elem) {
  if (elem.checked == true) {
    window.myCanvas.setDragMode(2);
  }
}

function onZoomChange(elem) {
  setZoom(elem.value);
}

function onRotateChange(elem) {
  setRotate(elem.value);
}

function test() {

}
