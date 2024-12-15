// Markdown to HTML conversion utility
export const markdownToHtml = (markdown) => {
  // First process headings and lists
  let html = markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '<br><br>')
    .trim();

  // Wrap consecutive li elements in ul tags
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');

  return html;
};
