from flask import Flask, render_template, jsonify, request, redirect, url_for
from random import sample

import numpy as np 
import json
import pandas as pd

df = pd.read_csv("data/HDI_2017.csv")
returned_data = {}

app = Flask(__name__)

@app.route('/', methods = ["GET"])
def index():
    hdi_2017 = df.to_dict(orient='records')
    hdi_2017 = json.dumps(hdi_2017, indent=2)
    returned_data["hdi_2017"] = hdi_2017
    return render_template("index.html", returned_data = returned_data)
    
if __name__ == '__main__':
    app.run(debug=True)