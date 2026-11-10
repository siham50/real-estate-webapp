import React from 'react';
import PropertyForm from './PropertyForm';

const PropertyFormModal = (props) => {
  return <PropertyForm {...props} isModal={true} />;
};

export default PropertyFormModal;
