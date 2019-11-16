// *
// 使用 watson NLU 功能
// *

// 导入包
const express = require('express');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');

// 开启 nlu 连接
var nluApiKey = 'VpL4AIBGA20FJobDWWS4EUzCW1Rsf915rtPUsceZGXri'
var nluUrl = 'https://gateway.watsonplatform.net/natural-language-understanding/api'
const nlu = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    authenticator: new IamAuthenticator({
        apikey: nluApiKey,
    }),
    url: nluUrl,
});

// 分类规则
var rule = {
    '上海': {
        'recycling': '可回收物',
        'harmful': '有害垃圾',
        'dryGrabage': '干垃圾',
        'wetGarbage': '湿垃圾'
    },
    '北京': {
        'recycling': '可回收物',
        'harmful': '有害垃圾',
        'dryGrabage': '其他垃圾',
        'wetGarbage': '厨余垃圾'
    }
}

// 报错信息
var botError = {
    result: {
        output: {
            generic: [
                {
                    response_type: 'text',
                    text: '很抱歉，文本分析无法识别。请重新输入~'
                }
            ]
        }
    },
    state: 'error'
};

// 核心函数
async function showNLU(userArea, userText) {
    console.log('执行 ', userArea, ' 地区用户的文本分析：', userText);

    // ----------------- 包装text------------------
    const analyzeParams = {
        'text': userText,
        'features': {
            'entities': {
                'model': 'bf586c3c-de2e-48c7-ab37-9dd900bfbfbc',
                'limit': 50,
            }
        }
    };
    console.log('输入打包:', JSON.stringify(analyzeParams, null, 2));

    // ----------------- 打印模型查看------------------
    // nlu.listModels()
    //     .then(listModelsResults => {
    //         console.log(JSON.stringify(listModelsResults, null, 2));
    //     })
    //     .catch(err => {
    //         console.log('error:', err);
    //     });

    // ----------------- 使用nlu服务 ------------------
    // 处理异步问题，通过promise强制同步
    return new Promise((resolve,reject )=>{
        // nlu的analyze接口
        nlu.analyze(analyzeParams, (err, results) => {
            if (err) {
                console.log('文本分析异常....\n', err);
                resolve(botError); //这里的异常也返回，让用户修正他的输入
            }
            else {  // 处理输出文本
                // console.log(JSON.stringify(results.result, null, 2));
                var entities = results.result.entities;
                if(entities == []){
                    console.log('文本分析返回为空....\n');
                    return botError;
                }
                else{
                    console.log('实体: \n', entities);
                    botMessage = doBotMessage(userArea, entities);
                    console.log('nlu输出打包： \n', botMessage);
                    resolve(botMessage);
                }
            }
        })
    })
}

// 统计entites
function doBotMessage(userArea, entities) {
    // 打包成 assistant 的格式
    var botMessage = {
        result : {
            output: {
                generic: [
                    {
                        response_type: 'text',
                        text: '文本分析结果如下：'
                    },
                ]
            }
        },
    state: 'success'
    };                  
    // 依次提取 物品+地区下分类名称
    entities.map( (value) => {
        var entity = value['text'] + ' —— ' + rule[userArea][value['type']];  
        var temp = {
            response_type: 'text',
            text: entity
        }
        botMessage.result.output.generic.push(temp);
    });
    // 过渡
    var temp = {
        response_type: 'text',
        text: '---------------' 
    }    
    botMessage.result.output.generic.push(temp);
    var temp = {
        response_type: 'text',
        text: '垃圾分类报告：'
    }
    botMessage.result.output.generic.push(temp);
    // 分类计数
    var cal = {
        'recycling': 0,
        'harmful': 0,
        'dryGrabage': 0,
        'wetGarbage': 0
    };
    entities.map( (value) => {
        cal[ value['type'] ] += 1;  
    });
    Object.getOwnPropertyNames(cal).forEach(function(key){
        var temp = {
            response_type: 'text',
            text: '您处理了 ' + cal[key] + ' 件' + rule[userArea][key]
        };       
        botMessage.result.output.generic.push(temp);
    });
    // 全部计数
    var num = entities.length*10 + Math.round(Math.random()*10) + Math.round(Math.random()*10)*0.1;
    if ( num >= 100 ) {
        num = 99.9;
    }

    var temp = {
        response_type: 'text',
        text: '恭喜您，打败了 ' + userArea +  ' 地区的 ' + num + '% 用户！'       
    }
    botMessage.result.output.generic.push(temp);
    return botMessage;
}

// 导出包设置
module.exports = {
    showNLU
}