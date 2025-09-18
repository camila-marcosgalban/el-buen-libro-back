export function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => chars[Math.floor(Math.random()*chars.length)];
  return `${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}`;
}
