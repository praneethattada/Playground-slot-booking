import React from "react";
import { useEffect } from "react";
import { useState,useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux'
import './adminview.css';

const AdminViewCities = () => {
    const [cities, setCities] = useState([]);
    const [playground, setPlaygrounds] = useState([]);
    const [playgroundimg, setPlaygroundimages] = useState([]);
    var dispatch=useDispatch()
    useEffect(() => {
      loadCities();
    }, []);
    function loadCities() {
      axios({
        method: "get",
        url: "http://localhost:3003/cities",
      }).then(
        (res) => {
          setCities(res.data);
          // console.log(res.data);
        },
        (error) => {
          alert("Database not connected");
        }
      );
    }

    const ref = useRef(null);
    function viewPlayground(index) {
      setPlaygrounds(cities[index].playground?.grounds);
      setPlaygroundimages(cities[index].playground?.img);
      ref.current?.scrollIntoView({behavior: 'smooth'});
      console.log(index);
    }

  
    // function viewPlayground(index) {
    //   setPlaygrounds(cities[index].playground?.grounds);
    //   setPlaygroundimages(cities[index].playground?.img);
    //   console.log(index);
    // }
    useEffect(()=>{
        dispatch({
            type:"PLAYGROUND",
           payload:playground
        })
    })
    useEffect(()=>{
        dispatch({
            type:"PLAYGROUNDIMAGES",
           payload:playgroundimg
        })
    })
  
    return (
      <div>
        <div className="d-flex imgbut">
        {cities?.map((city, index) => {
          return (
            <div className="contain" style={{ alignItems: "" }}>
              <div
                onClick={viewPlayground.bind(null, index)}
                style={{ position: "relative" }}
                className="dd"
              >
                <img
                  src={city.img}
                  alt="..."
                  class="img"
                  style={{
                    width: "30rem",
                    height: "20rem",
                    marginLeft: "2rem",
                    marginTop: "10rem",
                    marginBottom: "15rem",
                    display: "inline-block",
                    // position:"absolute"
                  }}
                />
              </div>
              <div className="middle">
                {/* <div style={{ position: "relative" }}> */}
                  {/* <button
                    onClick={viewPlayground.bind(null, index)}
                    className="text"
                    style={{
                      borderRadius: "2rem",
                      backgroundColor: "none",
                      border: "none",
                      marginTop:"-20rem"
                    }}
                  >
                    <h4
                      className="fw-bold mb-2 text-uppercase"
                      style={{
                        backgroundColor: "white",
                        color: "black",
                        marginTop: "1rem",
                      }}
                    >
                      {city.city}
                    </h4>
                  </button> */}
                  <div className="box-3">
                    <div className="btn btn-three" onClick={viewPlayground.bind(null, index)}>
                      <span>{city.city}</span>
                    </div>
                  </div>
                {/* </div> */}
              </div>{" "}
            </div>
          );
        })}
        </div>


             <div ref={ref}>
        <thead class="table-dark">
          {/* <tr>
                            <th scope="col">Sr no.</th>
                            <th scope="col">Ground</th>
                            <th scope="col">Ground Name</th>
                            <th scope="col"></th>


                        </tr> */}
        </thead>

        {playground?.map((playground, index) => {
          return (
            <div >
              <table className="table border shadow">
                <tbody>
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <img
                        style={{ width: "35vw", height: "20vw" }}
                        src={playgroundimg[index]}
                        className="image2"
                      ></img>
                    </td>

                    <td style={{ alignContent: "flex-start" }}>
                      <h4
                        style={{ textEmphasis: "ActiveBorder" }}
                        className="ptext"
                      >
                        {playground}
                      </h4>
                    </td>
  
                      <td>
                       <Link exact to ={`/adminviewslots/${index}`}>
                        <button className="btn1">
                          View Slots
                        </button>
                        </Link><br></br><br></br>
                        
                      </td>
                      <td>
                       <Link exact to ={`/adminaddslots/${index}`}>
                        <button className="btn2 ">
                         Add Slots 
                        </button>
                        </Link><br></br><br></br>
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

export default AdminViewCities