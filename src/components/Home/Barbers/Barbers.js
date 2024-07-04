import React from 'react';
import SectionTitle from '../../Shared/SectionTitle/SectionTitle';
import barber1 from '../../../images/vir.jpg';
import barber2 from '../../../images/dho.jpeg';
import barber3 from '../../../images/roh.jpeg';
import BarberCard from '../BarberCard/BarberCard';

const Barbers = () => {

    const barberData =[
        {
            picture: barber1 ,
            name: "Virat", 
            fb: "https://facebook.com",
            twitter:"https://facebook.com",
            description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected materials."
        },
        {
            picture: barber2 ,
            name: "Dhoni", 
            fb: "https://facebook.com",
            twitter:"https://facebook.com",
            description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected materials."
        },
        {
            picture: barber3 ,
            name: "Rohit", 
            fb: "https://facebook.com",
            twitter:"https://facebook.com",
            description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected materials."
        },
        
    ]


    return (
        <section   className="container" id="reviews">
            <SectionTitle subTitle={"WE CAN MAKE YOUR AWESOMENESS "} title={"CONTACT INFORMATION"} />

            <div className="row">
              {
                  barberData.map((barber, index) =><BarberCard barber={barber} key={index} />)
              }
            </div>

        </section>
    );
};

export default Barbers;