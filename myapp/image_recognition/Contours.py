import cv2
import numpy as np

def getSubImg(img):
	
	#将图片转成灰度图并高斯去噪
	gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
	blurred =cv2.GaussianBlur(gray,(7,7),0)

	#sobel算子计算x，y方向上的梯度，在x方向上minus y方向上的梯度
	# 作用：留下具有高水平梯度和低垂直梯度的图像区域
	gradX = cv2.Sobel(blurred,ddepth = cv2.CV_32F,dx = 1, dy = 0)
	gradY = cv2.Sobel(blurred, ddepth = cv2.CV_32F, dx = 0, dy = 1)
	gradient = cv2.subtract(gradX,gradY)
	gradient = cv2.convertScaleAbs(gradient)
	# canny = cv2.Canny(gradient, 50, 150)
	#继续去噪声，二值化

	blurred = cv2.GaussianBlur(gradient,(7,7),0)
	# thresh = cv2.adaptiveThreshold(blurred,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY,11,0)
	(_, thresh) = cv2.threshold(blurred,10,255,cv2.THRESH_BINARY)
	
	#建立一个椭圆核函数ELLIPSE核，CLOSE操作，图像形态学
	kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
	#形态学，先腐蚀，后膨胀可以去除亮点
	closed = cv2.morphologyEx(thresh,cv2.MORPH_CLOSE,kernel)

	closed = cv2.dilate(closed , None , iterations = 10)
	closed = cv2.erode(closed, None,iterations = 4)
	# opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel)
	
	# opened = cv2.erode(opened, None,iterations = 4)
	# opened = cv2.dilate(opened , None , iterations = 4)
	contours,hierarchy = cv2.findContours(
					closed.copy(),
					cv2.RETR_LIST,
					cv2.CHAIN_APPROX_SIMPLE
		)

	c = sorted(contours,key = cv2.contourArea , reverse = True)#[0]
	
	boxs = []
	subimgs = []
	Rects = []
	for contour in c:
		rect = cv2.minAreaRect(contour)
		box = np.int0(cv2.boxPoints(rect))
		#[  0  87],[  0   0],[103   0],[103  87]
		maxX = 0
		minX = -1
		maxY = 0
		minY = -1
		for p in box:
			maxX = maxX if maxX > p[0] else p[0]
			minX = p[0] if minX == -1 or minX > p[0] else minX
			maxY = maxY if maxY > p[1] else p[1]
			minY = p[1] if minY == -1 or minY > p[1] else minY
		
		# subimgs.append({'img':img[minY:maxY,minX:maxX],'inf':{'minY':minY,'maxY':maxY,'minX':minX,'maxX':maxX}})
		# boxs.append(box)


		target_del = True
		for i in range(len(Rects)-1,-1,-1):
			r = Rects[i]
			if minY >= r['minY'] and maxY < r['maxY'] and minX >= r['minX'] and maxX < r['maxX']:
				target_del = False
				break
			if  minY <= r['minY'] and maxY > r['maxY'] and minX <= r['minX'] and maxX > r['maxX']:
				Rects .pop(i)
		if target_del:
			Rects.append({'minY':minY,'maxY':maxY,'minX':minX,'maxX':maxX,'box':box})
	for r in Rects:
		subimgs.append({'img':img[r['minY']:r['maxY'],r['minX']:r['maxX']],'inf':r})
		boxs.append(r['box'])
	imgsinf = []
	for i,subimg in enumerate(subimgs):
		path = './subimg'+str(i)+'.jpg'
		imgsinf.append({'path':path,'location':subimg['inf']})
		cv2.imwrite(path,subimg['img'])
	return {'img':img,'imgsinf':imgsinf}