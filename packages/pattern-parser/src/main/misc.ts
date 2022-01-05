export function die(message?: string, offset?: number): never {
  if (offset != null) {
    throw new SyntaxError(message + ' at ' + offset);
  } else {
    throw new Error(message);
  }
}
