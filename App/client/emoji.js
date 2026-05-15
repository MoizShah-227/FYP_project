import EmojiConvertor from 'emoji-js';

const emoji = new EmojiConvertor();
emoji.init_colons();
emoji.replace_mode = 'unified';

const allShortcodes = Object.keys(emoji.map.colons);

console.log(`Total emojis: ${allShortcodes.length}\n`);

for (const name of allShortcodes) {
  const glyph = emoji.replace_colons(`:${name}:`);
  console.log(`${name}\t${glyph}`);
}
