import React from "react";
import { useCart } from "../../components/CartContext"; // Assurez-vous que le chemin est correct
import { useState } from "react";
import { Link } from "react-router";
import "./style.css";

const formatPrice = (p) => {
  return p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

function Checkout() {
  const { cartItems, cartTotal } = useCart();

  // Calcul du sous-total (peut-être déjà fait dans cartTotal, mais on s'assure d'avoir la donnée)
  // En utilisant le prix formaté du composant original (sans symbole €)
  const subtotal = formatPrice(cartTotal);
  // Pour l'affichage Total, qui sera le même au début sans frais de port
  const totalDisplay = formatPrice(cartTotal);
  // 1. NOUVEAU STATE : Pour stocker les données du formulaire d'adresse
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    address: "",
    city: "",
    postalCode: "",
  }); // 2. Fonction pour gérer le changement d'un champ

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  }; // 3. Logique pour déterminer si l'étape SHIPPING est "faite" (au moins un champ rempli) // Vous pouvez ajuster cette logique pour qu'elle soit plus stricte (tous les champs non vides)

  const isShippingCompleted = Object.values(shippingAddress).some(
    (val) => val.trim() !== ""
  ); // 4. Logique pour déterminer si on peut passer à l'étape PAYMENT (tous les champs sont remplis)
  const isAllShippingFieldsFilled = Object.values(shippingAddress).every(
    (val) => val.trim() !== ""
  );
  return (
    <div className="checkout-container ">
      <div className="checkout-left ">
        <h1>CHECKOUT</h1>
        <div className="steps">
          <span className="active">INFORMATION</span>
          <span className={isShippingCompleted ? "completed" : ""}>
            SHIPPING
          </span>{" "}
          <span className={isAllShippingFieldsFilled ? "completed" : ""}>
            PAYMENT
          </span>{" "}
        </div>
        <div className="section">
          <h3>CONTACT INFO</h3>
          <div className="row">
            <input type="email" placeholder="Email" />
            <input type="text" placeholder="Phone" />
          </div>
        </div>
        <div className="section">
          <h3>SHIPPING ADDRESS</h3>
          <div className="row">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={shippingAddress.lastName}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="Country"
              name="country"
              value={shippingAddress.country}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="State / Region"
              name="state"
              value={shippingAddress.state}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="Address"
              name="address"
              value={shippingAddress.address}
              onChange={handleShippingChange}
            />
          </div>

          <div className="row">
            <input
              type="text"
              placeholder="City"
              name="city"
              value={shippingAddress.city}
              onChange={handleShippingChange}
            />
          </div>

          <div className="row">
            <input
              type="text"
              placeholder="Postal Code"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleShippingChange}
            />
          </div>

          <button className="next-btn" disabled={!isAllShippingFieldsFilled}>
            Shipping →
          </button>
        </div>
      </div>

      <div className="checkout-right">
        <h3>YOUR ORDER</h3>
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          // Mapping des articles du panier
          cartItems.map((item) => (
            <div key={item.id} className="product">
              <img src={item.image || "/img/default.jpg"} alt={item.name} />
              <div>
                <p className="title">{item.name}</p>
                {/* Si les options (taille/couleur) sont dans l'objet item, 
                      affichez-les ici. Sinon, vous pouvez les laisser vides ou omises.
                    */}
                <p>{item.options || "N/A"}</p>
                <Link to="/cart" className="change-link">
                  Change
                </Link>
                <p>({item.quantity})</p>
              </div>
              {/* Affichage du sous-total par article, 
                  en utilisant la quantité et le prix unitaire.
                */}
              <p className="price">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))
        )}

        <div className="summary">
          <div className="line">
            <span>Subtotal</span>
            <span>{subtotal}</span>
          </div>
          <div className="line">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
          <div className="total">
            <span>Total</span>
            <span>{totalDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
