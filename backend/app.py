from flask import Flask, request
import numpy as np
from flask import jsonify
from deserialize import Deserializer
import redis
from mkhash import make_hash

myHostname = "pydnd-redis.redis.cache.windows.net"
myPassword = "w1Zurj4HPPaLVVEPxG9MigbtvwneocVwiAzCaPNrLzc="

r = redis.StrictRedis(host=myHostname, port=6380,
                      password=myPassword, ssl=True)


app = Flask(__name__)

application = app

@app.route("/")
def hello():
    print('Request for index page received')
    return jsonify({1: "Congratulation! You service is hosted on Azure"})

@app.route('/compile', methods=['POST'])
def compile():
    reqJson = request.get_json()
    hashing = make_hash(reqJson)
    if r.get(hashing) != None:
        return jsonify(r.get(hashing).decode('utf-8')), 200
    deserializer = Deserializer(reqJson)
    masterOutput = deserializer.linkNodes()
    print(masterOutput)
    ret = masterOutput
    # for i in masterOutput:
    #     ret += '> ' + str(i) + '\n'
    
    r.set(hashing, bytes(ret, 'utf-8'))
    return jsonify(ret), 200