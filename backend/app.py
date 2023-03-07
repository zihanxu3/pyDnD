from flask import Flask, request
from flask import jsonify
from deserialize import Deserializer
import redis
from mkhash import make_hash
import mongoClient
import fileClient
import cognitiveClient

"""
    Flask Main Entry Point
    @author Zihan Xu
"""

app = Flask(__name__)

@app.route("/")
def hello():
    print('Request for index page received')
    return jsonify({1: "Congratulation! You service is hosted on Azure"})

# Method to compile the canvas
@app.route('/compile', methods=['POST'])
def compile():
    requestJson = request.get_json()
    serialization, uid = requestJson['serialization'], requestJson['uid']

    deserializer = Deserializer(serialization, uid)
    masterOutput, data = deserializer.linkNodes()
    print(masterOutput)
    ret = masterOutput
    # For Redis
    if not data:
        return jsonify({'consoleOutput': ret, 'data': {}, 'success': 1})
    return jsonify({'consoleOutput': ret, 'data': data, 'success': 1})

# Method to upload file into a user's blob storage
@app.route('/upload', methods=['POST'])
def fileUpload():
    files = request.files.getlist('file')
    uid = request.form['uid']
    for file in files:
        fileClient.uploadFile(file, uid)
    return {1: 'successfully upload'}

# Method to download file from a user's blob storage
@app.route('/download', methods=['POST'])
def fileDownload():
    fileName, uid = request.get_json()['fileName'], request.get_json()['uid']
    file = fileClient.downloadFileWithNameAsBytes(fileName, uid)
    return file

# Method to list files within a user's blob storage
@app.route('/listfiles', methods=['POST'])
def listFiles():
    uid = request.get_json()['uid']
    files = fileClient.listFilesInContainer(uid)
    print("here")
    return jsonify(files)

# Method to sign up an user
@app.route('/signup', methods=['POST'])
def signUp():
    form = request.get_json()
    status, body = mongoClient.createUser(form['firstName'], form['lastName'], form['email'], form['password'])
    print(body)
    return {'stat': status, 'body': body}

# Method to sign in an user
@app.route('/signin', methods=['POST'])
def signIn():
    form = request.get_json()
    status, body = mongoClient.authUser(form['email'], form['password'])
    print(body)
    print(jsonify(body))
    return {'stat': status, 'body': body}