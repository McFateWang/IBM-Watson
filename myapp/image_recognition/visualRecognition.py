import json
from watson_developer_cloud import VisualRecognitionV3
from Contours import getSubImg
import numpy as np
import os
import cv2
from PIL import ImageFont, ImageDraw, Image
import sys
def Trash_Recognize(img):
	visual_recognition = VisualRecognitionV3(
	    '2018-03-19',
	    iam_apikey='X17A2-yHKGw1Fw4SQBTDxIlun-cqaHERL2gpQWxIFYeh')
	#模型：5*100，错误率：4/30，正确率87%
	# with open('./subimg0.jpg', 'rb') as images_file:
		# print(type(images_file))
	images_files = getSubImg(img)
	typelists = []
	boxs = []
	for inf in images_files['imgsinf']:
		p = inf['path']
		with open(p, 'rb') as images_file:
			#inf['img'].tobytes()
			# s = memoryview(inf['img'].tobytes())
			# print(type(s))
			try:
				classes = visual_recognition.classify(
			        # BytesIO(img_encode[1].tostring()).read(),
			        images_file,
			        threshold='0.6',
				classifier_ids='DefaultCustomModel_609025069').get_result()
				res = classes['images'][0]['classifiers'][0]['classes'][0]
				print(res['class'],res['score'])
				typelists.append({'name':res['class'],'score':res['score'],'location':inf['location']})
				boxs.append(inf['location']['box'])
			except:
				print('当前图片部分无相关图像或模型无该类别图片')
		os.remove(p)
	draw_img = cv2.drawContours(images_files['img'].copy(),boxs,-1,(0,0,255),3)
	res = add_type(draw_img,typelists)
	return res
def add_type(img,typelists):
	for typeinf in typelists:
		text_size = cv2.getTextSize(typeinf['name'],cv2.FONT_HERSHEY_COMPLEX,2,2)
		sp = img.shape[0:2]
		y = text_size[0][1]#文字所占的高度
		# # print(y)
		fontface = cv2.FONT_HERSHEY_COMPLEX
		fontscale = 3
		fontcolor = (0,0,0)#BGR
		fontpath = "./simsun.ttc" # 宋体,cv2不支持中文输出，所以要通过PIL进行显示 
		font = ImageFont.truetype(fontpath, 32)
		img_pil = Image.fromarray(img)
		draw = ImageDraw.Draw(img_pil)
		dy = int(typeinf['location']['minY'] - y)
		if dy < 0:
			dy = 0
		draw.text((typeinf['location']['minX'] , dy),  typeinf['name'], font = font, fill = fontcolor)
		img = np.array(img_pil)
	cv2.imwrite('./contour.jpg',img)
	return './contour.jpg'
	# cv2.imwrite('./contour.jpg',img)
if __name__ == '__main__':
	img_path = str(sys.argv[1])#'./img4.jpg'
	img = cv2.imread(img_path)
	res = Trash_Recognize(img)
	print(res)