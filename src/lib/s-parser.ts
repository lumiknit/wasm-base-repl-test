/**
 * S-Expr Parser
 *
 * It takes only simple s-exprs and returns a JSON object.
 * - comment: ';' to the end of the line, ignore the rest of the line
 * - number: just converted to a js number
 * - string: convert to a string with prefix '"'
 * - identifier: convert to a string without prefix
 * - list: convert to an array
 *
 * Example:
 * (lambda (x) (concat "Hello" x)) => ["lambda", ["x"], ["concat", '"Hello', "x"]]
 */

export type Expr = number | string | Expr[];

type Token = {
  span: {
    start: number;
    end: number;
    line: number;
    col: number;
  };
  v: string;
};

class ParseError extends Error {
  token: Token;
  rawMessage: string;

  constructor(token: Token, message: string) {
    const msg = `Error at line ${token.span.line}, col ${token.span.col}: ${message}`;
    super(msg);
    this.name = "ParseError";
    this.token = token;
    this.rawMessage = message;
  }
}

const tokenize = (input: string): Token[] => {
  let line = 1,
    col = 1;
  let start = 0;
  let tokens: Token[] = [];

  while (start < input.length) {
    const c = input[start];
    if (c === ";") {
      // Comment
      start = input.indexOf("\n", start);
      if (start === -1) start = input.length;
    } else if (c === "(" || c === "[" || c === "{") {
      // Parentheses
      tokens.push({ span: { start, end: start + 1, line, col }, v: "(" });
      start++;
      col++;
    } else if (c === ")" || c === "]" || c === "}") {
      // Parentheses
      tokens.push({ span: { start, end: start + 1, line, col }, v: ")" });
      start++;
      col++;
    } else if (c === '"') {
      // String
      let end = start + 1;
      while (end < input.length && input[end] !== '"') {
        if (input[end] === "\\") end++;
        end++;
      }
      end++;
      tokens.push({
        span: { start, end, line, col },
        v: input.slice(start, end),
      });
      start = end;
      col += end - start;
    } else if (input.charCodeAt(start) <= 32) {
      // Gather whitespaces
      while (start < input.length && input.charCodeAt(start) <= 32) {
        if (input[start] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        start++;
      }
    } else {
      // Gather other characters
      const re = /[^\[\](){}\s";]+/g;
      re.lastIndex = start;
      const match = re.exec(input);
      if (match) {
        const end = match.index + match[0].length;
        tokens.push({
          span: { start, end, line, col },
          v: input.slice(start, end),
        });
        start = end;
        col += end - start;
      } else {
        start++;
        col++;
      }
    }
  }
  return tokens;
};

const packExpr = (stacks: Expr[][]) => {
  const top = stacks.pop();
  if (top === undefined) return false;
  const parent = stacks[stacks.length - 1];
  parent.push(top);
  return true;
};

// Parse the tokens into expression.
// Return is a tuple of the parsed expression and the next token index.s
const parse = (tokens: Token[]): Expr[] => {
  let stacks: Expr[][] = [[]];

  let i = 0;
  for (; i < tokens.length; i++) {
    const v = tokens[i].v;
    if (v === "(") {
      stacks.push([]);
    } else if (v === ")") {
      if (!packExpr(stacks)) {
        throw new ParseError(tokens[i], "Unexpected ')'");
      }
    } else if (v[0] === '"') {
      stacks[stacks.length - 1].push('"' + JSON.parse(v));
    } else {
      const n = Number(v);
      stacks[stacks.length - 1].push(isNaN(n) ? v : n);
    }
  }

  while (stacks.length > 1) {
    packExpr(stacks);
  }
  return stacks[0];
};

export const parseSExpr = (input: string): Expr[] => {
  const tokens = tokenize(input);
  const expr = parse(tokens);
  return expr;
};

export const exprToString = (expr: Expr): string => {
  if (typeof expr === "number") {
    return expr.toString();
  } else if (typeof expr === "string") {
    if (expr[0] === '"') {
      return JSON.stringify(expr.slice(1));
    } else {
      return expr;
    }
  } else {
    return `(${expr.map(exprToString).join(" ")})`;
  }
};

export const exprToSExpr = (exprs: Expr[]): string =>
  exprs.map(exprToString).join("\n");
