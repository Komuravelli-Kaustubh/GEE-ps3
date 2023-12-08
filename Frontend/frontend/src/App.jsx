// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [area, setArea] = useState('');
//   const [ans, setAns] = useState({});

//   // Handle the form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetch('http://localhost:8080/fetch', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ area }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//         setAns(data);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   };

//   return (
//     <>
//       <div className="container my-3">
//         <h2>Area</h2>
//         <form className="my-3" id="areaForm" onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="title" className="form-label">
//               Area
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="title"
//               name="area"
//               value={area}
//               onChange={(e) => {
//                 setArea(e.target.value);
//               }}
//               required
//             />
//           </div>
//           <button type="submit" className="btn btn-primary">
//             Calculate
//           </button>
//           {ans.landarea !== undefined && (
//             <div
//               style={{
//                 border: '1px solid #ccc',
//                 borderRadius: '5px',
//                 padding: '10px',
//                 margin: '10px',
//                 backgroundColor: '#f9f9f9',
//                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             >
//               <p>
//                 Total land area of {area}:{' '}
//                 <span style={{ fontWeight: 'bold' }}>{ans.landarea}</span> (in hect)
//               </p>
//             </div>
//           )}
//           {ans.floodAreaHa !== undefined && (
//             <div
//               style={{
//                 border: '1px solid #ccc',
//                 borderRadius: '5px',
//                 padding: '10px',
//                 margin: '10px',
//                 backgroundColor: '#f9f9f9',
//                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             >
//               <p>
//                 Flooded area of {area}: <span style={{ fontWeight: 'bold' }}>{ans.floodAreaHa}</span> (in hect)
//               </p>
//             </div>
//           )}
//           {ans.floodAreaHa !== undefined && ans.landarea !== undefined && (
//             <div
//               style={{
//                 border: '1px solid #ccc',
//                 borderRadius: '5px',
//                 padding: '10px',
//                 margin: '10px',
//                 backgroundColor: '#f9f9f9',
//                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             >
//               <p>
//                 Percentage of area flooded:{' '}
//                 <span style={{ fontWeight: 'bold' }}>
//                   {(ans.floodAreaHa / ans.landarea) * 100}%
//                 </span>
//               </p>
//             </div>
//           )}
//         </form>
//       </div>
//     </>
//   );
// }

// export default App;

import React, { useState } from 'react';
import './App.css';

function App() {
  const [area, setArea] = useState('');
  const [FarmerId, setFarmerId] = useState('');
  const [beforeDate, setBeforeDate] = useState('');
  const [afterDate, setAfterDate] = useState('');
  const [ans, setAns] = useState({FarmerName : "default-name"});

  // Function to convert date to 'yyyy-mm-dd' format
  // const formatDate = (dateString) => {
  //   console.log("Given DAte "+dateString)
  //   const [day, month, year]= dateString.split('-');
  //   return `${year}-${month}-${day}`;
  // };


  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FarmerId,
        // area,
        beforeDate: beforeDate,
        afterDate: afterDate,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('This is the final output fetched ' + data);
        setAns(data);
        console.log(Object.keys(data));
        console.log(data.floodAffectedCropArea);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <>
      <div className="container my-3">
        <h2>Area</h2>
        <form className="my-3" id="areaForm" onSubmit={handleSubmit}>
          {/* Existing input for area */}
          <div className="mb-3">
            <label htmlFor="FarmerId" className="form-label">
              Enter Farmer Id :
            </label>
            <input
              type="text"
              className="form-control"
              id="FarmerId"
              name="FarmerID"
              value={FarmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="area" className="form-label">
              Area
            </label>
            <input
              type="text"
              className="form-control"
              id="area"
              name="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>

          {/* New input for before date */}
          <div className="mb-3">
            <label htmlFor="beforeDate" className="form-label">
              Before Date
            </label>
            <input
              type="date"
              className="form-control"
              id="beforeDate"
              name="beforeDate"
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
              required
            />
          </div>

          {/* New input for after date */}
          <div className="mb-3">
            <label htmlFor="afterDate" className="form-label">
              After Date
            </label>
            <input
              type="date"
              className="form-control"
              id="afterDate"
              name="afterDate"
              value={afterDate}
              onChange={(e) => setAfterDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Calculate
          </button>
          
          {ans.landarea !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Total land area of {ans.FarmerName}:{' '}
                <span style={{ fontWeight: 'bold' }}>{ans.landarea}</span> (in hect)
              </p>
            </div>
          )}
          {ans.floodAreaHa !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Flooded area of {ans.FarmerName}: <span style={{ fontWeight: 'bold' }}>{ans.floodAreaHa}</span> (in hect)
              </p>
            </div>
          )}
          {ans.floodAreaHa !== undefined && ans.landarea !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Percentage of area flooded:{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {(ans.floodAreaHa / ans.landarea) * 100}%
                </span>
              </p>
            </div>
          )}

           {ans.floodAffectedCropArea !== undefined && ans.landarea !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Flood Affected Crop Area is :{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {(ans.floodAffectedCropArea)}
                </span>
              </p>
            </div>
          )} 

          {/* Display results based on server response */}
          {/* ... (unchanged) */}
        </form>
      </div>
    </>
  );
}

export default App;
