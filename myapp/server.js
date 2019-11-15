// *
// 后端入口，开启server功能
// *

'use strict';

// 使用dotenv从.env环境变量文件中读取
require('dotenv').config({silent: true});

// 导入app文件，打开端口监听
var server = require('./app');
var port = process.env.PORT || 3000;

server.listen(port, function() {
  // eslint-disable-next-line
  console.log('Server running on port: %d', port);
});
