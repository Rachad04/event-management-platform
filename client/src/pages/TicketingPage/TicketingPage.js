import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";
import axios from "axios";
import "./TicketingPage.css";
import noImageIcon from "./Images/logo-colors.png";

const TicketingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { auth, isAuthenticated } = useContext(AuthContext);

  const [eventDetails, setEventDetails] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login", { state: { from: `/event/${eventId}` } });
    }
  }, [isAuthenticated, loading, navigate, eventId]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/events/${eventId}`,
          {
            headers: auth.token
              ? { Authorization: `Bearer ${auth.token}` }
              : {},
          }
        );

        if (response.data) {
          console.log("Fetched event details:", response.data);
          setEventDetails(response.data);
        } else {
          console.error("No event found for the given eventId.");
          alert("Event not found. Redirecting to homepage.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        alert("Failed to load event details. Redirecting to homepage.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    } else {
      console.error("No valid eventId provided. Redirecting home...");
      navigate("/");
    }
  }, [eventId, navigate, auth.token]);

  const calculateTotalFees = () => {
    if (!eventDetails) return 0;
    return tickets * eventDetails.price;
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to proceed with checkout.");
      navigate("/login", { state: { from: `/event/${eventId}` } });
      return;
    }

    if (!auth.user?.id) {
      alert("User information not found. Please log in again.");
      navigate("/login");
      return;
    }

    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.cardHolder ||
      !paymentDetails.expiryDate ||
      !paymentDetails.cvv
    ) {
      alert("Please fill in all payment details.");
      return;
    }

    try {
      // Process payment
      const paymentResponse = await axios.post(
        "http://localhost:5000/api/pay",
        {
          ticketId: eventId,
          paymentMethod: "Credit Card",
          tickets,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      console.log("Payment successful:", paymentResponse.data);

      // Record the purchase
      const purchaseResponse = await axios.post(
        "http://localhost:5000/api/purchases",
        {
          user_id: auth.user.id,
          event_id: eventId,
          purchase_date: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      console.log("Purchase recorded:", purchaseResponse.data);
      alert("Payment Successful! Your ticket purchase has been recorded.");
      navigate("/");
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (!eventDetails) {
    return <div>No event found!</div>;
  }

  return (
    <div className="ticketing-page">
      <div className="title-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          &#x3C;
        </button>
        <h1>{eventDetails.title}</h1>
      </div>

      <div className="ticket-info">
        <img
          src={eventDetails.image_url || noImageIcon}
          alt={eventDetails.title}
          className="event-image"
        />
        <div>
          <p>
            <strong>Date:</strong> {eventDetails.date}
          </p>
          <p>
            <strong>Location:</strong> {eventDetails.location}
          </p>
          <p>
            <strong>Description:</strong> {eventDetails.description}
          </p>
        </div>
      </div>

      <div className="ticket-selection">
        <h2>Select Tickets</h2>
        <div className="ticket-option">
          <label htmlFor="tickets">Tickets</label>
          <input
            type="number"
            id="tickets"
            min="1"
            value={tickets}
            onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="total-fees">
          <p>
            <strong>Total Fees:</strong> ${calculateTotalFees()}
          </p>
        </div>
      </div>

      <div className="payment-section">
        <h2>Payment Details</h2>
        <form onSubmit={handleCheckout}>
          <div className="payment-field">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="payment-field">
            <label htmlFor="cardHolder">Card Holder Name</label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={paymentDetails.cardHolder}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="payment-row">
            <div className="payment-field">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="payment-field">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handlePaymentChange}
                required
              />
            </div>
          </div>
          <button className="checkout-button" type="submit">
            Proceed to Checkout
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketingPage;
