import { lazy, Suspense, useCallback } from 'react';
import { editor, Range } from 'monaco-editor';
import { useIsMobile } from '../hooks/useIsMobile';
import { PoetryEditor } from './PoetryEditor';
import type { EditorHandle } from '../types/editorHandle';

const MobileEditor = lazy(() => import('./MobileEditor'));

/**
 * Renders Monaco (desktop) or CodeMirror 6 (mobile) based on device detection.
 * Both paths expose an EditorHandle to the parent via onEditorMount.
 */
export function EditorSwitch(props: React.ComponentProps<typeof PoetryEditor>) {
  const isMobile = useIsMobile();

  // Wrap Monaco's raw editor instance into an EditorHandle for the parent
  const wrappedOnEditorMount = useCallback(
    (monacoEditor: editor.IStandaloneCodeEditor) => {
      if (!props.onEditorMount) return;

      const handle: EditorHandle = {
        applyFormatting: (type) => {
          const actionIds: Record<string, string> = {
            bold: 'bold-text',
            italic: 'italic-text',
            underline: 'underline-text',
          };
          const action = monacoEditor.getAction(actionIds[type]);
          if (action) action.run();
        },
        focus: () => monacoEditor.focus(),
        pasteFromClipboard: async () => {
          const textToPaste = await navigator.clipboard.readText();
          if (!textToPaste) return;
          const model = monacoEditor.getModel();
          if (!model) return;
          const selection = monacoEditor.getSelection();
          const position = monacoEditor.getPosition() || model.getPositionAt(model.getValueLength());
          const range = selection || new Range(position.lineNumber, position.column, position.lineNumber, position.column);
          monacoEditor.executeEdits('clipboard-paste', [{ range, text: textToPaste }]);
          monacoEditor.focus();
        },
        jumpToRange: (r) => {
          monacoEditor.setSelection({
            startLineNumber: r.startLineNumber,
            startColumn: r.startColumn,
            endLineNumber: r.endLineNumber,
            endColumn: r.endColumn,
          });
          monacoEditor.revealRangeInCenterIfOutsideViewport(
            new Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)
          );
          monacoEditor.focus();
        },
      };

      // Pass the handle (cast to any since PoetryEditor expects raw Monaco type)
      (props.onEditorMount as any)(handle);
    },
    [props.onEditorMount]
  );

  if (isMobile) {
    return (
      <Suspense
        fallback={
          <div style={{ padding: '24px', fontFamily: "'Libre Baskerville', serif", opacity: 0.5 }}>
            Loading editor...
          </div>
        }
      >
        <MobileEditor {...(props as any)} />
      </Suspense>
    );
  }

  return <PoetryEditor {...props} onEditorMount={wrappedOnEditorMount as any} />;
}
