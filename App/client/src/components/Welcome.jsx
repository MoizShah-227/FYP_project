import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeIllustration from '../assets/welcome.svg';
import api from '../../config/axiosConfig';

function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/user/check-session", {
          withCredentials: true
        });
  
        if (response.data.loggedIn) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/feed");
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
    console.log(checkSession())
    checkSession();
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div
      className="vh-100 vw-100 d-flex flex-column m-0 p-0"
      style={{
        background: 'linear-gradient(135deg, #FBFCFC 0%, #e8f0f5 100%)', // light & clean like screenshot
        color: '#052730',
      }}
    >
      <div className="container-fluid flex-grow-1 d-flex flex-column justify-content-center p-0">
        <div className="row g-0 flex-grow-1 align-items-center">
          {/* Illustration - top on mobile, left on lg+ */}
          <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center px-4 pt-4 pt-lg-5 pb-3 pb-lg-0">
            <img
              src={WelcomeIllustration}
              alt="Girl sitting by window pointing at big tree"
              className="img-fluid"
              style={{
                maxHeight: 'clamp(320px, 55vh, 680px)', // smaller on mobile, bigger on desktop
                width: '100%',
                maxWidth: 'clamp(280px, 80vw, 580px)',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(5,39,48,0.18))',
              }}
            />
          </div>

          {/* Text content - bottom on mobile, right on lg+ */}
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center align-items-lg-start px-4 px-lg-5 pb-5 pb-lg-0">
            <h1
              className="fw-bold text-center text-lg-start mb-3 mb-lg-4"
              style={{
                fontSize: 'clamp(2.1rem, 8vw, 4.2rem)',
                lineHeight: '1.05',
                color: '#052730',
              }}
            >
              <span style={{ display: 'block' }}>BIIT</span>
              welcome to Wishora
            </h1>

            <p
              className="fs-5 fs-lg-4 text-center text-lg-start mb-4 mb-lg-5"
              style={{
                color: '#747F81',
                maxWidth: '480px',
              }}
            >
              Celebrate every special moment
              <br className="d-none d-sm-inline" />
              with your teachers and classmates
            </p>

            <p
              className="fst-italic mb-4 mb-lg-5 text-center text-lg-start"
              style={{
                color: '#747F81',
                fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
              }}
            >
              Barani Institute of Information Technology
            </p>

            <button
              className="btn fw-bold rounded-pill shadow"
              style={{
                fontSize: 'clamp(1.15rem, 4.5vw, 1.4rem)',
                padding: 'clamp(0.8rem, 4vw, 1rem) clamp(2.2rem, 8vw, 3rem)',
                backgroundColor: '#FB9F24',
                color: '#052730',
                border: 'none',
                minWidth: 'clamp(220px, 60vw, 280px)',
              }}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;