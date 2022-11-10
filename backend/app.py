from flask import Flask, request
import numpy as np
from flask import jsonify
from deserialize import Deserializer


app = Flask(__name__)

application = app

@app.route("/")
def hello():
    print('Request for index page received')
    return jsonify({1: "Congratulation! You service is hosted on Azure"})

@app.route('/compile', methods=['POST'])
def compile():
    deserializer = Deserializer(request.get_json())
    deserializer.linkNodes()
    return jsonify({'hi': 2}), 200