const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'stations.json');
const stations = JSON.parse(fs.readFileSync(p, 'utf8'));

const cityToDistrict = {
  'Colombo': 'Colombo',
  'Kandy': 'Kandy',
  'Galle': 'Galle',
  'Jaffna': 'Jaffna',
  'Matara': 'Matara',
  'Negombo': 'Gampaha',
  'Trincomalee': 'Trincomalee',
  'Batticaloa': 'Batticaloa',
  'Anuradhapura': 'Anuradhapura',
  'Ratnapura': 'Ratnapura',
  'Kurunegala': 'Kurunegala',
  'Hambantota': 'Hambantota',
  'Polonnaruwa': 'Polonnaruwa',
  'Kalutara': 'Kalutara',
  'Vavuniya': 'Vavuniya',
  'Badulla': 'Badulla'
};

const processed = stations.map(s => {
  return {
    ...s,
    district: cityToDistrict[s.city] || s.city
  };
});

fs.writeFileSync(p, JSON.stringify(processed, null, 2), 'utf8');
console.log('Done mapping districts.');
