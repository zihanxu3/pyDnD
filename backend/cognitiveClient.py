# REFERRED FROM MICROSOFT AZURE DOCUMENTATIONS
# Created by Zihan Xu
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
import time
import fileClient
import requests
import shutil
import cv2
import base64
from dotenv import load_dotenv
load_dotenv('.env')
import os

endpoint = os.environ.get('COGNITIVE_SERVICE_ENDPOINT')
key = os.environ.get('COGNITIVE_SERVICE_KEY')
LOCAL_PATH = './data'
if os.path.exists(LOCAL_PATH):
    shutil.rmtree(LOCAL_PATH)
os.makedirs(LOCAL_PATH)
credentials = CognitiveServicesCredentials(key)
client = ComputerVisionClient(
    endpoint=endpoint,
    credentials=credentials
)


# TEST: https://media.npr.org/assets/img/2021/11/10/white-tailed-deer-1-ac07593f0b38e66ffac9178fb0c787ca75baea3d-s1100-c50.jpg
def getTagsOfImage(url):
    image_analysis = client.analyze_image(url,visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags]) + '\n'

def getTextDescriptionOfImage(url):
    language = "en"
    max_descriptions = 3

    analysis = client.describe_image(url, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result

def getTagsOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithNameAsBytes(uid, fileName)
    image_analysis = client.analyze_image_in_stream(fileObj, visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags]) + '\n'

def getTextDescriptionOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithNameAsBytes(uid, fileName)
    language = "en"
    max_descriptions = 3
    analysis = client.describe_image_in_stream(fileObj, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result

def getTextOfImage(url):
    recognition = client.read(url=url, raw=True)
    numberOfCharsInOperationId = 36
    operationLocation = recognition.headers["Operation-Location"]
    idLocation = len(operationLocation) - numberOfCharsInOperationId
    operationId = operationLocation[idLocation:]
    image_analysis = client.get_read_result(operationId)
    while image_analysis.status in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
        time.sleep(1)
        image_analysis = client.get_read_result(operationId)

    print("Recognized:\n")
    lines = image_analysis.analyze_result.read_results[0].lines

    textLines, boundingBoxes = ' > Image Recognition Results: \n' + '\n'.join([i.text for i in lines]), [i.bounding_box for i in lines]
    FILENAME = 'image_name.jpg'
    img_data = requests.get(url).content
    path = os.path.join(LOCAL_PATH, FILENAME)

    with open(path, 'wb') as handler:
        handler.write(img_data)
    
    return textLines, {'image': annotateImage(FILENAME, boundingBoxes), 'text': textLines}

def getTextOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithNameAsBytes(uid, fileName)
    recognition = client.read_in_stream(image=fileObj, raw=True)
    numberOfCharsInOperationId = 36
    operationLocation = recognition.headers["Operation-Location"]
    idLocation = len(operationLocation) - numberOfCharsInOperationId
    operationId = operationLocation[idLocation:]
    image_analysis = client.get_read_result(operationId)
    while image_analysis.status in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
        time.sleep(1)
        image_analysis = client.get_read_result(operationId)

    print("Recognized:\n")
    lines = image_analysis.analyze_result.read_results[0].lines
    textLines, boundingBoxes = '> Image Recognition Results: \n' + '\n'.join([i.text for i in lines]), [i.bounding_box for i in lines]

    return textLines, {'image': annotateImage(fileName, boundingBoxes), 'text': textLines}

def annotateImage(fileName, boundingBoxes): 
    
    path = os.path.join(LOCAL_PATH, fileName)

    img = cv2.imread(path)
    if img is None:
        print('Could not read image')

    imageRectangle = img.copy()
    for i in boundingBoxes:
        start_point =(int(i[0]),int(i[1]))
        end_point =(int(i[4]),int(i[5]))
        cv2.rectangle(imageRectangle, start_point, end_point, (0, 0, 255), thickness=3, lineType=cv2.LINE_8) 

    # path = os.path.join(LOCAL_PATH, 'ANNOTATE' + fileName)
    # cv2.imwrite(path, imageRectangle)
    # imageBytes = open(path, mode='rb')
    imageBytes = cv2.imencode('.jpg', imageRectangle)[1].tobytes()
    data = base64.b64encode(imageBytes).decode()   
    return data








