// let socket = io();

// canvas element
let canvas = $("canvas")[0];
let colors = $(".color");
let clearb = $("#clear");
let eraser = $("#eraser");

let context = canvas.getContext('2d');

// background color
context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

let current = {
  color: 'black',
  lineWidth: 2
};
let drawing = false;
let erasing = false;

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
// $("canvas").attr("width", $("#wb").width());

function drawLine(x0, y0, x1, y1, color, emit){
  // console.log(x0, y0, x1, y1);
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
    color: color,
    lineWidth: current.lineWidth
  });
}


// Event Listeners for Drawing
function onMouseDown(e){
  // let canvasOffset = $("#canvas").offset();
  let canvasOffset = $(".whiteboard").offset();
  let offsetX = canvasOffset.left;
  let offsetY = canvasOffset.top;
  console.log(offsetX, offsetY);

  drawing = true;
  current.x = parseInt(e.clientX-offsetX);
  current.y = parseInt(e.clientY-offsetY);
  // current.x = e.clientX||e.touches[0].clientX;
  
  console.log(current);
}

function onMouseUp(e){
  let canvasOffset = $(".whiteboard").offset();
  let offsetX = canvasOffset.left;
  let offsetY = canvasOffset.top;
  console.log(offsetX, offsetY);

  if (!drawing) {return;}
  drawing = false;
  let x = parseInt(e.clientX-offsetX);
  let y = parseInt(e.clientY-offsetY);
  drawLine(current.x, current.y, x, y, current.color, true);
}

function onMouseMove(e){
  if (!drawing) { return; }

  // let canvasOffset = $("#canvas").offset();
  let canvasOffset = $(".whiteboard").offset();
  let offsetX = canvasOffset.left;
  let offsetY = canvasOffset.top;
  let x = parseInt(e.clientX-offsetX);
  let y = parseInt(e.clientY-offsetY);
  
  drawLine(current.x, current.y, x, y, current.color, true);
  current.x = x;
  current.y = y;
}


let color_map = {
  "black": "black",
  "red": "red",
  "blue": "#3498db",
  "green": "green",
  "yellow": "rgb(253, 236, 0)",
  "orange": "#e67e22",
  "purple": "#9b59b6",
  "pink": "#fd79a8",
  "brown": "#834c32",
  "grey": "rgb(194, 194, 194)"
};

function onColorUpdate(e){
  current.color = color_map[e.target.className.split(' ')[1]];
  document.querySelector(
    ".whiteboard"
  ).style = `cursor: unset;`;
  current.lineWidth = 2;
}


//to limit the number of events per second
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

// socket event, collaborative whiteboard isi se banta hai
function onDrawingEvent(data){
  let w = canvas.width;
  let h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}


// review later
// make the canvas fill its parent
function onResize() {
  // let ww = $("#canvas").parent().width();
  // let hh = $("#canvas").parent().height();
  canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}


// eraser functionality
// improve in terms of pen width
function setEraser() {
  current.color = "white";
  document.querySelector(
    ".whiteboard"
  ).style = `cursor:url('../Images/erase.png'),auto;`;
  current.lineWidth = 10;
}

//clear board
function clearBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  socket.emit('clearBoard');
}

socket.on('clearBoard', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
})


function download_wb(){
  let image = canvas.toDataURL("image/jpg");
  let file = document.createElement('a');
  // let name = "meeting_whiteboard"; 

  file.download = "meeting_whiteboard.jpeg";
  file.href = image;
  file.click();
}