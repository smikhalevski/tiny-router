const reChar = /[\\^$.*+?()[\]{}|]/g;
const reTestChar = RegExp(reChar.source);

export function escapeRegExp(str: string): string {
  return reTestChar.test(str) ? str.replace(reChar, '\\$&') : str;
}
