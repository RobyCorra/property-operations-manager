// Policy password condivisa (Lotto A — sicurezza accessi).
// Usata da createUser, updateUser e registrazione.

const MIN_LENGTH = 10;

// Piccola blacklist di password troppo comuni (lowercase).
const COMMON_PASSWORDS = new Set([
  "password", "password1", "passw0rd", "123456", "1234567", "12345678",
  "123456789", "1234567890", "qwerty", "qwertyui", "abc123", "111111",
  "000000", "iloveyou", "admin", "welcome", "letmein", "monkey",
  "dragon", "football", "baseball", "superman", "trustno1",
]);

/**
 * Restituisce un messaggio d'errore se la password non rispetta la policy,
 * oppure null se è valida.
 */
export function validatePassword(pw: string): string | null {
  if (!pw || pw.length < MIN_LENGTH) {
    return `La password deve avere almeno ${MIN_LENGTH} caratteri.`;
  }
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
    return "Password troppo comune: scegline una più robusta.";
  }
  return null;
}
