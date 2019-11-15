// 使用 watson NLU 功能

const express = require('express');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');

// 开启nlu连接
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
        'wetGrabage': '湿垃圾'
    },
    '北京': {
        'recycling': '可回收物',
        'harmful': '有害垃圾',
        'dryGrabage': '其他垃圾',
        'wetGrabage': '厨余垃圾'
    }

}

// 报错信息
var botError = {
    'output': {
        'generic': [
            {
                'response_type': 'text',
                'text': '很抱歉，文本分析无法识别。请重新输入~'
            }
        ]
    },
    'tag': 'finish'
};

// 核心函数
function showNLU(userArea, userText) {
    console.log('执行 ', userArea, ' 地区用户的文本分析：', userText);

    // 包装text
    const analyzeParams = {
        'text': userText,
        'features': {
            'entities': {
                'model': '2fb8102d-ef8f-4546-8bc8-3fab741dce14',
                'limit': 50,
            }
        }
    };
    console.log('输入打包:', JSON.stringify(analyzeParams, null, 2));

    // 打印模型查看
    // nlu.listModels()
    //     .then(listModelsResults => {
    //         console.log(JSON.stringify(listModelsResults, null, 2));
    //     })
    //     .catch(err => {
    //         console.log('error:', err);
    //     });

    // 使用analyze功能
    nlu.analyze(analyzeParams, (err, results) => {
        if (err) {
            console.log('文本分析异常....\n', err);
            return botError;
        }
        else {
            // 处理输出文本
            console.log(JSON.stringify(results.result, null, 2));
            var entities = results.result.entities;
            var response = '';

            console.log('entities', entities);

            if(entities == []){
                console.log('文本分析返回为空....\n');
                return botError;
            }
            else{
                // 依次提取 物品+地区下分类名称
                entities.map( (value) => {
                    response = response + value['text'] + '--' + rule[userArea][value['type']] + ' ';
                })
                console.log(response);
                console.log('nlu使用完成...');
                // 打包成 assistant 的格式
                var botMessage = {
                    'output': {
                        'generic': [
                            {
                                'response_type': 'text',
                                'text': response
                            }
                        ]
                    },
                    'tag': 'finish'
                };
                return botMessage;
            }
        }
    })
}

// 导出包设置
module.exports = {
    showNLU
}