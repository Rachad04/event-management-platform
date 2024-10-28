import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Header Section */}
      <header className="header">
        <h1>Welcome to Our Platform</h1>
        <button className="cta-button">Get Started</button>
      </header>
      
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </nav>
      
      {/* Main Content */}
      <main className="content">
        <section className="highlight-section">
          <h2>Featured Services</h2>
          <p>Explore our latest offerings and solutions for your needs.</p>
        </section>
        
        <section className="secondary-section">
          <h3>About Us</h3>
          <p>Discover what sets us apart and how we bring value to you.</p>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Our Company. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
