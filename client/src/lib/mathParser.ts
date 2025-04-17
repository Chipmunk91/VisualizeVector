import * as math from 'mathjs';

/**
 * Evaluates a mathematical expression and returns the numeric result
 * Supports expressions like:
 * - Basic arithmetic: 1+2, 3*4
 * - Negative numbers: -5
 * - Fractions: 1/7
 * - Exponents: 2^(1/3)
 * - Constants: pi, e
 * - Functions: sin(x), cos(x), etc.
 * 
 * @param expression The mathematical expression to evaluate
 * @returns The numeric result of the expression, or 0 if invalid
 */
export function evaluateExpression(expression: string): number {
  if (!expression || expression.trim() === '') {
    return 0;
  }
  
  try {
    // Replace ^ with ** for exponentiation (mathjs uses **)
    const processedExpression = expression.replace(/\^/g, '**');
    
    // Evaluate the expression
    const result = math.evaluate(processedExpression);
    
    // Convert to number if it's not already
    return typeof result === 'number' ? result : Number(result);
  } catch (error) {
    console.log(`Error evaluating expression "${expression}":`, error);
    
    // Try to extract just the numeric part from the expression
    const numericMatch = expression.match(/-?\d+(\.\d+)?/);
    if (numericMatch) {
      return parseFloat(numericMatch[0]);
    }
    
    return 0;
  }
}