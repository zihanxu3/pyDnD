# IMPLEMENTATIONS REFERRED & ADAPTED FROM MICROSOFT AZURE DOCUMENTATIONS
# Created by Zihan Xu
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.ai.textanalytics import (TextAnalyticsClient, ExtractSummaryAction)
from azure.core.credentials import AzureKeyCredential
from azure.cognitiveservices.vision.face import FaceClient
from azure.cognitiveservices.vision.face.models import FaceAttributeType, HairColorType, TrainingStatusType, Person

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
cv_client = ComputerVisionClient(
    endpoint=endpoint,
    credentials=credentials
)

ta_credential = AzureKeyCredential(key)
text_analytics_client = TextAnalyticsClient(
    endpoint=endpoint, 
    credential=ta_credential
)

face_client = FaceClient(
    endpoint=endpoint, 
    credentials=credentials
)


# TEST: https://media.npr.org/assets/img/2021/11/10/white-tailed-deer-1-ac07593f0b38e66ffac9178fb0c787ca75baea3d-s1100-c50.jpg
def getTagsOfImage(url):
    image_analysis = cv_client.analyze_image(url,visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags]) + '\n'

def getTextDescriptionOfImage(url):
    language = "en"
    max_descriptions = 3

    analysis = cv_client.describe_image(url, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result

def getTagsOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithNameAsBytes(uid, fileName)
    image_analysis = cv_client.analyze_image_in_stream(fileObj, visual_features=[VisualFeatureTypes.tags])
    return "> Tags are: " + ', '.join([i.name for i in image_analysis.tags]) + '\n'

def getTextDescriptionOfImageFromFile(uid, fileName):
    fileObj = fileClient.downloadFileWithNameAsBytes(uid, fileName)
    language = "en"
    max_descriptions = 3
    analysis = cv_client.describe_image_in_stream(fileObj, max_descriptions, language)
    result = ''
    for caption in analysis.captions:
        result += "> Description: " + caption.text + ", With confidence: " + str(caption.confidence) + '\n'
    return result

def getTextOfImage(url):
    recognition = cv_client.read(url=url, raw=True)
    numberOfCharsInOperationId = 36
    operationLocation = recognition.headers["Operation-Location"]
    idLocation = len(operationLocation) - numberOfCharsInOperationId
    operationId = operationLocation[idLocation:]
    image_analysis = cv_client.get_read_result(operationId)
    while image_analysis.status in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
        time.sleep(1)
        image_analysis = cv_client.get_read_result(operationId)

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
    recognition = cv_client.read_in_stream(image=fileObj, raw=True)
    numberOfCharsInOperationId = 36
    operationLocation = recognition.headers["Operation-Location"]
    idLocation = len(operationLocation) - numberOfCharsInOperationId
    operationId = operationLocation[idLocation:]
    image_analysis = cv_client.get_read_result(operationId)
    while image_analysis.status in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
        time.sleep(1)
        image_analysis = cv_client.get_read_result(operationId)

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

def getSentimentOfList(listDocs=[
        "The food and service were unacceptable. The concierge was nice, however."
    ]):
    result = text_analytics_client.analyze_sentiment(listDocs, show_opinion_mining=True)
    doc_result = [doc for doc in result if not doc.is_error]

    # positive_reviews = [doc for doc in doc_result if doc.sentiment == "positive"]
    # negative_reviews = [doc for doc in doc_result if doc.sentiment == "negative"]

    # positive_mined_opinions = []
    # mixed_mined_opinions = []
    # negative_mined_opinions = []
    res = ''

    for document in doc_result:
        res += "Document Sentiment: {}".format(document.sentiment) + '\n'
        res += "Overall scores: positive={0:.2f}; neutral={1:.2f}; negative={2:.2f} \n".format(
            document.confidence_scores.positive,
            document.confidence_scores.neutral,
            document.confidence_scores.negative,
        ) + '\n'
        for sentence in document.sentences:
            res += "Sentence: {}".format(sentence.text) + '\n'
            res += "Sentence sentiment: {}".format(sentence.sentiment) + '\n'
            res += "Sentence score:\nPositive={0:.2f}\nNeutral={1:.2f}\nNegative={2:.2f}\n".format(
                sentence.confidence_scores.positive,
                sentence.confidence_scores.neutral,
                sentence.confidence_scores.negative,
            ) + '\n'
            for mined_opinion in sentence.mined_opinions:
                target = mined_opinion.target
                res += "......'{}' target '{}'".format(target.sentiment, target.text) + '\n'
                res += "......Target score:\n......Positive={0:.2f}\n......Negative={1:.2f}\n".format(
                    target.confidence_scores.positive,
                    target.confidence_scores.negative,
                ) + '\n'
                for assessment in mined_opinion.assessments:
                    res += "......'{}' assessment '{}'".format(assessment.sentiment, assessment.text) + '\n'
                    res += "......Assessment score:\n......Positive={0:.2f}\n......Negative={1:.2f}\n".format(
                        assessment.confidence_scores.positive,
                        assessment.confidence_scores.negative,
                    ) + '\n'
            res += '\n\n'
        res += '\n\n'
    return res

def getSentimentOfFile(uid, fileName):
    fileObj = fileClient.downloadFileWithName(uid, fileName)
    listDocs = [i for i in fileObj]
    result = text_analytics_client.analyze_sentiment(listDocs, show_opinion_mining=True)
    doc_result = [doc for doc in result if not doc.is_error]

    # positive_reviews = [doc for doc in doc_result if doc.sentiment == "positive"]
    # negative_reviews = [doc for doc in doc_result if doc.sentiment == "negative"]

    # positive_mined_opinions = []
    # mixed_mined_opinions = []
    # negative_mined_opinions = []
    res = ''

    for document in doc_result:
        res += "Document Sentiment: {}".format(document.sentiment) + '\n'
        res += "Overall scores: positive={0:.2f}; neutral={1:.2f}; negative={2:.2f} \n".format(
            document.confidence_scores.positive,
            document.confidence_scores.neutral,
            document.confidence_scores.negative,
        ) + '\n'
        for sentence in document.sentences:
            res += "Sentence: {}".format(sentence.text) + '\n'
            res += "Sentence sentiment: {}".format(sentence.sentiment) + '\n'
            res += "Sentence score:\nPositive={0:.2f}\nNeutral={1:.2f}\nNegative={2:.2f}\n".format(
                sentence.confidence_scores.positive,
                sentence.confidence_scores.neutral,
                sentence.confidence_scores.negative,
            ) + '\n'
            for mined_opinion in sentence.mined_opinions:
                target = mined_opinion.target
                res += "......'{}' target '{}'".format(target.sentiment, target.text) + '\n'
                res += "......Target score:\n......Positive={0:.2f}\n......Negative={1:.2f}\n".format(
                    target.confidence_scores.positive,
                    target.confidence_scores.negative,
                ) + '\n'
                for assessment in mined_opinion.assessments:
                    res += "......'{}' assessment '{}'".format(assessment.sentiment, assessment.text) + '\n'
                    res += "......Assessment score:\n......Positive={0:.2f}\n......Negative={1:.2f}\n".format(
                        assessment.confidence_scores.positive,
                        assessment.confidence_scores.negative,
                    ) + '\n'
            res += '\n\n'
        res += '\n\n'
    return res

def getExtractiveSummarizationOfList(document = [
        "The extractive summarization feature uses natural language processing techniques to locate key sentences in an unstructured text document. "
        "These sentences collectively convey the main idea of the document. This feature is provided as an API for developers. " 
        "They can use it to build intelligent solutions based on the relevant information extracted to support various use cases. "
        "In the public preview, extractive summarization supports several languages. It is based on pretrained multilingual transformer models, part of our quest for holistic representations. "
        "It draws its strength from transfer learning across monolingual and harness the shared nature of languages to produce models of improved quality and efficiency. "
    ]):
    

    poller = text_analytics_client.begin_analyze_actions(
        document,
        actions=[
            ExtractSummaryAction(max_sentence_count=4)
        ],
    )

    res = ''
    document_results = poller.result()
    for result in document_results:
        extract_summary_result = result[0]  # first document, first result
        if extract_summary_result.is_error:
            res += "...Is an error with code '{}' and message '{}'".format(
                extract_summary_result.code, extract_summary_result.message
            ) + '\n'
        else:
            res += "Summary extracted: \n{}".format(
                " ".join([sentence.text for sentence in extract_summary_result.sentences])
            ) + '\n'
    return res

def getExtractiveSummarizationOfFile(uid, fileName):
    fileObj = fileClient.downloadFileWithName(uid, fileName)
    document = [i for i in fileObj]
    poller = text_analytics_client.begin_analyze_actions(
        document,
        actions=[
            ExtractSummaryAction(max_sentence_count=4)
        ],
    )

    res = ''
    document_results = poller.result()
    for result in document_results:
        extract_summary_result = result[0]  # first document, first result
        if extract_summary_result.is_error:
            res += "...Is an error with code '{}' and message '{}'".format(
                extract_summary_result.code, extract_summary_result.message
            ) + '\n'
        else:
            res += "Summary extracted: \n{}".format(
                " ".join([sentence.text for sentence in extract_summary_result.sentences])
            ) + '\n'
    return res

def getKeyPhraseFromList(documents = ["Dr. Smith has a very modern medical office, and she has great staff."]):
    res = ''
    try:
        response = text_analytics_client.extract_key_phrases(documents = documents)[0]

        if not response.is_error:
            res += "Key Phrases: "
            res += ', '.join(response.key_phrases)
        else:
            res += 'Error id: {}, Error: {}'.format(response.id, response.error)

    except Exception as err:
        res += "Encountered exception. {}".format(err)
    
    return res

def getKeyPhraseFromFile(uid, fileName):
    res = ''
    fileObj = fileClient.downloadFileWithName(uid, fileName)
    documents = [i for i in fileObj]
    try:
        response = text_analytics_client.extract_key_phrases(documents = documents)[0]

        if not response.is_error:
            res += "Key Phrases: "
            res += ', '.join(response.key_phrases)
        else:
            res += 'Error id: {}, Error: {}'.format(response.id, response.error)

    except Exception as err:
        res += "Encountered exception. {}".format(err)
    
    return res


# def getFaceDetection(url='https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?w=2000'):

#     def get_accessories(accessories):
#         accessory_str = ",".join([str(accessory) for accessory in accessories])
#         return accessory_str if accessory_str else "No accessories"
   
    
#     detected_faces = face_client.face.detect_with_url(
#         url=url,
#         return_face_attributes=[
#             FaceAttributeType.accessories,
#             'age',
#             'blur',
#             'exposure',
#             'glasses',
#             'headPose',
#             'noise',
#             'occlusion',
#         ]
#     )

#     # if not detected_faces:
#     #     raise Exception(
#     #         "No face detected")
#     # print("{} faces detected from image".format(
#     #     len(detected_faces)))
#     # if not detected_faces[0].face_attributes:
#     #     raise Exception(
#     #         "Parameter return_face_attributes of detect_with_stream_async must be set to get face attributes.")

#     # for face in detected_faces:
#     #     print("Face attributes  Rectangle(Left/Top/Width/Height) : {} {} {} {}".format(
#     #         face.face_rectangle.left,
#     #         face.face_rectangle.top,
#     #         face.face_rectangle.width,
#     #         face.face_rectangle.height)
#     #     )
#     #     print("Face attributes - Accessories : {}".format(get_accessories(face.face_attributes.accessories)))
#     #     print("Face attributes - Age : {}".format(face.face_attributes.age))
#     #     print("Face attributes - Blur : {}".format(face.face_attributes.blur.blur_level))
#     #     print("Face attributes - Exposure : {}".format(face.face_attributes.exposure.exposure_level))
#     #     print("Face attributes - Glasses : {}".format(face.face_attributes.glasses))
#     #     print("Face attributes - HeadPose : Pitch: {}, Roll: {}, Yaw: {}".format(
#     #         round(face.face_attributes.head_pose.pitch, 2),
#     #         round(face.face_attributes.head_pose.roll, 2),
#     #         round(face.face_attributes.head_pose.yaw, 2))
#     #     )
#     #     print("Face attributes of - Noise : {}".format(face.face_attributes.noise.noise_level))
#     #     print("Face attributes of - Occlusion : EyeOccluded: {},   ForeheadOccluded: {},   MouthOccluded: {}".format(
#     #         "Yes" if face.face_attributes.occlusion.eye_occluded else "No",
#     #         "Yes" if face.face_attributes.occlusion.forehead_occluded else "No",
#     #         "Yes" if face.face_attributes.occlusion.mouth_occluded else "No")
#     #     )









