
// =====================================================================
// Script 2: Feature Engineering
// Description: Calculates spectral indices (NDVI and multiple Salinity 
// Indices) from the preprocessed Landsat 8 image to serve as input 
// features for the Random Forest classifier.
// Author: Dr. Reza Esmaeilnezhad
// Date: 2026
// =====================================================================

// Note: Ensure 'ImageCollection', 'bands', and 'Urmia_Lake_Basin' are 
// available from Script 1.

// ---------------------------------------------------------------------
// 1. Define Band References (B1-B5 as renamed in Script 1)
// ---------------------------------------------------------------------
var NIR = 'B5';    // Near Infrared 
var Red = 'B4';    // Red 
var G = 'B3';      // Green 
var MIR = 'B6';    // Mid Infrared 1 (SWIR1) - if needed
var MIR2 = 'B7';   // Mid Infrared 2 (SWIR2) - if needed
var B = 'B2';      // Blue 
// ---------------------------------------------------------------------
// 2. Calculate NDVI (Normalized Difference Vegetation Index)
// ---------------------------------------------------------------------
// Formula: (NIR - Red) / (NIR + Red)
var ndvi = ImageCollection.normalizedDifference([NIR, Red]).rename('NDVI');

// ---------------------------------------------------------------------
// 3. Calculate Salinity Index 1 (SI1)
// ---------------------------------------------------------------------
// Formula: (Blue * Red) / Green
var SI1 = ImageCollection.expression(
  '(BLUE * RED) / GREEN', {
    'BLUE': ImageCollection.select(B),
    'RED': ImageCollection.select(Red),
    'GREEN': ImageCollection.select(G)
  }
).rename('SI1');

// ---------------------------------------------------------------------
// 4. Calculate Salinity Index 2 (SI2)
// ---------------------------------------------------------------------
// Formula: (Red + Green) / 2
var SI2 = ImageCollection.expression(
  '(RED + GREEN) / 2', {
    'RED': ImageCollection.select(Red),
    'GREEN': ImageCollection.select(G)
  }
).rename('SI2');

// ---------------------------------------------------------------------
// 5. Calculate Salinity Index 3 (SI3)
// ---------------------------------------------------------------------
// Formula: sqrt(Blue * Red)
var SI3 = ImageCollection.expression(
  'pow(BLUE * RED, 0.5)', {
    'BLUE': ImageCollection.select(B),
    'RED': ImageCollection.select(Red)
  }
).rename('SI3');

// ---------------------------------------------------------------------
// 6. Create Final Feature Stack
// ---------------------------------------------------------------------
// Combine original spectral bands with calculated indices
var finalstack = ee.Image.cat([
  ImageCollection.select(bands),  // Original bands (B1-B5)
  SI1,                             // Salinity Index 1
  SI2,                             // Salinity Index 2
  SI3,                             // Salinity Index 3
  ndvi                             // NDVI
]).clip(Urmia_Lake_Basin);

// ---------------------------------------------------------------------
// 7. Display Results
// ---------------------------------------------------------------------
Map.addLayer(SI1, {min: 0, max: 0.5, palette: ['blue', 'white', 'red']}, 'SI1 - Salinity Index 1');
Map.addLayer(SI2, {min: 0, max: 0.3, palette: ['yellow', 'orange', 'red']}, 'SI2 - Salinity Index 2');
Map.addLayer(SI3, {min: 0, max: 0.3, palette: ['green', 'yellow', 'red']}, 'SI3 - Salinity Index 3');
Map.addLayer(ndvi, {min: -0.2, max: 0.5, palette: ['brown', 'white', 'green']}, 'NDVI');

// Print metadata
print('Final Feature Stack:', finalstack);
print('Number of bands in final stack:', finalstack.bandNames());
