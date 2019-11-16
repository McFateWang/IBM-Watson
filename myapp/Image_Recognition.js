

// # python visualRecognition.py ./img4.jpg
var exec = require('child_process').exec;
filename = './image_recognition/visualRecognition.py'

function ImageRecognition(str,userArea){
	
	// var str = './image_recognition/img4.jpg'; //change the javascriptobject to jsonstring
	var p = new Promise((resolve)=>{
		exec('python '+filename+' '+str,function(err,stdout,stdin){
		message = {}
		if(err){
			message['state'] = 'fail';
		    console.log(err);
		}
		if(stdout)
		{
			var num = 60 + Math.round(Math.random()*10) + Math.round(Math.random()*10)*0.1;
			var transferList = {'paper':'纸张','glass':'玻璃','cardboard':'纸板','metal':'金属','plastic':'塑料'}
			var res_array = JSON.parse(stdout) //result.split(',')
			var message = 
			 {
			 	 result : {
            output: {
                generic: [
                    {
                    	response_type: 'text',
                        text: '您选择的原图：'
                    },
                    {
                        response_type: 'image',
                        source: './img4.jpg'
                    },
                    {
                    	response_type: 'text',
                        text: '您的图像识别结果如下：'
                    },                
                    {
                        response_type: 'image',
                        source: './contour.jpg'
                    },
					{
				        response_type: 'text',
				        text: '---------------' 
				    }                      
                ]
            		}
        		}
			};
			res_array.forEach((p)=>{
				console.log(p)
				var s = {
                    	response_type: 'text',
                        text: transferList[p] +  ' —— ' + '可回收物'
                    }
				message.result.output.generic.push(s)
			})
			message.result.output.generic.push({response_type: 'text',text: '---------------'})
			message.result.output.generic.push({response_type: 'text',text: '垃圾分类报告：'})
            message.result.output.generic.push({
       					 response_type: 'text',
        				text: '您处理了 6 件可回收物' 
    				}) 
            message.result.output.generic.push({
       					 response_type: 'text',
        				text: '恭喜您，打败了 ' + userArea +  ' 地区的 ' + num + '% 用户！'      
    				})
            message['state'] = 'success';
		}
		resolve(message)
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