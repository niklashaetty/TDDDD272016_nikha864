#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, request
import json
app = Flask(__name__)


@app.route("/")
def root():
    return 'Hello world'

@app.route('/api/users', methods=['GET'])
def print_user():
	user = request.args['q']
	userd = {"username": user}
	return json.dumps(userd)


if __name__ == '__main__':
    app.run()
