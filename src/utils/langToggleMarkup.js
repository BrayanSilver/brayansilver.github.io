/**
 * Markup do seletor de idioma — SVGs (emojis falham no Windows).
 */
export const LANG_TOGGLE_INNER = `
  <span class="lang-option" data-lang-option="pt">
    <svg class="lang-flag-icon" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="60" height="40" fill="#009b3a"/>
      <polygon fill="#fedf00" points="30,5 55,20 30,35 5,20"/>
      <circle cx="30" cy="20" r="9" fill="#002776"/>
      <path fill="#fff" d="M26 20c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" opacity=".9"/>
    </svg>
    <span class="lang-label">PT</span>
  </span>
  <span class="lang-option" data-lang-option="en">
    <svg class="lang-flag-icon" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="60" height="40" fill="#b22234"/>
      <rect y="3.08" width="60" height="3.08" fill="#fff"/>
      <rect y="9.23" width="60" height="3.08" fill="#fff"/>
      <rect y="15.38" width="60" height="3.08" fill="#fff"/>
      <rect y="21.54" width="60" height="3.08" fill="#fff"/>
      <rect y="27.69" width="60" height="3.08" fill="#fff"/>
      <rect y="33.85" width="60" height="3.08" fill="#fff"/>
      <rect width="26" height="18" fill="#3c3b6e"/>
    </svg>
    <span class="lang-label">EN</span>
  </span>
`;
