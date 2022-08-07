export const isAlphaNumeric = (text: string, ignoreSpaces: boolean) => {
  if (!text) return;
  let regex;
  if (ignoreSpaces) {
    regex = /^[\w\-\s]+$/;
  } else {
    regex = /^[a-zA-Z\d-_]+$/;
  }
  return text.match(regex);
};
  
export const isDiscordInvite = (text: string) => {
  if (!text) return;
  const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/;
  return  text.match(regex);
};