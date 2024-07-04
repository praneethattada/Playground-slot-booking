// import React from "react";
// import { useEffect } from "react";
// import { useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { useDispatch } from 'react-redux'
// const AdminAddCities = () => {
//   const [cities, setCities] = useState([]);
//   const [playground, setPlaygrounds] = useState([]);
//   const [playgroundimg, setPlaygroundimages] = useState([]);
//   var dispatch=useDispatch()
//   useEffect(() => {
//     loadCities();
//   }, []);
//   function loadCities() {
//     axios({
//       method: "get",
//       url: "http://localhost:3003/cities",
//     }).then(
//       (res) => {
//         setCities(res.data);
//         // console.log(res.data);
//       },
//       (error) => {
//         alert("Database not connected");
//       }
//     );
//   }

//   function viewPlayground(index) {
//     setPlaygrounds(cities[index].playground?.grounds);
//     setPlaygroundimages(cities[index].playground?.img);
//     // console.log(index);
//   }
//   useEffect(()=>{
//       dispatch({
//           type:"PLAYGROUND",
//          payload:playground
//       })
//   })
//   useEffect(()=>{
//       dispatch({
//           type:"PLAYGROUNDIMAGES",
//          payload:playgroundimg
//       })
//   })

//   return (
//     <div>
//       <div>
//         {cities?.map((city, index) => {
//           return (
//             <div className="contain" style={{ alignItems: "" }}>
//               <div>
//                 <img
//                   src={city.img}
//                   alt="..."
//                   class="image"
//                   style={{ width: "100%", display: "inline-block" }}
//                 />
//               </div>
//               <div className="middle">
//                 <div>
//                   <button
//                     onClick={viewPlayground.bind(null, index)}
//                     className="text"
//                     style={{
//                       borderRadius: "2rem",
//                       backgroundColor: "none",
//                       border: "none",
//                     }}
//                   >
//                     <h4 className="fw-bold mb-2 text-uppercase">{city.city}</h4>
//                   </button>
//                 </div>
//               </div>{" "}
//             </div>
//           );
//         })}
//       </div>
//       <div>
//         <thead class="table-dark">
//           <tr>
//             <th scope="col">Sr no.</th>
//             <th scope="col">Ground</th>
//             <th scope="col">Ground Name</th>
//             <th scope="col"></th>
//           </tr>
//         </thead>

//         {playground?.map((playground, index) => {
//           return (
//             <div>
//               <table class="table border shadow">
//                 <tbody>
//                   <tr>
//                     <th scope="row">{index + 1}</th>
//                     <td>
//                       <img
//                         style={{ width: "30vw", height: "20vw" }}
//                         src={playgroundimg[index]}
//                       ></img>
//                     </td>
//                     <td style={{ alignContent: "flex-start" }}>
//                       <h4 style={{ textEmphasis: "ActiveBorder" }}>
//                         {playground}
//                       </h4>
//                     </td>

//                     <td>
//                       <Link
                      
//                         class="btn btn-primary me-2"
//                         exact
//                         to={`/adminaddslots/${index}`}
//                       >
//                         Add Slots
//                       </Link>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default AdminAddCities;
