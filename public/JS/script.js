const socket = io('/');

$(".show-later").hide();

// Video Grids
const preVideo = $("#my-video");
const videosGrid = $("#videos-grid");

let username;
let myVideoStream;
let myVideo = document.createElement('video');
myVideo.muted = true;

// Peer JS stuff 
let peer = new Peer (undefined, {
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
  // apni video add kardi
  addVideoStream(myVideo, stream, preVideo);

  // jab server pe new user connect ho raha hai, to usey call karna hai
  socket.on('user-connected', (userId) =>{
    callNewUser(userId, myVideoStream);
  })

  // kisi new user ki call aa rahi ho, to answer it
  peer.on('call', (call) => {
    call.answer(myVideoStream);
    let video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    })
  })
}).catch((er)=>{
  // check later
  window.console.log("here");
  // addVideoStream(myVideo, stream);
})


// fn to connect w/ a new incoming user
function callNewUser (userId, stream) {
    let call = peer.call(userId, stream);
    let video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    })
}


// after the pre-call area
peer.on('open', (id) => {
  $("#enter-btn").click((e)=>{
    username = $("#username").val() || "A User";
    
    videosGrid.append($("#my-video > video"));
  
    $(".hide-later").hide();
    $(".show-later").show();
  
    socket.emit('join-room', room_id, id, username);
    
  })
})

// $("#enter-btn").click((e)=>{
//   username = $("#username").val() || "A User";
  
//   videosGrid.append($("#my-video > video"));

//   $(".hide-later").hide();
//   $(".show-later").show();
// })

