import React from 'react';
import './Home.css';

const Home = () => {
  const sectionStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: `url("/img/image/homebg.png")`,
    backgroundSize: 'cover',
    position: 'relative',
    paddingLeft: '5%',
  };
const handleSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  const validateForm = (form) => {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    for (let input of inputs) {
      if (!input.value.trim()) {
        return false;
      }
    }
    return true;
  };

  if (!validateForm(form)) {
    formMessage.innerText = 'Please fill all required fields.';
    formMessage.style.color = 'red';
    formMessage.style.display = 'block';
    return;
  }

  const formData = new FormData(form);

  try {

    // ✅ Submit to Formspree (or other email service)
    const response = await fetch('https://formspree.io/f/meokwejl', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      formMessage.innerText = 'Your message has been sent successfully!';
      formMessage.style.color = 'green';
      formMessage.style.display = 'block';
      form.reset();
    } else {
      throw new Error('Formspree submission failed');
    }
  } catch (err) {
    console.error(err);
    formMessage.innerText = 'There was a problem submitting your message. Please try again.';
    formMessage.style.color = 'red';
    formMessage.style.display = 'block';
  }
};

  return (
    <>
      {/* HOME SECTION */}
      <section className="home" id="home" style={sectionStyle}>
        <div className="content">
          <h3>Welcome to Brownson</h3>
          <h2>Delivering Quality Food Products with a Seamless Online Experience</h2>
          <a href="/store" className="btn">Shop Now</a>
        </div>
        <img src="/img/image/bottom_wave.png" className="wave" alt="wave" />
      </section>

      {/* OFFERS SECTION */}
      <section className="plan" id="plan">
        <h1 className="heading">
          Offers and Promos
        </h1>

        <div className="box-container">
          {/* Hot Offer Box */}
          <div className="box">
            <h3 className="title">Hot</h3>
            <h3 className="day">Limited Bundle</h3>
            <i className="bi bi-clock-fill icon"></i>
            <div className="list">
              <p>One selected Brownson cake <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Two jelly packs <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Three-day delivery <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Cash on Delivery <span><i className="bi bi-check-circle-fill"></i></span></p>
            </div>
            <div className="amount"><span>Rs.</span>6,000</div>
          </div>

          {/* Sale Offer Box */}
          <div className="box">
            <h3 className="title">Sale</h3>
            <h3 className="day">10% Off</h3>
            <i className="bi bi-currency-dollar icon"></i>
            <div className="list">
              <p>Any selected product <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>No return <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Card payments only <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>One-two day delivery <span><i className="bi bi-check-circle-fill"></i></span></p>
            </div>
            <div className="amount"><span>from Rs.</span>2,000</div>
          </div>

          {/* New Offer Box */}
          <div className="box">
            <h3 className="title">New</h3>
            <h3 className="day">Free Delivery</h3>
            <i className="bi bi-truck icon"></i>
            <div className="list">
              <p>Order within today <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Applies to all products <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>Cash on delivery <span><i className="bi bi-check-circle-fill"></i></span></p>
              <p>One-two day delivery <span><i className="bi bi-check-circle-fill"></i></span></p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER Product  CART */}
      <section className="filter-cart">
        <h1 className="heading">Quick <span>Filter</span> Cart</h1>
        <div className="filter-boxes">
          <div className="filter-item" onClick={() => window.location.href = '/store?category=Jellies'}>
            <img src="/img/image/jelly.png" alt="Jellies" />
            <p>Jellies</p>
          </div>
          <div className="filter-item" onClick={() => window.location.href = '/store?category=Custards'}>
            <img src="/img/image/custard.png" alt="Custards" />
            <p>Custards</p>
          </div>
          <div className="filter-item" onClick={() => window.location.href = '/store?category=Food essences'}>
            <img src="/img/image/essence.png" alt="Essences" />
            <p>Essences</p>
          </div>
          <div className="filter-item" onClick={() => window.location.href = '/store?category=Cake ingredients'}>
            <img src="/img/image/cake.png" alt="Cake Ingredients" />
            <p>Cake Items</p>
          </div>
          <div className="filter-item" onClick={() => window.location.href = '/store?category=Artificial colors and flavors'}>
            <img src="/img/image/colors.png" alt="Colors & Flavors" />
            <p>Colors</p>
          </div>
        </div>
      </section>

    
      <section className="about" id="about">
        <div className="image">
          <img src="/img/image/about.png" style={{ borderRadius: '10px' }} alt="About Brownson" />
        </div>
        <div className="content">
          <h1>About</h1>
          <h3>Welcome to <span>Brownson</span> Industries</h3>
          <p>
            Brownson Industries is a trusted manufacturer of high-quality food products such as cakes and jellies. With the launch of our first-ever e-commerce platform, we now bring our delicious treats directly to customers through a seamless and user-friendly online experience.
          </p>
          <h3><span>What does</span> Brownson offer?</h3>
          <p>
            Our online platform offers a wide range of cakes, jellies, and custom food items with secure ordering and doorstep delivery. Customers can browse, filter, and purchase products with ease. We also provide a smart chatbot for customer support and a smooth shopping experience across all devices.
          </p>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services" id="services">
        <h1 className="heading">Our <span>Services</span></h1>
        <div className="box-container">
          <div className="box">
            <h3>Freshly Made Products</h3>
            <p>Locally produced cakes and jellies.</p>
          </div>
          <div className="box">
            <h3>Online Ordering</h3>
            <p>Simple and secure product browsing and checkout.</p>
          </div>
          <div className="box">
            <h3>Fast Delivery</h3>
            <p>Guaranteed 1–2 day delivery service.</p>
          </div>
          <div className="box">
            <h3>Secure Payments</h3>
            <p>Safe checkout using trusted gateways.</p>
          </div>
          <div className="box">
            <h3>24/7 Support</h3>
            <p>Customer assistance through live chat and email.</p>
          </div>
          <div className="box">
            <h3>New Flavours Coming</h3>
            <p>Seasonal promotions and new product releases.</p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact" id="contact">
        <div className="image">
          <img src="/img/image/calls.png" alt="Contact Us" />
        </div>
        <form id="contactForm" onSubmit={handleSubmit}>
          <h3>Contact Us</h3>
          <div id="formMessage" style={{ color: 'green', display: 'none' }}></div>
          <input type="text" name="name" placeholder="Your Name" className="box" required />
          <input type="email" name="email" placeholder="Your Email" className="box" required />
          <input type="tel" name="number" placeholder="Your Phone Number" className="box" pattern="[0-9]{10}" required />
          <textarea name="message" placeholder="Your Message" cols="30" rows="10" className="box" required></textarea>
          <input type="submit" value="Send Message" className="btn" />
        </form>
      </section>
    </>
  );
};

export default Home;
