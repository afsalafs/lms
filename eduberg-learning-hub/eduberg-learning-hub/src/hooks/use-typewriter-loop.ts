import { useEffect, useState } from "react";

interface UseTypewriterLoopOptions {
  typingSpeedMs?: number;   // delay between each typed character
  deletingSpeedMs?: number; // delay between each deleted character
  pauseMs?: number;         // how long to hold the fully-typed word before erasing
  loop?: boolean;           // after the last word, cycle back to the first?
}

export function useTypewriterLoop(
  words: string[],
  {
    typingSpeedMs = 70,
    deletingSpeedMs = 40,
    pauseMs = 1000,
    loop = true,
  }: UseTypewriterLoopOptions = {},
) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const isLastWord = wordIndex === words.length - 1;

    // Fully typed -> wait, then start deleting (unless it's the last word and we're not looping)
    if (!deleting && text === currentWord) {
      if (isLastWord && !loop) return; // stop here, leave the last word on screen
      const id = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(id);
    }

    // Fully deleted -> move on to the next word
    if (deleting && text === "") {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
      return;
    }

    // Otherwise, type or delete one character
    const id = setTimeout(
      () => {
        setText((t) =>
          deleting ? currentWord.slice(0, t.length - 1) : currentWord.slice(0, t.length + 1),
        );
      },
      deleting ? deletingSpeedMs : typingSpeedMs,
    );
    return () => clearTimeout(id);
  }, [text, deleting, wordIndex, words, typingSpeedMs, deletingSpeedMs, pauseMs, loop]);

  return text;
}