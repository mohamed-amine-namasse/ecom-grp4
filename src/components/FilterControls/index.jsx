import React, { useState } from "react";
// Assurez-vous d'avoir ce fichier de style ou d'intégrer le CSS dans votre feuille de style globale
import "./style.css";

// --- OPTIONS DE DÉMONSTRATION ---
// En production, ces listes devraient être générées DYNAMIQUEMENT.
const DUMMY_OPTIONS = {
  colors: ["Noir", "Rouge", "Blanc", "Marron", "Bleu", "Vert"],
  sizes: [38, 39, 40, 41, 42, 43, 44, 45],
  gammes: ["Casual", "Sport", "Performance", "Mode"],
  marques: ["Adidas", "Nike", "Puma"],
  surfaces: ["Gazon Naturel", "Synthétique", "Intérieur", "Terre Battue"],
  materials: ["Cuir", "Synthétique", "Tissu", "Gore-Tex"],
};

// Mappage des noms de couleurs en hex ou mots-clés CSS pour les pastilles
const colorMap = {
  Noir: "#000000",
  Rouge: "#FF0000",
  Blanc: "#FFFFFF",
  Marron: "#964B00",
  Bleu: "#0000FF",
  Vert: "#008000",
};

// ⭐️ La prop maxShopPrice est ajoutée ici pour le prix dynamique ⭐️
function FilterControls({
  filters,
  onFilterChange,
  onResetFilters,
  maxShopPrice,
}) {
  // Valeur maximale du curseur : utilise la prop dynamique, sinon une valeur par défaut.
  const priceMax = maxShopPrice || DUMMY_OPTIONS.priceMax;

  // État local pour contrôler quel filtre accordéon est ouvert
  const [openFilter, setOpenFilter] = useState(null);

  // Fonction pour basculer l'ouverture/fermeture d'un filtre
  const toggleFilter = (name) => {
    setOpenFilter(openFilter === name ? null : name);
  };

  // Fonction pour gérer la réinitialisation complète (état global ET état local)
  const handleFullReset = () => {
    onResetFilters(); // Réinitialise l'état des filtres dans le parent (Shop.jsx)
    setOpenFilter(null); // Ferme tous les accordéons localement
  };

  // Gère la sélection/désélection des filtres multiples (couleur, taille, etc.)
  const handleMultiSelect = (filterName, value) => {
    const currentArray = filters[filterName];
    const stringValue = String(value);

    if (currentArray.includes(stringValue)) {
      onFilterChange(
        filterName,
        currentArray.filter((v) => v !== stringValue)
      );
    } else {
      onFilterChange(filterName, [...currentArray, stringValue]);
    }
  };

  // Gère la sélection simple (disponibilité)
  const handleSelectChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  // Gère le curseur de prix
  const handlePriceChange = (e) => {
    // Le filtre de prix est défini comme [min, max], ici le min est toujours 0
    onFilterChange("priceRange", [0, Number(e.target.value)]);
  };

  // Composant réutilisable pour l'accordéon (Section de filtre repliable)
  const FilterSection = ({ title, name, children }) => {
    const isOpen = openFilter === name;
    return (
      <div className="filter-section">
        <button
          className={`filter-header ${isOpen ? "open" : ""}`}
          onClick={() => toggleFilter(name)}
        >
          <span className="filter-title">{title}</span>
          <span className="filter-arrow">{isOpen ? "−" : "+"}</span>
        </button>
        {/* Contenu du filtre : affiché si 'isOpen' est vrai */}
        <div className={`filter-content ${isOpen ? "expanded" : ""}`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="filter-controls-container">
      <h3 className="filter-main-title">Filtres</h3>

      {/* --- BOUTON DE RÉINITIALISATION (Haut) --- */}
      <div className="d-grid mb-3">
        <button
          className="btn btn-sm btn-outline-dark"
          onClick={handleFullReset}
          type="button"
        >
          Effacer les filtres
        </button>
      </div>

      <hr className="my-3" />

      {/* 1. FILTRE PRIX */}
      <FilterSection title="Filtrer par Prix" name="price">
        <div className="p-2">
          <p className="mb-2">
            Prix Max: <span className="fw-bold">{filters.priceRange[1]} €</span>
          </p>
          <input
            type="range"
            min="0"
            // ⭐️ UTILISATION DE LA VALEUR DYNAMIQUE ⭐️
            max={priceMax}
            step="10"
            className="form-range"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
          />
        </div>
      </FilterSection>

      <hr />

      {/* 2. FILTRE TAILLE/POINTURE */}
      <FilterSection title="Taille / Pointure" name="sizes">
        <div className="d-flex flex-wrap gap-2 p-2">
          {DUMMY_OPTIONS.sizes.map((size) => {
            const isSelected = filters.size.includes(String(size));
            return (
              <button
                key={size}
                className={`btn-size ${isSelected ? "selected" : ""}`}
                onClick={() => handleMultiSelect("size", size)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <hr />

      {/* 3. FILTRE COULEUR (Utilisation de pastilles) */}
      <FilterSection title="Couleur" name="colors">
        <div className="d-flex flex-wrap gap-2 p-2 color-swatches">
          {DUMMY_OPTIONS.colors.map((color) => {
            const isSelected = filters.color.includes(color);
            return (
              <div
                key={color}
                className={`color-swatch-container ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleMultiSelect("color", color)}
                title={color}
              >
                <div
                  className="color-swatch"
                  style={{
                    backgroundColor: colorMap[color] || color.toLowerCase(),
                    border: color === "Blanc" ? "1px solid #ccc" : "none",
                  }}
                >
                  {/* Icône de coche si sélectionnée */}
                  {isSelected && <span className="check-mark">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </FilterSection>

      <hr />

      {/* 4. FILTRE DISPONIBILITÉ */}
      <FilterSection title="Disponibilité" name="disponibility">
        <div className="p-2">
          <select
            name="disponibility"
            className="form-select form-select-sm"
            value={filters.disponibility}
            onChange={handleSelectChange}
          >
            <option value="all">Tous les produits</option>
            <option value="in-stock">En Stock</option>
            <option value="out-of-stock">Hors Stock</option>
          </select>
        </div>
      </FilterSection>

      <hr />

      {/* 5. FILTRE GAMME */}
      <FilterSection title="Gamme" name="gammes">
        <div className="d-flex flex-column gap-1 p-2">
          {DUMMY_OPTIONS.gammes.map((gamme) => (
            <label key={gamme} className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={filters.gamme.includes(gamme)}
                onChange={() => handleMultiSelect("gamme", gamme)}
              />
              {gamme}
            </label>
          ))}
        </div>
      </FilterSection>

      <hr />

      {/* 6. FILTRE TYPE DE MATIÈRE */}
      <FilterSection title="Matière" name="materials">
        <div className="d-flex flex-column gap-1 p-2">
          {DUMMY_OPTIONS.materials.map((material) => (
            <label key={material} className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={filters.material.includes(material)}
                onChange={() => handleMultiSelect("material", material)}
              />
              {material}
            </label>
          ))}
        </div>
      </FilterSection>

      <hr />

      {/* 7. MARQUES */}
      <FilterSection title="Marques" name="marques">
        <div className="p-2">
          <select
            name="marque"
            className="form-select form-select-sm"
            value={(filters.marque || []).length > 0 ? filters.marque[0] : ""}
            onChange={(e) =>
              onFilterChange("marque", e.target.value ? [e.target.value] : [])
            }
          >
            <option value="">Toutes les marques</option>
            {DUMMY_OPTIONS.marques.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </FilterSection>

      <hr />

      {/* 8. SURFACE */}
      <FilterSection title="Surface (Crampons)" name="surfaces">
        <div className="d-flex flex-wrap gap-2 p-2">
          {DUMMY_OPTIONS.surfaces.map((surface) => {
            const isSelected = filters.surface.includes(surface);
            return (
              <button
                key={surface}
                className={`btn-size ${isSelected ? "selected" : ""}`}
                onClick={() => handleMultiSelect("surface", surface)}
              >
                {surface}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}

export default FilterControls;
