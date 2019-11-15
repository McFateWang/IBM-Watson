// api文件，和后端交互传输
// The Api module is designed to handle all interactions with the server

var Api = (function () {
	var requestPayload;
	var responsePayload;
	var messageEndpoint = '/api/message'; // 信息交流的url

	var sessionEndpoint = '/api/session'; // 建立对话的url

	var sessionId = null;

	// 返回 两个函数接口，
	// Publicly accessible methods defined
	return {
		sendRequest: sendRequest,
		getSessionId: getSessionId,

		// 防止其他文件引用api文件的methods时重名冲突？
		// 用 公有函数成员 保护 私用变量成员 只查不改
		// The request/response getters/setters are defined here to prevent internal methods
		// from calling the methods without any of the callbacks that are added elsewhere.
		getRequestPayload: function () {
			return requestPayload;
		},
		setRequestPayload: function (newPayloadStr) {
			requestPayload = JSON.parse(newPayloadStr);
		},
		getResponsePayload: function () {
			return responsePayload;
		},
		setResponsePayload: function (newPayloadStr) {
			responsePayload = JSON.parse(newPayloadStr).result;
		},
		setErrorPayload: function () {
		}
	};

	// http get，发起对话连接请求，收到result后记录sessionID
	function getSessionId(callback) {
		var http = new XMLHttpRequest();
		http.open('GET', sessionEndpoint, true);
		http.setRequestHeader('Content-type', 'application/json');
		http.onreadystatechange = function () {
			if (http.readyState === XMLHttpRequest.DONE) {
				let res = JSON.parse(http.response);
				sessionId = res.result.session_id;
				callback();
			}
		};
		http.send();
	}

	// http post，发送数据
	// Send a message request to the server
	function sendRequest(text) {

		// 打包成watson的文本输入
		// Build request payload
		var payloadToWatson = {
			session_id: sessionId
		};

		payloadToWatson.input = {
			message_type: 'text',
			text: text,
		};

		// HTTP发送post请求
		// Built http request
		var http = new XMLHttpRequest();
		http.open('POST', messageEndpoint, true);
		http.setRequestHeader('Content-type', 'application/json');
		http.onreadystatechange = function () {
			if (http.readyState === XMLHttpRequest.DONE && http.status === 200 && http.responseText) {
				Api.setResponsePayload(http.responseText);
			} else if (http.readyState === XMLHttpRequest.DONE && http.status !== 200) {
				Api.setErrorPayload({
					'output': {
						'generic': [
							{
								'response_type': 'text',
								'text': 'I\'m having trouble connecting to the server, please refresh the page'
							}
						],
					}
				});
			}
		};

		// 打包成json
		var params = JSON.stringify(payloadToWatson);
		// Stored in variable (publicly visible through Api.getRequestPayload)
		// to be used throughout the application
		if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
			Api.setRequestPayload(params);
		}

		// Send request
		http.send(params);
	}
}());
