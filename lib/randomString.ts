export function randomString(length: number): string {
  const alphabet: string =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
  let randomString: string = "";
  for (let i = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet[randomIndex];
  }
  return randomString;
}
