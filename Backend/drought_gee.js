// const ee = require('@google/earthengine');
// const { json } = require('body-parser');
// const dataPath = 'data.json';
// const fs = require('fs');


// console.log("gee.js");

// async function droughThis(FarmerId, Tyear, Tmonth) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (FarmerId === undefined) {
//                 return resolve(0);
//             }

//             // Importing Earth Engine library
//             // const ee = require('@google/earthengine');

//             // Loading the Earth Engine asset
//             var custom_10_new =  ee.FeatureCollection("projects/ee-shankarkaustubh1k3/assets/custom_10_new");
//             var custom_dataset = custom_10_new.aggregate_array('land_ident');
//             console.log(custom_dataset);

//             // Reading data.json file here:
//             const dataString = fs.readFileSync(dataPath, 'utf8');

//             // Parse the JSON string to create a JavaScript object
//             const data = JSON.parse(dataString);

//             // Fetch shapefile name based on FarmerId from data.json
//             const shapeFileName = data[FarmerId.toUpperCase()]?.shapeFileName;
//             const FarmerName = data[FarmerId.toUpperCase()]?.name;
//             console.log(data[FarmerId.toUpperCase()]);

//             if (!shapeFileName) {
//                 return reject(new Error(`Shapefile name not found for FarmerId: ${FarmerId}`));
//             }

//             // Filter the ROI based on the shapeFileName
//             const aoi = custom_10_new.filter(ee.Filter.eq('land_ident', shapeFileName));

//             // Calculate land area
//             const landarea = ROI.geometry().area().divide(10000).getInfo();
//             console.log(landarea);

//             //MODIS NDVI data
//             var dataset =  ee.ImageCollection('MODIS/061/MOD13Q1')
//                 .select('NDVI');

//             console.log(dataset.size(), "Total number of NDVI Images")

//             // MODIS NDVI values come as NDVI x 10000 that need to be scaled by 0.0001
//             var modisScaled =  dataset.map(function (image) {
//                 var scaled = image.divide(10000)
//                 return scaled.copyProperties(image, ['system:index', 'system:time_start'])
//             });

//             // Year & Month for which we require VCI

//             var year = 2007
//             var month = 1;

//             //Max and Min NDVI for all years but for selected month 
//             var ndvi =  modisScaled.filter(ee.Filter.calendarRange(month, month, 'month'));
//             print(ndvi, "For specific month")

//             //Map.addLayer (ndvi)

//             var ndvi_max = ndvi.max().clip(aoi);
//             var ndvi_min = ndvi.min().clip(aoi);

            

//             //ndviT is the current NDVI (for a giver month & year)
//             var ndviT =  modisScaled.filter(ee.Filter.calendarRange(year, year, 'year'))
//                 .filter(ee.Filter.calendarRange(month, month, 'month'))
//                 .median()
//                 .clip(aoi);

            

//             // Final calculation of VCI for specified month & year
//             var VCI =  ndviT.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min)).rename('VCI');
//             //added below line
//             // VCI=VCI.multiply(100);

//             // Print VCI for the entire AOI
//             var meanVCI =  VCI.reduceRegion({
//                 reducer: ee.Reducer.mean(),
//                 geometry: aoi,
//                 scale: 500, // Adjust the scale as needed
//                 maxPixels: 1e9
//             });

//             var vciValue =  ee.Number(meanVCI.get('VCI'));
//             var vciPercentage =  vciValue.multiply(100);

//             console.log("Mean VCI for AOI:", vciValue);
//             console.log("The percentage of VCI in AOI is:", vciPercentage);

//             console.log(VCI, "VCI for current date")


//             /*extension*/
//             // Threshold for considering VCI as drought-affected (adjust as needed)
//             var droughtThreshold = 0.4; // Example threshold, you can adjust this

//             // Masking areas where VCI is greater than the threshold
//             var droughtMask =  VCI.lte(droughtThreshold);

//             // Calculating the area of drought-affected region in hectares
//             var droughtArea =  droughtMask.multiply(ee.Image.pixelArea())
//                 .reduceRegion({
//                     reducer: ee.Reducer.sum(),
//                     geometry: aoi,
//                     scale: 500, // Adjust the scale as needed
//                     maxPixels: 1e9
//                 });

