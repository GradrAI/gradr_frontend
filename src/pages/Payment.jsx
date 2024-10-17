import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [paymentReference, setPaymentReference] = useState("");
  const nav = useNavigate();

  const details = {
    cardNumber: "2223000000000007",
    expiryMonth: "05",
    expiryYear: "21",
    cvv: "100",
    amount: "20",
    currency: "NGN",
    cardName: "Jane Smith",
    email: "js@emaildomain.com",
    mobileNumber: "09022323537",
  };

  const handlePayment = () => {
    // Perform payment processing logic here
    // Assuming payment is successful and payment reference is generated
    const generatedReference = generatePaymentReference(); // Implement this function
    setPaymentReference(generatedReference);
    // Display alert with payment success message and reference
    alert("Payment Successful\nPayment Reference: " + generatedReference);
    nav("/assessments");
  };

  const generatePaymentReference = () => {
    // Generate payment reference logic here (e.g., using a library or API)
    return "WQ6676yPOpr12348o";
  };

  return (
    <div className="h-100 p-4 flex items-center justify-center bg-[#f3f4f6]">
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
        className=""
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
          }}
        >
          Payment Details
        </h2>
        <div style={{ marginBottom: "1rem" }}>
          {Object.entries(details).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label
                htmlFor={key}
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                {key.toUpperCase()}
              </label>
              <input
                id={key}
                type="text"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                value={value}
                readOnly
              />
            </div>
          ))}
        </div>
        <button
          style={{
            width: "100%",
            padding: "0.5rem",
            backgroundColor: "#6366f1",
            color: "#ffffff",
            borderRadius: "0.375rem",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onClick={handlePayment}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default Payment;
