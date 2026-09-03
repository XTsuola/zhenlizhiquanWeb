const MOTA_CLEARED_KEY = "motaCleared";

export function setMotaCleared() {
  sessionStorage.setItem(MOTA_CLEARED_KEY, "1");
}

export function isMotaCleared() {
  return sessionStorage.getItem(MOTA_CLEARED_KEY) === "1";
}
