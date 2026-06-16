
// =====================================================================
// Script 3: Random Forest Model Training (2023)
// Description: Defines the Random Forest classifier, samples training 
// points from field data, trains the model on the 2023 feature space, 
// classifies the salinity map, performs accuracy assessment, and 
// exports the decision tree ensemble for future prediction.
// Author: Dr. Reza Esmaeilnezhad
// Date: 2026
// =====================================================================

// Note: Ensure 'finalstack', 'Urmia_Lake_Basin' are available from 
// Scripts 1 & 2.

// ---------------------------------------------------------------------
// 1. Load Training Data (Ground Truth Field Samples)
// ---------------------------------------------------------------------

var soil_sample = ee.FeatureCollection('projects/ee-rezaesmaeilnezhad95/assets/sample_salinity_3');
var TrainingData = soil_sample;

// ---------------------------------------------------------------------
// 2. Sample the Feature Stack at Training Point Locations
// ---------------------------------------------------------------------
var training_data = finalstack.sampleRegions({
  collection: TrainingData,
  properties: ['landproperties'],  // Class label property
  scale: 30,
  tileScale: 16
});

// ---------------------------------------------------------------------
// 3. Initialize and Train Random Forest Classifier
// ---------------------------------------------------------------------
var classifier = ee.Classifier.smileRandomForest(100)
  .train({
    features: training_data,
    classProperty: 'landproperties',
    inputProperties: finalstack.bandNames()
  });

// ---------------------------------------------------------------------
// 4. Classify the 2023 Image
// ---------------------------------------------------------------------
var classified = finalstack.classify(classifier);

Map.addLayer(classified.clip(Urmia_Lake_Basin), {
  min: 0, 
  max: 5,
  palette: ['blue', 'cyan', 'yellow', 'orange', 'red', 'darkred']
}, 'Salinity Map 2023');

// ---------------------------------------------------------------------
// 5. Accuracy Assessment
// ---------------------------------------------------------------------
var conf_train = classifier.confusionMatrix();
var overall_acc_train = conf_train.accuracy();
var kapp_train = conf_train.kappa();

print('Training Confusion Matrix:', conf_train);
print('Overall Training Accuracy:', overall_acc_train);
print('Kappa Coefficient:', kapp_train);

// ---------------------------------------------------------------------
// 6. Helper Function: Encode Decision Trees for Export
// ---------------------------------------------------------------------
function encodeFeatureCollection(value) {
  var string = ee.String.encodeJSON(value);
  var stringLength = string.length();
  var maxLength = 100000;
  var maxProperties = 1000;
  
  var values = ee.List.sequence(0, stringLength, maxLength)
    .map(function(start) {
      start = ee.Number(start);
      var end = start.add(maxLength).min(stringLength);
      return string.slice(start, end);
    })
    .filter(ee.Filter.neq('item', ''));
  
  var numberOfProperties = values.size();
  
  return ee.FeatureCollection(
    ee.List.sequence(0, values.size(), maxProperties)
      .map(function(start) {
        start = ee.Number(start);
        var end = start.add(maxProperties).min(numberOfProperties);
        var propertyValues = values.slice(start, end);
        var propertyKeys = ee.List.sequence(1, propertyValues.size())
          .map(function(i) {
            return ee.Number(i).format('%d');
          });
        var properties = ee.Dictionary.fromLists(propertyKeys, propertyValues);
        return ee.Feature(ee.Geometry.Point([0, 0]), properties);
      })
      .filter(ee.Filter.notNull(['1']))
  );
}

// ---------------------------------------------------------------------
// 7. Export Decision Tree Ensemble (for Temporal Transferability)
// ---------------------------------------------------------------------
// This exports the trained model structure as decision trees
var decisionTree = ee.List(classifier.explain().get('trees'));

Export.table.toAsset({
  collection: encodeFeatureCollection(decisionTree),
  description: 'salinity_map_2023',
  assetId: 'projects/ee-rezaesmaeilnezhad95/assets/2023/salinity_map_2023'
});

// ---------------------------------------------------------------------
// 8. Export Classified Map (Optional)
// ---------------------------------------------------------------------
/*
Export.image.toDrive({
  image: classified.clip(Urmia_Lake_Basin),
  description: 'salinity_map_2023_tif',
  folder: 'salinity_map_2023',
  region: Urmia_Lake_Basin,
  scale: 30,
  maxPixels: 1e13
});
*/

// ---------------------------------------------------------------------
// 9. Print Summary
// ---------------------------------------------------------------------
print('Training completed successfully!');
print('Number of training samples:', training_data.size());
print('Decision trees exported to: projects/ee-rezaesmaeilnezhad95/assets/2023/salinity_map_2023');