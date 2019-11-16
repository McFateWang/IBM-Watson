

// # python visualRecognition.py ./img4.jpg
var exec = require('child_process').exec;
filename = './image_recognition/visualRecognition.py'

function ImageRecognition(str,savepath){
	
	// var str = './image_recognition/img4.jpg'; //change the javascriptobject to jsonstring
	var p = new Promise((resolve)=>{
		exec('python '+filename+' '+str +' ' + savepath,function(err,stdout,stdin){

		if(err){
		    console.log(err);
		}
		if(stdout)
		{
			//parse the string
			console.log(stdout);
			// var obj = JSON.parse(stdout);
			resolve(stdout)
		}
	});
	})
	return p
}


module.exports = {
	ImageRecognition
}
// readImage.js
// var  fs=  require('fs');
// module.exports={
//     readImage:function(path,res){
//         fs.readFile(path,'binary',function(err,  file)  {
//             if  (err)  {
//                 console.log(err);
//                 return;
//             }else{
//                 console.log("输出文件");
//                 res.writeHead(200,  {'Content-Type':'image/jpeg'});
//                 res.write(file,'binary');
//                 res.end();
//             }
//         });
//     }
// };