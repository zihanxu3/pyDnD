from flask import Flask, request
from flask import jsonify
from deserialize import Deserializer
import redis
from mkhash import make_hash
import mongoClient
import fileClient
import cognitiveClient


# from flask_cors import CORS, cross_origin

# For Redis
myHostname = "pydnd-radis.redis.cache.windows.net"
myPassword = "vBfeldP6TGp73ZWbYQdEuTUm7x2E6mHYjAzCaEJWQDs="

r = redis.StrictRedis(host=myHostname, port=6380, db=0,
                      password=myPassword, ssl=True)

app = Flask(__name__)

# For Cosmos DB
# app.config.from_pyfile('settings.py')


@app.route("/")
def hello():
    print('Request for index page received')
    return jsonify({1: "Congratulation! You service is hosted on Azure"})

@app.route('/compile', methods=['POST'])
def compile():
    requestJson = request.get_json()
    serialization, uid = requestJson['serialization'], requestJson['uid']
    hashing = make_hash(serialization)
    if r.get(hashing) != None:
        return jsonify({'consoleOutput': r.get(hashing).decode('utf-8'), 'data': {}, 'success': 1}), 200
    deserializer = Deserializer(serialization, uid)
    masterOutput, data = deserializer.linkNodes()
    print(masterOutput)
    # print(cognitiveClient.getTextOfImage('https://i.pinimg.com/originals/a8/1c/14/a81c14ce2a72f996fc473f09b126725f.jpg'))
    ret = masterOutput
    if not data:
        r.set(hashing, bytes(ret, 'utf-8'))
        return jsonify({'consoleOutput': ret, 'data': {}, 'success': 1})
    return jsonify({'consoleOutput': ret, 'data': data, 'success': 1})

@app.route('/upload', methods=['POST'])
def fileUpload():
    files = request.files.getlist('file')
    uid = request.form['uid']
    for file in files:
        fileClient.uploadFile(file, uid)
    # fileClient.testDownloadFiles(uid)
    return {1: 'successfully upload'}

@app.route('/listfiles', methods=['POST'])
def listFiles():
    # file = request.files['file']
    # fileName = file.filename
    uid = request.get_json()['uid']
    files = fileClient.listFilesInContainer(uid)
    print("here")
    return jsonify(files)

@app.route('/signup', methods=['POST'])
def signUp():
    form = request.get_json()
    
    status, body = mongoClient.createUser(form['firstName'], form['lastName'], form['email'], form['password'])
    print(body)
    return {'stat': status, 'body': body}

@app.route('/signin', methods=['POST'])
def signIn():
    form = request.get_json()
    status, body = mongoClient.authUser(form['email'], form['password'])
    print(body)
    print(jsonify(body))
    return {'stat': status, 'body': body}

# CORS(app, expose_headers='Authorization')
