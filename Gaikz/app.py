from flask import Flask, render_template, jsonify, request, redirect, url_for
from random import sample

import numpy as np 
import json
import pandas as pd

app = Flask(__name__)

# Global variables initialization
# data_df = pd.read_csv("static/data/encoded_data.csv")
# print("Whole dataset loaded into RAM")

@app.route('/', methods = ["GET"])
def index():
    return render_template("index.html")

@app.route('/try', methods = ["GET"])
def test():
    return render_template("test.html")

@app.route('/parallel', methods = ["GET"])
def parallel():
    return render_template("parallel.html")

# @app.route('/api/generate_data', methods = ["POST"])
# def generate_data():

if __name__ == '__main__':
    app.run(debug=True)