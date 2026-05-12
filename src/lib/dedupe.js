export function destinationKey(city) {
  return [city?.name, city?.state, city?.country]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
    .join("|");
}

export function uniqueDestinations(cities = []) {
  const seen = new Set();
  return cities.filter((city) => {
    const key = destinationKey(city);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
