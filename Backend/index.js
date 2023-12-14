const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.post('/fetch', async (req, res) => {
  var getArea =require('./authenticate');
  // const a=req.body.area.toUpperCase();
  const FarmerId = req.body.FarmerId;
  // const a = req.body.area;
  const beforeDate = req.body.beforeDate;
  const afterDate = req.body.afterDate;
  var ans=await getArea(FarmerId,beforeDate,afterDate);
  console.log("After getArea "+ans);
  // console.log("Area "+ area + " ");
  res.json(ans);
});

//Making route for drought purpose below
app.post('/for_drought',async(req,res)=>{
  var getDrought =require('./d_authenticate');
  const d_FarmerId = req.body.d_FarmerId;
  const d_TMonth = req.body.d_TMonth;
  const d_TYear = req.body.d_TYear;

  var d_ans = await getDrought(d_FarmerId,d_TYear,d_TMonth);
  console.log("At index.js drought function executed");
  console.log("printing d_ans: ",d_ans);
  res.json(d_ans);
})

app.listen(8080, function () {
  console.log('Server started on port 8080');
});
