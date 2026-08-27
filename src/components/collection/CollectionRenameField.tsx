import { useRef } from 'react';

interface CollectionRenameFieldProps {
  value: string;
  className?: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function CollectionRenameField({
  value,
  className,
  onChange,
  onCommit,
  onCancel,
}: CollectionRenameFieldProps) {
  const cancelledRef = useRef(false);

  return (
    <input
      type="text"
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => {
        if (cancelledRef.current) {
          cancelledRef.current = false;
          return;
        }
        onCommit();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          cancelledRef.current = true;
          onCancel();
        }
      }}
      autoFocus
      aria-label="Collection name"
    />
  );
}
