export default function Checkout() {
  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h1>CHECKOUT</h1>
        <div className="steps">
          <span className="active">INFORMATION</span>
          <span>SHIPPING</span>
          <span>PAYMENT</span>
        </div>

        <div className="section">
          <h3>CONTACT INFO</h3>
          <input type="email" placeholder="Email" />
          <input type="text" placeholder="Phone" />
        </div>

        <div className="section">
          <h3>SHIPPING ADDRESS</h3>
          <div className="row">
            <input type="text" placeholder="First Name" />
            <input type="text" placeholder="Last Name" />
          </div>
          <input type="text" placeholder="Country" />
          <input type="text" placeholder="State / Region" />
          <input type="text" placeholder="Address" />

          <div className="row">
            <input type="text" placeholder="City" />
            <input type="text" placeholder="Postal Code" />
          </div>
          <button className="next-btn">Shipping →</button>
        </div>
      </div>

      <div className="checkout-right">
        <h3>YOUR ORDER</h3>

        <div className="product">
          <img src="/img/shirt1.jpg" alt="Product" />
          <div>
            <p className="title">Basic Heavy T-Shirt</p>
            <p>Black / L</p>
            <a href="#">Change</a>
            <p>(1)</p>
          </div>
          <p className="price">$99</p>
        </div>

        <div className="product">
          <img src="/img/shirt2.jpg" alt="Product" />
          <div>
            <p className="title">Basic Fit T-Shirt</p>
            <p>Black / L</p>
            <a href="#">Change</a>
            <p>(1)</p>
          </div>
          <p className="price">$99</p>
        </div>

        <div className="summary">
          <div className="line"><span>Subtotal</span><span>$180.00</span></div>
          <div className="line"><span>Shipping</span><span>Calculated at next step</span></div>
          <div className="total"><span>Total</span><span>$180.00</span></div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;


