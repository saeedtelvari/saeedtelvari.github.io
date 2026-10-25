// StoryChapters.jsx — placeholder art for the six chapters of the story.
// Each placeholder fills the sky colour and writes the chapter title and the value of local in plain text.
// The final art replaces one entry at a time. The renderer API is at the top of StoryStage.jsx.

const storyPlaceholder = title => ({
  animated: false,
  draw(ctx, frame) {
    const size = Math.max(18, Math.min(frame.width, frame.height) * 0.06);
    const font = 'Literata, Georgia, serif';
    ctx.fillStyle = STORY_COLORS.sky;
    ctx.fillRect(0, 0, frame.width, frame.height);
    ctx.fillStyle = STORY_COLORS.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${size}px ${font}`;
    ctx.fillText(title, frame.width / 2, frame.height / 2 - size);
    ctx.font = `italic 400 ${size * 0.6}px ${font}`;
    ctx.fillText(`placeholder art, local ${frame.local.toFixed(2)}`, frame.width / 2, frame.height / 2 + size * 0.3);
  },
});

STORY_CHAPTERS.forEach(chapter => { STORY_RENDERERS[chapter.id] = storyPlaceholder(chapter.title); });
