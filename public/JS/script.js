const socket = io('/');

$(".show-later").hide();

const preVideo = $("#my-video");
const videosGrid = $("#videos-grid")

let username;
let myVideoStream;
let myVideo = document.createElement('video')
myVideo.muted = true;

// Peer JS stuff 
var peer = new Peer (undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000'
});


// Appending User Videos
function addVideoStream(video, stream, element) {
  element = element || videosGrid;
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    // add functionality to keep video muted
    video.play()
  })
  element.append(video);
}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then( (stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream, preVideo);

  peer.on('call', (call) => {
    call.answer(stream);
    let video = document.createElement('video');
    call.on('stream', (userVideoStream) =>{
        addVideoStream(video, userVideoStream, videosGrid);
    })
  })

  socket.on('user-connected', (userId) =>{
    connectToNewUser(userId, stream);
  })

}).catch((er)=>{
  // check later
  window.console.log("here");
  // addVideoStream(myVideo, stream);
})


peer.on('open', (id) =>{
  socket.emit('join-room', room_id, id, "sample_user_name");
})

const connectToNewUser = (userId, stream) => {
 let call = peer.call(userId, stream)
 let video = document.createElement('video')
 call.on('stream', (userVideoStream) => {
     addVideoStream(video, userVideoStream);
  })
}



$("#enter-btn").click((e)=>{
  username = $("#username").val() || "A User";
  
  videosGrid.append($("#my-video > video"));

  $(".hide-later").hide();
  $(".show-later").show();

  
})