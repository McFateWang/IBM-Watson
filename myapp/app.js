// *
// 后端主程序 - 提供和assistant的连接，和前端通信的url
// 实现调用其他服务
// *

'use strict';

// 导入所有包
var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV2 = require('ibm-watson/assistant/v2'); // watson sdk
const { IamAuthenticator } = require('ibm-watson/auth');

// 使用nodejs express框架
var app = express();

// express设置静态资源文件目录
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json()); // 使用bodyparserk库做json解析

// 创建 assistant 服务连接
// Create the service wrapper
console.log('---------------------------\n ');
console.log('----  服务启动中...  ------\n');
console.log('---------------------------\n ');

var assistant = new AssistantV2({
	version: '2019-02-28',
	authenticator: new IamAuthenticator({
		apikey: process.env.ASSISTANT_IAM_APIKEY,
	}),
	url: process.env.ASSISTANT_URL,
});

// 后端的一些标记变量
var userArea = '未设定';
var functionTag = '聊天';


// 接收前端的req，发送到assistant，收到信息后，res发给前端
// Endpoint to be call from the client side

app.post('/api/message', async function (req, res) {
	// ----------------- 处理req ------------------	
	 // 通过dontenv找到预先设定的环境变量，就是.env文件
	let assistantId = process.env.ASSISTANT_ID || '<assistant-id>'; 
	if (!assistantId || assistantId === '<assistant-id>') {
		return res.json({
			output: {
				text:
					'<b>ASSISTANT_ID</b>没有设定！',
			},
		});
	}

	// 提取req中input的text
	var textIn = '';
	if (req.body.input) {
		textIn = req.body.input.text;
	}

	// 打包输入 payload负荷：对话id和input信息（指定text类型）
	var payload = {
		assistantId: assistantId,
		sessionId: req.body.session_id,
		input: {
			message_type: 'text',
			text: textIn,
		},
	};

	// ----------------- 调用子功能 ------------------
	// 当用户上一次发起子功能后，检查标记，本次post执行子功能

	// 图像识别模块
	if ( functionTag === '图像识别' ) {
		console.log('正在处理图像识别.......')
		// 图像识别子程序
		functionTag = '聊天'; //重置
	}

	// 文本分析模块
	else if ( functionTag === '文本分析' ) {
		console.log(' \n ==================================== ');
		// 加载 文本分析子程序
		var wjNLU = require('./wj_nlu');
		// 处理异步问题
		var resultsPromise = wjNLU.showNLU(userArea, textIn); // 该函数需要同步执行
		res = await resultsPromise.then((results)=> {
			// 正确调用重置标记，否则下次输入仍然文本分析
			console.log('获取result： ', JSON.stringify(results, null, 2));
			if (results['state'] === 'success') {
				console.log('文本分析服务成功');
				functionTag = '聊天'; //重置
			}
			else {
				console.log('文本分析服务调用失败....');
			}
			console.log(' ==================================== \n');
			return res.json(results);			
		})
		return res;
	}

	// ----------------- 记录标记 --------------------

	console.log('\n****************************\n');
	console.log('识别用户message中:  ', textIn);
	switch ( textIn ) {
		case '上海': userArea = '上海';break;
		case '北京': userArea = '北京';break;
		case '图像识别':
		case '识图':
			functionTag = '图像识别';break;
		case '文本分析':
		case '文字':
			functionTag = '文本分析';break;
		default: 
	}
	console.log('当前用户地区： ', userArea,  '  当前功能:  ', functionTag);
	console.log('\n****************************\n');

	// ----------------- 和assistant交流 --------------------	

	// Send the input to the assistant service
	assistant.message(payload, function (err, data) {
		if (err) {
			const status = err.code !== undefined && err.code > 0 ? err.code : 500;
			return res.status(status).json(err);
		}
		// 成功则返回res给前端
		console.log('bot-message： \n', JSON.stringify(data['result'], null, 2));
		return res.json(data);
	});
});


// 创建对话，只执行一次，没有req，返回res搭配前端

app.get('/api/session', function (req, res) {
	assistant.createSession(
		{
			assistantId: process.env.ASSISTANT_ID || '{assistant_id}',
		},
		function (error, response) {
			if (error) {
				console.log('ERR: assistant会话建立失败...');
				console.log(error);
				return res.send(error);
			} else {
				console.log('assistant会话建立成功...');
				return res.send(response);
			}
		}
	);
});

module.exports = app;