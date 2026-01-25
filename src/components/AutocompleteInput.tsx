import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import './AutocompleteInput.css';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  autoFocus,
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { suggestions } = useAutocomplete(value);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Show suggestions when there are matches and input has value
  useEffect(() => {
    if (suggestions.length > 0 && value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, value]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      selectedItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex];
          onChange(selected);
          setShowSuggestions(false);
          if (onSubmit) onSubmit(selected);
        } else if (onSubmit) {
          onSubmit(value);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = suggestions[selectedIndex];
          onChange(selected);
          setShowSuggestions(false);
        }
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
    if (onSubmit) onSubmit(suggestion);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && value.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion to register
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul ref={listRef} className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="autocomplete-match">
                {suggestion.slice(0, value.trim().length)}
              </span>
              <span className="autocomplete-rest">
                {suggestion.slice(value.trim().length)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
