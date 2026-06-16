
// =====================================================================
// Script 4: Spatiotemporal Prediction (2020)
// Description: Loads the trained Random Forest decision tree ensemble 
// from 2023 and applies it to historical Landsat imagery (2020) to 
// retrospectively predict past salinity dynamics.
// Author: Dr. Reza Esmaeilnezhad
// Date: 2026
// =====================================================================

// Note: This script demonstrates the temporal transferability of the 
// trained model. It loads the decision tree ensemble from the 2023 
// model (saved as 'salinity_map_2023') and applies it to 2020 imagery.

// ---------------------------------------------------------------------
// 1. Helper Function: Decode Decision Trees from Asset
// ---------------------------------------------------------------------
function decodeFeatureCollection(featureCollection) {
  return featureCollection
    .map(function(feature) {
      var dict = feature.toDictionary();
      var keys = dict.keys()
        .map(function(key) {
          return ee.Number.parse(ee.String(key));
        });
      var value = dict.values().sort(keys).join();
      return ee.Feature(null, {value: value});
    })
    .aggregate_array('value')
    .join()
    .decodeJSON();
}

// ---------------------------------------------------------------------
// 2. Load Trained Model from Asset (Decision Tree Ensemble)
// ---------------------------------------------------------------------
// Load the decision trees that were exported in Script 3
var featureCollection = ee.FeatureCollection('projects/ee-rezaesmaeilnezhad95/assets/2023/salinity_map_2023');
var desicionTree = decodeFeatureCollection(featureCollection);

// Reconstruct the classifier from the decision tree ensemble
var classifier = ee.Classifier.decisionTreeEnsemble(desicionTree);

print('Model loaded successfully from asset: salinity_map_2023');
print('Number of decision trees:', desicionTree.length());

// ---------------------------------------------------------------------
// 3. Load and Preprocess Landsat 2020 Imagery (EXACTLY like 2023)
// ---------------------------------------------------------------------
var startDate2020 = ee.Date('2020-06-01');
var endDate2020 = ee.Date('2020-09-01');

var LANDSAT8_2020 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterBounds(Urmia_Lake_Basin)
  .filterDate(startDate2020, endDate2020);

// Apply the EXACT same masking and scaling as Script 1
function maskAndScaleL8TOA2020(image) {
  var scaledImage = image.multiply(0.0000275).add(0.1);
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitMask = (1 << 4);
  var cloudsBitMask = (1 << 3);
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
    .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return scaledImage.updateMask(mask);
}

var Imag_8_2020 = LANDSAT8_2020
  .map(maskAndScaleL8TOA2020)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 10);

var ImageCollection2020 = Imag_8_2020.median().clip(Urmia_Lake_Basin);

// ---------------------------------------------------------------------
// 4. Calculate Spectral Indices for 2020 (EXACTLY like 2023)
// ---------------------------------------------------------------------
var NIR = 'B5';
var Red = 'B4';
var G = 'B3';
var B = 'B2';

var ndvi2020 = ImageCollection2020_bands.normalizedDifference([NIR, Red]).rename('NDVI');

var SI1_2020 = ImageCollection2020_bands.expression(
  '(BLUE * RED) / GREEN', {
    'BLUE': ImageCollection2020_bands.select(B),
    'RED': ImageCollection2020_bands.select(Red),
    'GREEN': ImageCollection2020_bands.select(G)
  }
).rename('SI1');

var SI2_2020 = ImageCollection2020_bands.expression(
  '(RED + GREEN) / 2', {
    'RED': ImageCollection2020_bands.select(Red),
    'GREEN': ImageCollection2020_bands.select(G)
  }
).rename('SI2');

var SI3_2020 = ImageCollection2020_bands.expression(
  'pow(BLUE * RED, 0.5)', {
    'BLUE': ImageCollection2020_bands.select(B),
    'RED': ImageCollection2020_bands.select(Red)
  }
).rename('SI3');

// ---------------------------------------------------------------------
// 5. Create Final Feature Stack for 2020 (EXACT same structure as 2023)
// ---------------------------------------------------------------------
var finalstack2020 = ee.Image.cat([
  ImageCollection2020_bands.select(bands),
  SI1_2020,
  SI2_2020,
  SI3_2020,
  ndvi2020
]).clip(Urmia_Lake_Basin);

print('Feature stack for 2020 created successfully');
print('Number of bands:', finalstack2020.bandNames());

// ---------------------------------------------------------------------
// 6. Apply Trained 2023 Model to 2020 Data (Temporal Transferability)
// ---------------------------------------------------------------------
var classified2020 = finalstack2020.classify(classifier);

Map.addLayer(classified2020.clip(Urmia_Lake_Basin), {
  min: 0,
  max: 5,
  palette: ['blue', 'cyan', 'yellow', 'orange', 'red', 'darkred']
}, 'Predicted Salinity Map 2020');

Map.centerObject(Urmia_Lake_Basin, 10);

// ---------------------------------------------------------------------
// 7. Export Predicted Map
// ---------------------------------------------------------------------
Export.image.toDrive({
  image: classified2020.clip(Urmia_Lake_Basin),
  description: 'salinity_map_2020', 
  folder: 'salinity_map_2020',
  region: Urmia_Lake_Basin,
  scale: 30,
  maxPixels: 1e13
});

// ---------------------------------------------------------------------
// 8. Print Summary
// ---------------------------------------------------------------------
print('Spatiotemporal prediction completed successfully!');
print('The 2023 model (salinity_map_2023) has been applied to 2020 imagery.');
print('This demonstrates the temporal transferability of the trained classifier.');
