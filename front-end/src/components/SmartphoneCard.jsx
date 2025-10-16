import React from 'react';
import PropTypes from 'prop-types';

const SmartphoneCard = ({ smartphone, onEdit, onDelete }) => {
  const prixReel = smartphone.prixPromotionnel || smartphone.prix || 0;
  const enPromotion = Boolean(smartphone.enPromotion) && (smartphone.promotionPourcentage || 0) > 0;

  return (
    <div className="smartphone-card">
      <div className="smartphone-image-container">
        <img
          src={smartphone.image || '/placeholder-phone.png'}
          alt={`${smartphone.marque || 'Marque'} ${smartphone.modele || ''}`}
          className="smartphone-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/cccccc/969696?text=📱+Image+Non+Disponible';
          }}
        />
        {enPromotion && (
          <div className="promotion-badge">
            -{smartphone.promotionPourcentage}%
          </div>
        )}
        <div className="stock-badge">
          {typeof smartphone.stock === 'number' && smartphone.stock > 0
            ? `${smartphone.stock} en stock`
            : 'Rupture'}
        </div>
      </div>

      <div className="smartphone-header">
        <div className="smartphone-title">
          <h3>{smartphone.marque} {smartphone.modele}</h3>
          <p>{smartphone.couleur} • {smartphone.os}</p>
        </div>
        <div className="smartphone-price">
          {enPromotion ? (
            <>
              <span className="price-promotional">{prixReel.toFixed(0)} Fcfa</span>
              <span className="price-original">{smartphone.prix} Fcfa</span>
            </>
          ) : (
            <span className="price-normal">{smartphone.prix} Fcfa</span>
          )}
        </div>
      </div>

      <div className="smartphone-specs">
        <div className="spec-item">
          <span className="spec-label">📱 Écran:</span>
          <span className="spec-value">{smartphone.ecran?.taille}" {smartphone.ecran?.type}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">💾 Mémoire:</span>
          <span className="spec-value">{smartphone.ram}GB RAM / {smartphone.stockage}GB</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">📸 Caméra:</span>
          <span className="spec-value">{smartphone.camera?.principale}MP + {smartphone.camera?.frontale}MP</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">🔋 Batterie:</span>
          <span className="spec-value">{smartphone.batterie}mAh</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">⚡ Processeur:</span>
          <span className="spec-value">{smartphone.processeur}</span>
        </div>
      </div>

      <div className="smartphone-actions">
        <button className="btn btn-edit" onClick={() => onEdit(smartphone)}>
          ✏️ Modifier
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(smartphone._id)}>
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
};

// ✅ Validation des props
SmartphoneCard.propTypes = {
  smartphone: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    marque: PropTypes.string,
    modele: PropTypes.string,
    couleur: PropTypes.string,
    os: PropTypes.string,
    prix: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    prixPromotionnel: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    enPromotion: PropTypes.bool,
    promotionPourcentage: PropTypes.number,
    image: PropTypes.string,
    stock: PropTypes.number,
    ram: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stockage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    batterie: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    processeur: PropTypes.string,
    ecran: PropTypes.shape({
      taille: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      type: PropTypes.string,
    }),
    camera: PropTypes.shape({
      principale: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      frontale: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ✅ Default props (facultatif mais défensif)
SmartphoneCard.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default SmartphoneCard;
