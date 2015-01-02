
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

// generic error handler
function errHandler(err) {
	console.log(err);
}

// use default config, STUN servers, ...
var localPeer = new RTCPeerConnection(null);
var remotePeer = new RTCPeerConnection(null);

// gathers candidates and sends them to the other peer
localPeer.onicecandidate = function (event) {
	var candidate = event.candidate;
	if (!candidate) return console.log('> end-of-candidates for localPeer');
	console.log('localPeer gathered candidate');
	remotePeer.addIceCandidate(candidate, candidateSuccess, errHandler);
};
remotePeer.onicecandidate = function (event) {
	var candidate = event.candidate;
	if (!candidate) return console.log('> end-of-candidates for remotePeer');
	console.log('remotePeer gathered candidate');
	localPeer.addIceCandidate(candidate, candidateSuccess, errHandler);
};
function candidateSuccess() {
	console.log('successfully set ice candidate');
}

var dataChannel = localPeer.createDataChannel('dataChannel');
dataChannel.onopen = function() {
	console.log('\n\nchannel opened!');
	(function sayHi() {
		dataChannel.send('Hi');
		setTimeout(sayHi, 750);
	})();
};
dataChannel.onmessage = function(event) {
	console.log('localPeer received: '+event.data);
};
dataChannel.onerror = errHandler;
dataChannel.onclose = function(event) {
	console.log('local channel closed');
	console.log(event);
};

// remotePeer gets data channel created by localPeer
remotePeer.ondatachannel = function(event) {
	event.channel.onmessage = function(event) {
		console.log('remotePeer received: '+event.data);
	};
	function sayYo() {
		setTimeout(sayYo, 1000);
		event.channel.send('Yo');
	}
	event.channel.onopen = sayYo;
};

localPeer.createOffer(offerSuccess, errHandler);
function offerSuccess(desc) {
	console.log();
	console.log('created offer');
	console.log(desc.sdp);
	console.log();
	localPeer.setLocalDescription(desc, localDescriptionSuccess, errHandler);
	remotePeer.setRemoteDescription(desc, remoteDescriptionSuccess, errHandler);
	remotePeer.createAnswer(answerSuccess, errHandler);
}
function answerSuccess(desc) {
	console.log();
	console.log('created answer');
	console.log(desc.sdp);
	console.log();
	remotePeer.setLocalDescription(desc, localDescriptionSuccess, errHandler);
	localPeer.setRemoteDescription(desc, remoteDescriptionSuccess, errHandler);
}
function localDescriptionSuccess() {
	console.log('success setting local description');
}
function remoteDescriptionSuccess() {
	console.log('success setting remote description');
}