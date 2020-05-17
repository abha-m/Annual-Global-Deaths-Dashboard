from flask import Flask, render_template, jsonify, request, redirect, url_for
from random import sample
from sklearn.decomposition import PCA

import numpy as np 
import json
import pandas as pd

returned_data = {}
df = pd.read_csv("static/data/merged_data.csv")
df = df.dropna()

app = Flask(__name__)

@app.route('/', methods = ['POST', 'GET'])
def index():
    all_data = df.to_dict(orient='records')
    returned_data["all_data"] = json.dumps(all_data)
    return render_template("index.html", returned_data = returned_data)

@app.route('/menu', methods = ['POST', 'GET'])
def menu():
    all_data = df.to_dict(orient='records')
    returned_data["all_data"] = json.dumps(all_data)
    return render_template("menu_try.html", returned_data = returned_data)

@app.route('/dropdown', methods=['POST', 'GET'])
def filterByParams():
    # /?years=2007+2008+2009+&?countries=India+USA+&?causes=Cause 1+Cause 2+
    # all_years = params.split("?")[1].split("=")[1].split("+")[:-1]
    # for idx, year in enumerate(all_years):
    #     all_years[idx] = int(year)

    # all_countries = params.split("?")[2].split("=")[1].split("+")[:-1]
    # all_causes = params.split("?")[3].split("=")[1].split("+")[:-1]
    # all_causes = ["Cardiovascular diseases (%)", "Cancers (%)", "Respiratory diseases (%)"]
    year_arg = request.args.get('years')
    all_causes = request.args.getlist('causes')
    all_countries = request.args.getlist('countries')

    '''  PCA  '''
    cols_to_select = all_causes
    filtered_by_params = df[df["Year"] == int(year_arg)]
    filtered_by_params_causes = filtered_by_params[all_causes]
    transformed_df_PCA = computePCA(filtered_by_params_causes)
    filtered_by_params_causes["Sum"] = filtered_by_params_causes[all_causes].sum(axis=1)
    cols_to_select.append("HDI")
    cols_to_select.append("Country")
    filtered_by_params_causes_HDI_country = filtered_by_params[cols_to_select]
    transformed_df_PCA.index = filtered_by_params_causes.index
    transformed_df_PCA["Sum"] = filtered_by_params_causes["Sum"]
    transformed_df_PCA.index = filtered_by_params_causes_HDI_country.index
    transformed_df_PCA[["Country", "HDI"]] = filtered_by_params_causes_HDI_country[["Country", "HDI"]]
    returned_data["pca_plot"] = transformed_df_PCA.to_dict(orient='records')


    '''  Barplot  '''
    filtered_by_params = df[df["Year"] == int(year_arg)]
    filtered_by_params = filtered_by_params[filtered_by_params["Country"].isin(all_countries)]
    returned_data["bar_plot"] = filtered_by_params.to_dict(orient='records')
    

    return json.dumps(returned_data)
    
def computePCA(fil_df):
    pca_model = PCA(n_components=2)
    pca_model.fit(fil_df)
    fil_df_transformed = pd.DataFrame(pca_model.transform(fil_df), columns=["PC1", "PC2"])
    return fil_df_transformed

if __name__ == '__main__':
    app.run(debug=True)