import React from "react";
import { useCart } from "../../components/CartContext"; // Assurez-vous que le chemin est correct
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
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          // Mapping des articles du panier
          cartItems.map((item) => (
            <div key={item.id} className="product">
              {/* Assurez-vous que item.image est le bon chemin. 
                  Votre composant Cart ne montre pas l'image, vérifiez que 'item' 
                  contient bien cette propriété (ou utilisez une image par défaut).
                */}
              <img
                src={
                  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-content/uploads/2023/image_produit.jpg"
                }
                alt={item.name}
              />
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
