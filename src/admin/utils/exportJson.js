/**
 * @file exportJson.js — Utilitário para download de arquivos JSON
 */

/**
 * Gera download de um objeto como arquivo JSON.
 * @param {string} filename
 * @param {Object} data
 */
export function exportJSON(filename, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
