/**
 * Safe and simple formula evaluator for Dynamic Quality Checklists.
 * Strictly supports ONLY:
 * - Operators: + and *
 * - Variables: guests, bathrooms, bedrooms
 * - Numbers (integers)
 * 
 * Logic follows basic precedence: * then +
 */
export function evaluateChecklistFormula(
  formula: string | null | undefined,
  context: { guests: number; bathrooms: number; bedrooms: number } | null
): number | null {
  if (!formula || !context) return null;

  try {
    // 1. Tokenization & Sanitization
    // Strip everything inside parentheses (comments) and illegal characters
    let sanitized = formula.toLowerCase()
      .replace(/\([^)]*\)/g, "") // Remove (comments)
      .replace(/\babc\b/g, "") // Placeholder if needed
      .replace(/\bguests\b/g, context.guests.toString())
      .replace(/\bbathrooms\b/g, context.bathrooms.toString())
      .replace(/\bbedrooms\b/g, context.bedrooms.toString())
      .replace(/[^0-9+*]/g, ""); // Keep ONLY numbers and + *

    // 2. Manual Evaluation (No eval/Function)
    // Order of operations: Multiply first, then Sum
    // Split by '+' (additions)
    const additions = sanitized.split('+');
    
    const result = additions.reduce((acc, part) => {
      // Split each part by '*' (multiplications)
      const products = part.split('*').map(Number);
      const subtotal = products.reduce((p, val) => p * val, 1);
      return acc + subtotal;
    }, 0);

    return Math.max(0, Math.round(result));
  } catch (error) {
    console.error("Safe formula evaluation error:", error, formula);
    return null;
  }
}
