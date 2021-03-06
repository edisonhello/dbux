
const errors = [];

export function logInternalError(...args) {
  const err = ['[DBUX instrumentation failure]', ...args];
  errors.push(err);
  console.error(...err);
}

export function logInternalWarning(...args) {
  const err = ['[DBUX instrumentation warning]', ...args];
  errors.push(err);
  console.warn(...err);
}

export function getErrors() {
  return errors;
}

export function getErrorCount() {
  return errors.length;
}

export function hasErrors() {
  return !!errors.length;
}

export function getLastError() {
  return errors[errors.length - 1];
}