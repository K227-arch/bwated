import { useState, useEffect } from 'react';

const TypewriterText = ({ text, isLive = false }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    if (isLive) {
      // For live transcription, immediately show the full text
      setDisplayText(text);
      setCurrentIndex(text.length);
    } else {
      // For normal messages, use typewriter effect
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 30);

        return () => clearTimeout(timeout);
      }
    }
  }, [text, currentIndex, isLive]);

  return (
    <div className="typewriter">
      {displayText}
      {isLive && <span className="animate-pulse">|</span>}
    </div>
  );
};

export default TypewriterText;