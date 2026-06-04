export const RFC_PATTERN = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/;

export function normalizeIdentifier(value: unknown) {
  return String(value || "").trim().toUpperCase();
}

export function isValidRfc(value: unknown) {
  return RFC_PATTERN.test(normalizeIdentifier(value));
}

export function hasRnt(value: unknown) {
  return normalizeIdentifier(value).length > 0;
}