//             // Convert the area from square meters to hectares
//             var droughtAreaHectares =  ee.Number(droughtArea.get('VCI')).divide(10000);

//             console.log("Drought-affected area in AOI (hectares):", droughtAreaHectares);

//             /*calculating for crop area specifically, this is an cont extension*/
//             var landcover = ee.ImageCollection("ESA/WorldCover/v200");
//             console.log(landcover, 'Land Cover');

//             var lc =  landcover.mosaic().clip(aoi);

//             // Cropland Exposed
//             var cropland = lc.select('Map').eq(40).selfMask();
//             var cropland_affected = droughtMask.updateMask(cropland).rename('crop');

//             // Calculate the area of affected cropland in hectares
//             var crop_pixelarea =  cropland_affected.multiply(ee.Image.pixelArea());
//             var crop_stats =  crop_pixelarea.reduceRegion({
//                 reducer: ee.Reducer.sum(),
//                 geometry: aoi,
//                 scale: 10,
//                 maxPixels: 1e12
//             });

//             var droughtCroplandAreaHa =  ee.Number(crop_stats.get('crop')).divide(10000).round();
//             console.log('Drought Affected Cropland Area (Ha)', droughtCroplandAreaHa);


//             // Resolve with the result
//             resolve({ landarea, FarmerName });
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// module.exports = droughThis;

// // Example usage
// // droughThis('109A', 2023, 12)
// //     .then(result => console.log(result))
// //     .catch(error => console.error(error));

//new one below if not work switch above

var ee = require('@google/earthengine');
const dataPath = 'data.json';
const fs = require('fs');
const { json } = require('body-parser');
var privateKey = require('./ee-shankarkaustubh1k3-309c1fd4ff3f.json');

console.log("drought_gee.js");

