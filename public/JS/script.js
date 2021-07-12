const socket = io('/');

// $(".show-later").hide();
// $(".options").hide();
$(".leave").hide();
$(".options-btn").hide();
$(".share-code-btn").hide();

const d1_pv = $("#d1-pv");
const d2_wb = $("#d2-wb");
const d3_np = $("#d3-np");

// d2_wb.hide();
// d3_np.hide();

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
let peers = {};

// Appending User Videos
function addVideoStream(video, stream, element) {
  element = element || videosGrid;
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  element.append(video);
}

// mic, camera vaaste permissions
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

  // chat messages vaaste functionlity
  let msg_text = $("#apna_msg");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && msg_text.val().length !== 0) {
      socket.emit('message', msg_text.val(), username);
      msg_text.val('');
    }
  });

  socket.on("createMessage", (message, un) => {
    if(un==username && username!="A User"){
      un = "You";
    }
    $(".messages").append(`<li class="message"><b>${un}</b><br/>${message}</li>`);
    scrollToBottom();
  })

}).catch((er)=>{
  // check later
  window.console.log("here");
  // addVideoStream(myVideo, stream);
})


// fn to connect w/ a new incoming user
function callNewUser(userId, stream) {
    let call = peer.call(userId, stream);
    let video = document.createElement('video')
    // vo call answer karega apni video stream ke saath
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
      video.remove();
    })
  
    peers[userId] = call;
}


// disconnect/ meeting left
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
})


// after the pre-call area
peer.on('open', (id) => {
  $("#enter-btn").click((e)=>{
    username = $("#username").val() || "A User";
    
    videosGrid.append($("#my-video > video"));
    $(".hide-later").hide();
    // $("nav").hide();
    $("body").css("background-color", "rgba(72, 216, 221, 0.801)");
    $(".show-later").show();
    $(".leave").show();
    $(".options-btn").show();
    $(".share-code-btn").show();
  
    socket.emit('join-room', room_id, id, username);
    // room id upar ki script me obtain kar li thi
  })
})


function scrollToBottom () {
  let d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


// Control Bar Functions
function mute_Unmute_my_Mic () {
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

function play_Stop_my_Video () {
  console.log(myVideoStream.getVideoTracks());
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    myVideoStream.getVideoTracks()[0].stop();
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  let html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.mute-btn').innerHTML = html;
}
const setUnmuteButton = () => {
  const html = `
    <i class="unmute-btn fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.mute-btn').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Turn Off Video</span>
  `
  document.querySelector('.video-btn').innerHTML = html;
}
const setPlayVideo = () => {
  const html = `
  <i class="stop-btn fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.video-btn').innerHTML = html;
}


// Control Bar Event Listeners 
$(".leave").click((e)=>{
  location.reload();
})

function show_options () {
  $(".options").toggle();
}

$("#l1-pv").click(()=>{
  d3_np.hide();
  d2_wb.hide();
  d1_pv.show();
  $(".options").hide();
})

$("#l2-wb").click(()=>{
  d3_np.hide();
  d1_pv.hide();
  d2_wb.show();
  $(".options").hide();
})

$("#l3-np").click(()=>{
  d2_wb.hide();
  d1_pv.hide();
  d3_np.show();
  $(".options").hide();

  let ifr = document.getElementsByTagName("iframe")[0];
  let toolbar = document.getElementById("cke_1_top");
  console.log(ifr);
  ifr.contentDocument.body.onkeydown = function(){
    // alert("Change aayo hai!");
    let saamaan = ifr.contentDocument.body.innerHTML;
    console.log(saamaan);
    socket.emit('editor-change', saamaan);
  }
  
  toolbar.onclick = function(){
    // alert("Change aayo hai!");
    let saamaan = ifr.contentDocument.body.innerHTML;
    console.log(saamaan);
    socket.emit('editor-change', saamaan);
  }
})

socket.on('editor-update-kar-rey', (saamaan)=>{
  let ifr = document.getElementsByTagName("iframe")[0];
  ifr.contentDocument.body.innerHTML = saamaan;
})