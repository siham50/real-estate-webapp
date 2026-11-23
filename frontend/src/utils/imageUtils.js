/**
 * Utilitaires pour la résolution des URLs d'images.
 */

// Placeholder SVG gris neutre pour les annonces sans photos
export const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20400%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Cg%20transform%3D%22translate(268%2C%20140)%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%228%22%20fill%3D%22%23cbd5e1%22%2F%3E%3Ccircle%20cx%3D%2222%22%20cy%3D%2222%22%20r%3D%226%22%20fill%3D%22%2394a3b8%22%2F%3E%3Cpath%20d%3D%22M56%2046L42%2032%2014%2056%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22240%22%20fill%3D%22%2364748b%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2215%22%20font-weight%3D%22500%22%20text-anchor%3D%22middle%22%3EAucune%20photo%20disponible%3C%2Ftext%3E%3C%2Fsvg%3E';

/**
 * Construit l'URL complète de l'image :
 * Si le chemin commence par /uploads ou uploads/, retourne http://localhost:8080${path}.
 * Sinon, retourne le chemin tel quel ou normalisé.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  let str = String(path).trim().replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim();
  if (!str) return '';

  if (str.includes('localhost:5173') || str.includes('localhost:3000')) {
    str = str.replace(/http:\/\/localhost:(5173|3000)/, 'http://localhost:8080');
  }

  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str;
  }

  if (str.startsWith('/uploads') || str.startsWith('/api/')) {
    return `http://localhost:8080${str}`;
  }

  if (str.startsWith('uploads/')) {
    return `http://localhost:8080/${str}`;
  }

  // Nom de fichier nu (ex: uuid.png)
  return `http://localhost:8080/uploads/${str.startsWith('/') ? str.substring(1) : str}`;
};

export default getImageUrl;

