function autoExpand(textarea) {
  // Reset height to ensure it expands as needed
  textarea.style.height = 'auto';
  // Set height according to scrollHeight to fit content
  textarea.style.height = (textarea.scrollHeight) + 'px';

  // Limit to 5 lines before showing scrollbars
  if (textarea.scrollHeight > parseInt(getComputedStyle(textarea).maxHeight)) {
      textarea.style.overflowY = 'scroll';
  } else {
      textarea.style.overflowY = 'hidden';
  }
}
