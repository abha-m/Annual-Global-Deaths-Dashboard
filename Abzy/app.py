from flask import Flask, render_template, jsonify, request, redirect, url_for
from random import sample

import numpy as np 
import json
import pandas as pd

returned_data = {}

app = Flask(__name__)

@app.route('/', methods = ["GET"])
def index():
    return render_template("index.html", returned_data = returned_data)
    
if __name__ == '__main__':
    app.run(debug=True)