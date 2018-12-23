export const oneliner = (
  strings: TemplateStringsArray,
  ...values: any[]
) => {
  let output = '';
  for (let i = 0; i < values.length; i++) {
    output += strings[i] + values[i];
  }
  output += strings[values.length];
  const lines = output.split(/(?:\r\n|\n|\r)/);
  return lines.map((line) => {
    return line.replace(/^\s+/gm, '');
  }).join('').trim();
}
