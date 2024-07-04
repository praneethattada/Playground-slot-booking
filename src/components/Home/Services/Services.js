import React, { useEffect, useState } from 'react';
import './Services.css';
import ServiceCard from '../ServiceCard/ServiceCard';
import AOS from 'aos';
import 'aos/dist/aos.css';
import SectionTitle from '../../Shared/SectionTitle/SectionTitle';

const Services = () => {

    const [services, setServices] = useState([]);

    // useEffect( ()=>{
    //     fetch('https://stormy-thicket-33100.herokuapp.com/services')
    //     .then(res => res.json())
    //     .then(data=>setServices(data))

    // },[]);





    useEffect( ()=>{
            AOS.init({duration: 2000});
    },[]);


    return (
        <section className="container" id="services">
           
            <SectionTitle  subTitle={"BIG GROUND FACILITIES"} title={"OUR SERVICES"} /><br></br>
            <div className="feed1">
            <ul style={{listStyleType:'circle'}}>
                <li><em>Offer to book playground for a wide range of sports.</em></li>
                <li><em>Our website provides real-time information on the availability of slots.</em></li>
                <li><em>Dedicated customer support team available to assist users with any queries.</em></li>
            </ul>
            </div>
            <div data-aos="fade-up" className="row">
                {
                    services.map( (service, index) =><ServiceCard service ={service} key={index}></ServiceCard>)
                }
            </div>

        </section>
    );
};

export default Services;