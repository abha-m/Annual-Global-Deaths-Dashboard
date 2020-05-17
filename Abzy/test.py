import pandas as pd
from sklearn.decomposition import PCA


df = pd.read_csv("/Users/abha/Viz-Final-Project/Abzy/static/data/merged_data.csv")
df = df.dropna()


def computePCA(fil_df):
    pca_model = PCA(n_components=2)
    pca_model.fit(fil_df)
    fil_df_transformed = pd.DataFrame(pca_model.transform(fil_df), columns=["PC1", "PC2"])
    return fil_df_transformed

all_causes = ["Cardiovascular diseases (%)", "Cancers (%)", "Respiratory diseases (%)"]
all_countries = ["India", "China", "Afghanistan", "Bangladesh", "France"]

cols_to_select = all_causes

filtered_by_params = df[df["Year"] == 2007]

filtered_by_params_causes = filtered_by_params[all_causes]
transformed_df_PCA = computePCA(filtered_by_params_causes)

filtered_by_params_causes["Sum"] = filtered_by_params_causes[all_causes].sum(axis=1)

cols_to_select.append("HDI")
cols_to_select.append("Country")
filtered_by_params_causes_HDI_country = filtered_by_params[cols_to_select]

transformed_df_PCA.index = filtered_by_params_causes.index
transformed_df_PCA["Sum"] = filtered_by_params_causes["Sum"]
print(filtered_by_params_causes)