window.createDiv = createDiv;

let num = 0;
let newImage = 0;

function createDiv() {
  var div = document.createElement("div");
  var mainDiv = document.getElementById("main");
  num = num + 1;
  div.id = "content" + num;
  div.innerHTML = "Click here to add text!";
  div.className = "editor";
  div.contentEditable = "true";
  div.setAttribute("onkeydown", "remove(this,event)");
  CKEDITOR.inline(div);
  mainDiv.appendChild(div);
  new DragResize(document.getElementById("content" + num));
}

function remove(row, event) {
    if (event.keyCode == 46) {
      row.parentNode.remove();
    }
  }

var loadFile = function(event) {
  var img = document.createElement("img");
  var image = document.getElementById("main");
  img.src = URL.createObjectURL(event.target.files[0]);
  newImage = newImage + 1;
  img.id = "output" + newImage;
  img.className = "imgeditor";
  image.appendChild(img);
  new DragResize(document.getElementById("output" + newImage));
};


let getPropertyValue = function(style, prop) {
  let value = style.getPropertyValue(prop);
  value = value ? value.replace(/[^0-9.]/g, "") : "0";
  return parseFloat(value);
};

let getElementRect = function(element) {
  let style = window.getComputedStyle(element, null);
  return {
    x: getPropertyValue(style, "left"),
    y: getPropertyValue(style, "top"),
    width: getPropertyValue(style, "width"),
    height: getPropertyValue(style, "height")
  };
};

class Resizer {
  constructor(wrapper, element, options) {
    this.wrapper = wrapper;
    this.element = element;
    this.options = options;
    this.offsetX = 0;
    this.offsetY = 0;
    this.handle = document.createElement("div");
    this.handle.setAttribute("class", "drag-resize-handlers");
    this.handle.setAttribute("data-direction", "br");
    this.wrapper.appendChild(this.handle);
    this.wrapper.style.top = this.element.style.top;
    this.wrapper.style.left = this.element.style.left;
    this.wrapper.style.width = this.element.style.width;
    this.wrapper.style.height = this.element.style.height;
    this.element.style.position = "relative";
    this.element.style.top = 0;
    this.element.style.left = 0;
    this.onResize = this.resizeHandler.bind(this);
    this.onStop = this.stopResize.bind(this);
    this.handle.addEventListener("mousedown", this.initResize.bind(this));
  }

  initResize(event) {
    this.stopResize(event, true);
    this.handle.addEventListener("mousemove", this.onResize);
    this.handle.addEventListener("mouseup", this.onStop);
  }

  resizeHandler(event) {
    this.offsetX =
      event.clientX - (this.wrapper.offsetLeft + this.handle.offsetLeft);
    this.offsetY =
      event.clientY - (this.wrapper.offsetTop + this.handle.offsetTop);
    let wrapperRect = getElementRect(this.wrapper);
    let elementRect = getElementRect(this.element);
    this.wrapper.style.width = wrapperRect.width + this.offsetX + "px";
    this.wrapper.style.height = wrapperRect.height + this.offsetY + "px";
    this.element.style.width = elementRect.width + this.offsetX + "px";
    this.element.style.height = elementRect.height + this.offsetY + "px";
  }

  stopResize(event, nocb) {
    this.handle.removeEventListener("mousemove", this.onResize);
    this.handle.removeEventListener("mouseup", this.onStop);
  }
}

class Dragger {
  constructor(wrapper, element, options) {
    this.wrapper = wrapper;
    this.options = options;
    this.element = element;
    this.element.draggable = true;
    this.element.setAttribute("draggable", true);
    this.element.addEventListener("dragstart", this.dragStart.bind(this));
  }

  dragStart(event) {
    let wrapperRect = getElementRect(this.wrapper);
    var x = wrapperRect.x - parseFloat(event.clientX);
    var y = wrapperRect.y - parseFloat(event.clientY);
    event.dataTransfer.setData(
      "text/plain",
      this.element.id + "," + x + "," + y
    );
  }

  dragStop(event, prevX, prevY) {
    var posX = parseFloat(event.clientX) + prevX;
    var posY = parseFloat(event.clientY) + prevY;
    this.wrapper.style.left = posX + "px";
    this.wrapper.style.top = posY + "px";
  }
}

class DragResize {
  constructor(element, options) {
    options = options || {};
    this.wrapper = document.createElement("div");
    this.wrapper.setAttribute("class", "tooltip drag-resize");
    if (element.parentNode) {
      element.parentNode.insertBefore(this.wrapper, element);
    }
    this.wrapper.appendChild(element);
    element.resizer = new Resizer(this.wrapper, element, options);
    element.dragger = new Dragger(this.wrapper, element, options);
  }
}

document.body.addEventListener("dragover", function(event) {
  event.preventDefault();
  return false;
});

document.body.addEventListener("drop", function(event) {
  event.preventDefault();
  var dropData = event.dataTransfer.getData("text/plain").split(",");
  var element = document.getElementById(dropData[0]);
  element.dragger.dragStop(
    event,
    parseFloat(dropData[1]),
    parseFloat(dropData[2])
  );
  return false;
});
