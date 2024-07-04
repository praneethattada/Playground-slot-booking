import React from 'react';
import './About.css';
import abougBg  from '../../../images/about-bg.png';



const About = () => {
    return (
        <section className="about-section" id="about">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5>WELCOME TO THE PLAYGROUND</h5>
                        <h3>WE ARE PROVIDING THE PLAYGROUND FOR EVERY GAME</h3>
                        <p className="mt-4">
                            Playground is a company that connects the world and creates a dream world together.
                            Through this type of app, a playground joiner or anyone who wants to play with his/her teams can directly contact the playground owner and book a reservation for a particular date. !
                        </p>
                    </div>
                    <div className="col-md-5 d-flex justify-content-end">
                        <img className="img-fluid moc-up" src={abougBg} alt="pic" />
            
                        
                    </div>

                    <div className="col-md-3 about-middle align-self-start">
                        <h5>TIMING HOURS</h5>
                    <table className="table">
                        <tbody>
                            <tr>
                                <th>MON</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>TUE</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>WED</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>THU</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>FRI</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>SAT</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                            <tr>
                                <th>SUN</th>
                                <td>9:00AM-8:00PM</td>
                            </tr>
                        </tbody>
                    </table>
                        
                    </div>
                </div>
            </div>
            

        </section>
    );
};

export default About;