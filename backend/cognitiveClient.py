from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
import fileClient
from dotenv import load_dotenv
load_dotenv('.env')
import os

endpoint = os.environ.get('COGNITIVE_SERVICE_ENDPOINT')
key = os.environ.get('COGNITIVE_SERVICE_KEY')

credentials = CognitiveServicesCredentials(key)
client = ComputerVisionClient(
    endpoint=endpoint,
    credentials=credentials
)


# TEST: https://media.npr.org/assets/img/2021/11/10/white-tailed-deer-1-ac07593f0b38e66ffac9178fb0c787ca75baea3d-s1100-c50.jpg
def getTagsOfImage(url):
    image_analysis = client.analyze_image(url,visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags])

def getTextDescriptionOfImage(url):
    language = "en"
    max_descriptions = 3

    analysis = client.describe_image(url, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result

def getTagsOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithName(uid, fileName)
    image_analysis = client.analyze_image_in_stream(fileObj,visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags])

def getTextDescriptionOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithName(uid, fileName)
    language = "en"
    max_descriptions = 3
    analysis = client.describe_image_in_stream(fileObj, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result