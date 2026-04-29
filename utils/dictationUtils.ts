/**
 * Transforme un texte pour que la ponctuation soit dictée à voix haute.
 * Ex: "Le chat mange." → "Le chat mange point"
 * Ex: "Où vas-tu ?" → "Où vas-tu point d'interrogation"
 */
export function addSpokenPunctuation(text: string): string {
  return text
    .replace(/\.\.\./g, ' points de suspension')
    .replace(/\./g, ' point')
    .replace(/,/g, ' virgule')
    .replace(/;/g, ' point-virgule')
    .replace(/:/g, ' deux-points')
    .replace(/\?/g, ' point d\'interrogation')
    .replace(/!/g, ' point d\'exclamation')
    .replace(/«\s?/g, ' ouvrez les guillemets ')
    .replace(/\s?»/g, ' fermez les guillemets ')
    .replace(/"/g, ' guillemet ')
    .replace(/'/g, ' apostrophe ')
    .replace(/\(/g, ' ouvrez la parenthèse ')
    .replace(/\)/g, ' fermez la parenthèse ')
    .replace(/-/g, ' tiret ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
