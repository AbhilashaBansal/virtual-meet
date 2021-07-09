// let socket = io();

let canvas = $("canvas")[0];
let colors = $(".color");
let clearb = $("#clear");
let eraser = $("#eraser");

let context = canvas.getContext('2d');

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);


let current = {
  color: 'black'
};
let drawing = false;

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

//Touch support for mobile devices
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

for (let i = 0; i < colors.length; i++){
  colors[i].addEventListener('click', onColorUpdate, false);
}

socket.on('drawing', onDrawingEvent);

// window.addEventListener('resize', onResize, false);
// onResize();


function drawLine(x0, y0, x1, y1, color, emit){
  console.log(x0, y0, x1, y1);
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  if (!emit) { return; }
  let w = canvas.width;
  let h = canvas.height;

  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color
  });
}


function onMouseDown(e){
  let canvasOffset=$("#canvas").position();
  let offsetX=canvasOffset.left;
  let offsetY=canvasOffset.top;
  console.log(offsetX, offsetY);

  drawing = true;
  // let pos = getMousePos(canvas, e);
  current.x = parseInt(e.clientX-offsetX);
  // current.x = e.clientX||e.touches[0].clientX;
  current.y = parseInt(e.clientY-offsetY);
  console.log(current);
}

function onMouseUp(e){
  let canvasOffset=$("#canvas").position();
  let offsetX=canvasOffset.left;
  let offsetY=canvasOffset.top;
  console.log(offsetX, offsetY);

  if (!drawing) {return;}
  drawing = false;
  let x = parseInt(e.clientX-offsetX);
  let y = parseInt(e.clientY-offsetY);
  drawLine(current.x, current.y, x, y, current.color, true);
}

function onMouseMove(e){
  if (!drawing) { return; }
  let canvasOffset=$("#canvas").position();
  let offsetX=canvasOffset.left;
  let offsetY=canvasOffset.top;
  let x = parseInt(e.clientX-offsetX);
  let y = parseInt(e.clientY-offsetY);
  
  drawLine(current.x, current.y, x, y, current.color, true);
  current.x = x;
  current.y = y;
}

function onColorUpdate(e){
  current.color = e.target.className.split(' ')[1];
}

// limit the number of events per second
function throttle(callback, delay) {
  let previousCall = new Date().getTime();
  return function() {
    let time = new Date().getTime();

    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function onDrawingEvent(data){
  let w = canvas.width;
  let h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
  let ww = $("#canvas").parent().width();
  let hh = $("#canvas").parent().height();

  canvas.width = ww;
  canvas.height = hh;
}


function download_wb(){
  let image = canvas.toDataURL("image/jpg");
  let file = document.createElement('a');
  // let name = "meeting_whiteboard"; 

  file.download = "meeting_whiteboard.jpeg";
  file.href = image;
  file.click();
}