var ee = require('@google/earthengine');
const { json } = require('body-parser');
const dataPath = 'data.json';
const fs = require('fs');

console.log("gee.js");

async function runThis(FarmerId, beforeBaseDate, afterBaseDate) {
  return new Promise(async (resolve, reject) => {
    try {
      if (FarmerId == undefined) {
        return resolve(0);
      }

      // var districts = await ee.FeatureCollection("users/karanknit/india_dist_sorted");
      // var ROI = await districts.filter(ee.Filter.eq('DISTRICT', name));
      // var landarea=ROI.geometry().area().divide(10000).getInfo();
      // console.log(landarea);

      var custom_10_new = await ee.FeatureCollection("projects/ee-shankarkaustubh1k3/assets/custom_10_new");
      var custom_dataset = custom_10_new.aggregate_array('land_ident')
      console.log(custom_dataset)

      //Reading data.json file here:
      const dataString = fs.readFileSync(dataPath, 'utf8');

      // Parse the JSON string to create a JavaScript object
      const data = JSON.parse(dataString);

      // Fetch shapefile name based on FarmerId from data.json
      const shapeFileName = data[FarmerId.toUpperCase()]?.shapeFileName;
      const FarmerName = data[FarmerId.toUpperCase()]?.name;
      console.log(data[FarmerId.toUpperCase()]);

      if (!shapeFileName) {
        return reject(new Error(`Shapefile name not found for FarmerId: ${FarmerId}`));
      }

      var ROI = custom_10_new.filter(ee.Filter.eq('land_ident', shapeFileName))

      var landarea = ROI.geometry().area().divide(10000).getInfo();
      console.log(landarea);

      var s1Collection = await ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(ROI)
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
        .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
        .filter(ee.Filter.eq('resolution_meters', 10))
        .select('VH');

      // var beforeStart='2022-05-01';
      // var beforeEnd='2022-05-01';
      // var afterStart='2022-05-15';
      // var afterEnd='2022-05-16';

      //   var beforeStart = '2018-07-15'
      //   console.log(beforeBaseDate);
      //   // console.log(afterBaseDate);
      //   /*var beforeEnd = '2018-08-10'*/const beforeEnd = beforeBaseDate;
      //   console.log(afterBaseDate);
      //   var afterStart = '2018-08-10'
      //   /*var afterEnd = '2018-08-23'*/const afterEnd =afterBaseDate;
      // // console.log(afterEnd);

      //Below for wayand: 
      // var beforeStart = '2020-07-12'
      //   console.log(beforeBaseDate);
      //   // console.log(afterBaseDate);
      //   /*var beforeEnd = '2018-08-10'*/const beforeEnd = beforeBaseDate;
      //   console.log(afterBaseDate);
      //   var afterStart = '2020-08-10'
      //   /*var afterEnd = '2018-08-23'*/const afterEnd =afterBaseDate;

      var beforeBaseDateEE = ee.Date(beforeBaseDate);
      var afterBaseDateEE = ee.Date(afterBaseDate);

      // Subtract 15 days from the base dates
      var beforeStart = beforeBaseDateEE.advance(-15, 'day');
      var beforeEnd = beforeBaseDateEE;
      var afterStart = afterBaseDateEE.advance(-15, 'day');
      var afterEnd = afterBaseDateEE;

      var beforeCollection = await s1Collection.filterDate(beforeStart, beforeEnd).mosaic().clip(ROI);
      var afterCollection = await s1Collection.filterDate(afterStart, afterEnd).mosaic().clip(ROI);

      // console.log(beforeCollection);
      // console.log(afterCollection);

      ////Map.addLayer(beforeCollection, { min: -25, max: 0 }, 'Before Floods', 0);
      ////Map.addLayer(afterCollection, { min: -25, max: 0 }, 'After Floods', 0);

      // A. Speckle Filter
      var smoothingRadius = 50;

      var difference = await afterCollection.focal_median(smoothingRadius, 'circle', 'meters')
        .divide(beforeCollection.focal_median(smoothingRadius, 'circle', 'meters'));

      var diffThreshold = 1.25;
      var flooded = await difference.gt(diffThreshold).rename('water').selfMask();

      // B. Mask out permanent/semi-permanent water bodies
      var permanentWater = await ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
        .select('seasonality').gte(10).clip(ROI);

      flooded = await flooded.where(permanentWater, 0).selfMask();

      // C. Mask out areas with steep slopes
      var slopeThreshold = 5;
      var terrain = await ee.Algorithms.Terrain(ee.Image("WWF/HydroSHEDS/03VFDEM"));
      var slope = await terrain.select('slope');
      flooded = await flooded.updateMask(slope.lt(slopeThreshold));

      // D. Remove isolated pixels
      var connectedPixelThreshold = 8;
      var connections = await flooded.connectedPixelCount();
      flooded = await flooded.updateMask(connections.gt(connectedPixelThreshold));

      ////Map.addLayer(flooded, { min: 0, max: 1, palette: ['black'] }, 'Flood Extent');

      //E. Calculate Flood Area
      var flood_stats = await flooded.multiply(ee.Image.pixelArea()).reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: ROI,
        scale: 10,
        maxPixels: 1e12,
      });

      // var floodAreaHa = ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
      var floodAreaHa = await ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
      console.log('Flooded Area (Ha)', floodAreaHa);

      /*Extension code -------------------------------------->*/

      // A. European Space Agency’s landcover dataset
      var landcover = ee.ImageCollection("ESA/WorldCover/v200");
      console.log(landcover, 'Land Cover');

      var lc = landcover.mosaic().clip(ROI);

      var dict = {
        "names": ["Tree cover", "Shrubland", "Grassland", "Cropland", "Built-up", "Bare / sparse vegetation",
          "Snow and ice", "Permanent water bodies", "Herbaceous wetland", "Mangroves", "Moss and lichen"],

        "colors": ["006400", "ffbb22", "ffff4c", "f096ff", "fa0000", "b4b4b4", "f0f0f0",
          "0064c8", "0096a0", "00cf75", "fae6a0"]
      };

      // Map.addLayer(lc, { min: 10, max: 100, palette: dict['colors'] }, 'ESA Earth Cover');

      // B. Cropland Exposed
      var cropland = await lc.select('Map').eq(40).selfMask();
      var cropland_affected = await flooded.updateMask(cropland).rename('crop');

      // Calculate the area of affected cropland in hectares
      var crop_pixelarea = await cropland_affected.multiply(ee.Image.pixelArea());
      var crop_stats = await crop_pixelarea.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: ROI,
        scale: 10,
        maxPixels: 1e12,
      });

      var floodAffectedCroplandAreaHa = await ee.Number(crop_stats.get('crop')).divide(10000).round().getInfo();
      console.log('Flood Affected Cropland Area (Ha)', floodAffectedCroplandAreaHa);

      // // C. Built-up Exposed
      // var builtup = lc.select('Map').eq(50).selfMask();
      // var builtup_affected = flooded.updateMask(builtup).rename('builtup');

      // // Calculate the area of affected built-up areas in hectares
      // var builtup_pixelarea = builtup_affected.multiply(ee.Image.pixelArea());
      // var builtup_stats = builtup_pixelarea.reduceRegion({
      //   reducer: ee.Reducer.sum(),
      //   geometry: ROI,
      //   scale: 10,
      //   maxPixels: 1e12,
      // });

      // var floodAffectedBuiltupAreaHa = ee.Number(builtup_stats.get('builtup')).divide(10000).round();
      // console.log('Flood Affected Built-up Area (Ha)', floodAffectedBuiltupAreaHa);

      // // D. Population Exposed
      // var population_count = ee.Image("JRC/GHSL/P2016/POP_GPW_GLOBE_V1/2015").clip(ROI);
      // var population_exposed = population_count.updateMask(flooded).selfMask();

      // var stats = population_exposed.reduceRegion({
      //   reducer: ee.Reducer.sum(),
      //   geometry: ROI,
      //   scale: 250,
      //   maxPixels: 1e9,
      // });

      // var numberPeopleExposed = stats.getNumber('population_count').round();
      // console.log('Number of People Exposed', numberPeopleExposed);


      resolve({
        "landarea": landarea, "floodAreaHa": floodAreaHa,
        "floodAffectedCropArea": floodAffectedCroplandAreaHa,
        "FarmerName": FarmerName
      });
    } catch (error) {
      // If an error occurs during execution, reject the promise with the error.
      reject(error);
    }
  });
}

module.exports = runThis;

