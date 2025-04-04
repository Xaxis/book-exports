const Formatter = (() => {
  function toMarkdown(title, content) {
    // Optional: detect bold/italic/etc. in the future
    return `# ${title.replace(/_/g, ' ')}\n\n${content}`;
  }

  return {
    toMarkdown,
  };
})();