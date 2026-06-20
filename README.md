# Urmia Lake Salinity Mapping: GEE Computational Workflow

Associated Manuscript:** "Spatiotemporal Dynamics of Soil Salinity Driven by Lake Desiccation: Evidence from 38 Years of Monitoring Around Urmia Lake"

**Authors:** Reza Esmaeilnezhad, Kamran Zeinalzadeh*

**Target Journal:** Catena 

**Status:** Manuscript in preparation (2026)
This repository contains the custom computational scripts and reproducible workflow developed for the spatiotemporal monitoring of salinity in Urmia Lake using Google Earth Engine (GEE) and Random Forest machine learning.

## 📜 Overview
The core computational contribution of this workflow is the development of an automated, cloud-based pipeline that not only trains a Random Forest classifier for current salinity mapping but also computationally transfers this trained model (via Decision Tree Ensemble) to historical imagery for retrospective prediction, ensuring temporal transferability.

## 📂 Repository Structure
The workflow is modularized into four sequential JavaScript scripts to ensure clarity and reproducibility:

1. **`01_Image_Preprocessing.js`**: Handles Landsat 8 TOA (`LANDSAT/LC08/C02/T1_TOA`) image collection, applies TOA scaling factors, performs cloud/shadow masking using the `QA_PIXEL` band, and creates a median composite.
2. **`02_Feature_Engineering.js`**: Calculates spectral indices (NDVI, SI1, SI2, SI3) from the preprocessed bands (B1-B5) to serve as input features for the machine learning model.
3. **`03_RF_Model_Training_2023.js`**: Samples ground-truth training points, trains the `smileRandomForest` classifier, performs accuracy assessment (Confusion Matrix, Kappa), and exports the trained decision tree ensemble to a GEE Asset for future use.
4. **`04_Spatiotemporal_Prediction_2020.js`**: Demonstrates temporal transferability by loading the trained decision tree ensemble from 2023 and applying it to historical Landsat 8 TOA imagery (2020) to predict past salinity dynamics without requiring historical ground-truth data.

## ⚙️ Prerequisites
- A registered and authorized [Google Earth Engine](https://earthengine.google.com/) account.
- Access to the specific GEE Assets referenced in the scripts (e.g., Urmia Lake boundary and field sample data). *Note: Users should update the `assetId` paths in Scripts 1 and 3 with their own GEE asset paths.*

## 🚀 How to Reproduce the Analysis
To ensure reproducibility, execute the scripts **sequentially** in the GEE Code Editor:
1. Run `01_Image_Preprocessing.js` to generate the preprocessed image composite.
2. Run `02_Feature_Engineering.js` to generate the feature stack.
3. Run `03_RF_Model_Training_2023.js` to train the model and export the decision trees to your GEE Assets.
4. Run `04_Spatiotemporal_Prediction_2020.js` to load the exported model and apply it to the 2020 imagery.

## 📊 Sample Data
*(Optional: If you add a sample CSV, mention it here. Otherwise, you can delete this section).*
A subset of the ground-truth Electrical Conductivity (EC) sample data is provided in the `Sample_Data` folder to allow users to test the post-processing logic.

## 👤 Corresponding Author
**Dr. Reza Esmaeilnezhad, Kamran Zeinalzadeh**  
Department of Water Engineering, Faculty of Agriculture, Urmia University, Urmia, Iran. 
**Email:** reza.esmaeilnezhad95@gmail.com (R. Esmaeilnezhad), k.zeinalzadeh@urmia.ac.ir (K. Zeinalzadeh)

## 📚 Citation
This workflow is associated with a manuscript currently under review. If you use this code or adapt this methodology, please cite as:
> Esmaeilnezhad, R., et al. (2026). "Spatiotemporal Dynamics of Soil Salinity Driven by Lake Desiccation: Evidence from 38 Years of Monitoring Around Urmia Lake". *Manuscript under review*. [DOI will be added upon publication].
*Note: The final citation and DOI will be updated once the manuscript is accepted and published.*
