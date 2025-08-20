import React from 'react';

const Footer = () => {
  return (
    <footer
      className="bg-white text-dark pt-5 pb-3"
      style={{ borderTop: '4px solid #B82933' }}
    >
      <div className="container text-center">
        <h5 className="mb-2">Brownson Industries</h5>
        <p className="mb-1">139 Bankshall Street, Colombo 11, Sri Lanka</p>
        <p className="mb-1">Phone: (+94) (011) 2327197</p>
        <p className="mb-1">International Area Code: +94</p>
        <hr className="my-3" style={{ borderTop: '2px solid #B82933' }} />
        <p className="mb-0">&copy; 2025 Brownson Industries. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;// footer component for the Brownson website
