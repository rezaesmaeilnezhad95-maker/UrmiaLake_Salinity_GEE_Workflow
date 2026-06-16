
// =====================================================================
// Script 1: Image Preprocessing (TOA Reflectance)
// Description: Handles Landsat 8 TOA image collection, applies TOA 
// scaling, cloud masking, and clips to the Urmia Lake Basin for 2023.
// Author: Dr. Reza Esmaeilnezhad
// Date: 2026
// =====================================================================

// ---------------------------------------------------------------------
// 1. Define Region of Interest (Urmia Lake Basin)
// ---------------------------------------------------------------------
var Urmia_Lake_Basin = ee.FeatureCollection('projects/ee-rezaesmaeilnezhad95/assets/UL10km_withoutkak').geometry();
// ---------------------------------------------------------------------
// 2. Define Temporal Range (Summer 2023 - Peak Salinity Period)
// ---------------------------------------------------------------------
var startDate = ee.Date('2023-06-01');
var endDate = ee.Date('2023-09-01');

// ---------------------------------------------------------------------
// 3. Load Landsat 8 TOA ImageCollection
// ---------------------------------------------------------------------
var LANDSAT8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterBounds(Urmia_Lake_Basin)
  .filterDate(startDate, endDate);
// ---------------------------------------------------------------------
// 4. Cloud Masking and TOA Scaling Function
// ---------------------------------------------------------------------
function maskAndScaleL8TOA(image) {
  // Apply TOA scaling factor for Collection 2
  var scaledImage = image.multiply(0.0000275).add(0.1);
  
  // Mask clouds using QA_PIXEL band
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitMask = (1 << 4);
  var cloudsBitMask = (1 << 3);
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
    .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
    
  return scaledImage.updateMask(mask);
}

// ---------------------------------------------------------------------
// 5. Apply Function and Filter by Cloud Cover
// ---------------------------------------------------------------------
var Imag_8 = LANDSAT8
  .map(maskAndScaleL8TOA)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 10);
// ---------------------------------------------------------------------
// 6. Create Median Composite and Clip to Study Area
// ---------------------------------------------------------------------
var ImageCollection = Imag_8.median().clip(Urmia_Lake_Basin);

// ---------------------------------------------------------------------
// 7. Select Spectral Bands for Analysis
// ---------------------------------------------------------------------
var bands = ['B1', 'B2', 'B3', 'B4', 'B5'];
var selectedBands = ImageCollection.select(bands);
// ---------------------------------------------------------------------
// 8. Display Results
// ---------------------------------------------------------------------
Map.addLayer(selectedBands, {
  bands: ['B4', 'B3', 'B2'], 
  min: 0, 
  max: 0.3,
  gamma: 1.2
}, 'Landsat 8 TOA Composite 2023');

Map.centerObject(Urmia_Lake_Basin, 10);
print('Number of images:', Imag_8.size());
print('Selected Bands:', selectedBands.bandNames());