async function droughtThis(FarmerId, Tyear, Tmonth) {
    return new Promise(async (resolve, reject) => {
        try {
            if (FarmerId === undefined) {
                return resolve(0);
            }
            console.log(`This are the inputs: ${FarmerId},${Tyear},${Tmonth} `);

            // Loading the Earth Engine asset
            var custom_10_new =await  ee.FeatureCollection("projects/ee-shankarkaustubh1k3/assets/custom_10_new");

            // Reading data.json file here:
            const dataString = await fs.readFileSync(dataPath, 'utf8');

            // Parse the JSON string to create a JavaScript object
            const data = await JSON.parse(dataString);

            // Fetch shapefile name based on FarmerId from data.json
            const shapeFileName = data[FarmerId.toUpperCase()]?.shapeFileName;
            const FarmerName = data[FarmerId.toUpperCase()]?.name;

            if (!shapeFileName) {
                return reject(new Error(`Shapefile name not found for FarmerId: ${FarmerId}`));
            }
            console.log(`This is the Shapefile fetched: ${shapeFileName}`);

            // Filter the ROI based on the shapeFileName
            var aoi =await  custom_10_new.filter(ee.Filter.eq('land_ident', shapeFileName));

            // Calculate land area
            const landarea = await aoi.geometry().area().divide(10000).getInfo();
            console.log(landarea);

            // MODIS NDVI data
            var dataset = await ee.ImageCollection('MODIS/061/MOD13Q1')
                .select('NDVI');

            // console.log(dataset.size(), "Total number of NDVI Images");

            // MODIS NDVI values come as NDVI x 10000 that need to be scaled by 0.0001
            var modisScaled = await dataset.map(function (image) {
                var scaled = image.divide(10000);
                return scaled.copyProperties(image, ['system:index', 'system:time_start']);
            });

            // Year & Month for which we require VCI
            var year = 2022;
            var month = 10;
            
            // Max and Min NDVI for all years but for selected month
            var ndvi =  await modisScaled.filter(ee.Filter.calendarRange(month, month, 'month'));
            // console.log(ndvi, "For specific month");
            
            var ndvi_max =await ndvi.max().clip(aoi);
            var ndvi_min = await ndvi.min().clip(aoi);


            
            // ndviT is the current NDVI (for a given month & year)
            var ndviT =await  modisScaled.filter(ee.Filter.calendarRange(year, year, 'year'))
            .filter(ee.Filter.calendarRange(month, month, 'month'))
            .mean()
            .clip(aoi);

            console.log(ndvi_max.getInfo());
            
        if(ndviT){
             // Final calculation of VCI for specified month & year
             var VCI =  await ndviT.subtract(ndvi_min).divide(ndvi_max.subtract(ndvi_min)).rename('VCI');
            
             // Print VCI for the entire AOI
            //  console.log("vci=kaus=",VCI);
             
            console.log("HI-1");
            // console.log(VCI.getInfo())
            
             var meanVCI = await VCI.reduceRegion({
                 reducer: ee.Reducer.mean(),
                 geometry: aoi,
                 scale: 250, // Adjust the scale as needed
                 maxPixels: 1e9
             });
        

             console.log("HI-2")
 
             //if (meanVCI && meanVCI.get('VCI') !== undefined) {
                if(meanVCI){
                //  var vciValue =await   ee.Number(meanVCI.get('VCI')).getInfo();
                //  var vciPercentage = await  vciValue.multiply(100).getInfo();

                //  console.log("Mean VCI for AOI:", vciValue);
                //  console.log("The percentage of VCI in AOI is:", vciPercentage);
                //  console.log(VCI, "VCI for the current date");
 
                 /* extension */
                 // Threshold for considering VCI as drought-affected (adjust as needed)
                 var droughtThreshold = 0.4; // Example threshold, you can adjust this
 
                 // Masking areas where VCI is greater than the threshold
                 var droughtMask =  VCI.lte(droughtThreshold);
 
                 // Calculating the area of drought-affected region in hectares
                 var droughtArea = await droughtMask.multiply(ee.Image.pixelArea())
                     .reduceRegion({
                         reducer: ee.Reducer.sum(),
                         geometry: aoi,
                         scale: 250, // Adjust the scale as needed
                         maxPixels: 1e9
                     });
 
                 if (droughtArea && droughtArea.get('VCI') !== undefined) {
                     // Convert the area from square meters to hectares
                     var droughtAreaHectares = ee.Number(droughtArea.get('VCI')).divide(10000).getInfo();
 
                     console.log("Drought-affected area in AOI (hectares):", droughtAreaHectares);
                 } else {
                     console.error("Error calculating drought area. Check the VCI image.");
                 }
             } else {
                 console.error("Error calculating mean VCI. Check the VCI image.");
             }
        }

        else{
            console.error("Error: ndviT is undefined. Check the filtering of MODIS images.");
        }

           

            /* calculating for crop area specifically, this is a cont extension */
            var landcover = await ee.ImageCollection("ESA/WorldCover/v200");
            var lc = await landcover.mosaic().clip(aoi);

            // Cropland Exposed
            var cropland = await lc.select('Map').eq(40).selfMask();
            var cropland_affected =await  droughtMask.updateMask(cropland).rename('crop');

            // Calculate the area of affected cropland in hectares
            var crop_pixelarea =  await cropland_affected.multiply(ee.Image.pixelArea());
            var crop_stats = await  crop_pixelarea.reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: aoi,
                scale: 10,
                maxPixels: 1e12
            });

            var droughtCroplandAreaHa =  await ee.Number(crop_stats.get('crop')).divide(10000).round().getInfo();
            console.log('Drought Affected Cropland Area (Ha)', droughtCroplandAreaHa);

            // Resolve with the result
            resolve({ "d_landarea" : landarea,
            "d_FarmerName" : FarmerName,
            "droughtAffectedArea": droughtAreaHectares,
            "droughtAffectedCropArea" : droughtCroplandAreaHa});
        } catch (error) {
            reject(error);
        }
    });
}

// Authenticate using a service account.
// ee.data.authenticateViaPrivateKey(privateKey, () => {
//     // Call the function when authentication is successful.
//     try {
    
//         ee.initialize(null, null, async function () {
//           try {
//             const res = await  droughtThis("110A", 2022, 10);
//           } catch (e) {
//             console.error('Analysis error: ' + e);
        
//           }
//           // ... run analysis ...
//         }, function (e) {
//           console.error('Initialization error: ' + e);
//         });
//       } catch (e) {
//         console.error('Authentication error: ' + e);
//       }
    
   
// }, (e) => {
//     console.error('Authentication error: ' + e);
// });

module.exports = droughtThis;