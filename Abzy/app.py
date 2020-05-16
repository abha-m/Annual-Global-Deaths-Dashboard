from flask import Flask, render_template, jsonify, request, redirect, url_for
from random import sample

import numpy as np 
import json
import pandas as pd

returned_data = {}
df = pd.read_csv("/Users/abha/Viz-Final-Project/Abzy/static/data/merged_data.csv");

app = Flask(__name__)

@app.route('/', methods = ["GET"])
def index():
    all_data = df.to_dict(orient='records')
    returned_data["all_data"] = json.dumps(all_data)
    return render_template("index.html", returned_data = returned_data)

@app.route('/<params>', methods=["GET", "POST"])
def trial(params):
    print(params)
    
if __name__ == '__main__':
    app.run(debug=True)