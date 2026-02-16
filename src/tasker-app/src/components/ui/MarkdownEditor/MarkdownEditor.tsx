import React, { useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlassTextarea } from '../GlassTextarea';
import { IconToolbarButton } from '../modal-buttons/IconToolbarButton';
import { BoldIcon } from '../../icons/BoldIcon';
import { ItalicIcon } from '../../icons/ItalicIcon';
import { StrikethroughIcon } from '../../icons/StrikethroughIcon';
import { HeadingIcon } from '../../icons/HeadingIcon';
import { ListIcon } from '../../icons/ListIcon';
import { OrderedListIcon } from '../../icons/OrderedListIcon';
import { CodeIcon } from '../../icons/CodeIcon';
import { QuoteIcon } from '../../icons/QuoteIcon';
import { LinkIcon } from '../../icons/LinkIcon';
import { EyeIcon } from '../../icons/EyeIcon';
import { EditIcon } from '../../icons/EditIcon';
import css from './MarkdownEditor.module.css';
import viewerCss from '../MarkdownViewer/MarkdownViewer.module.css';

export interface MarkdownEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  maxLength?: number;
}

type MarkdownAction = {
  prefix: string;
  suffix: string;
  defaultText: string;
  blockLevel?: boolean;
};

const actions: Record<string, MarkdownAction> = {
  bold: { prefix: '**', suffix: '**', defaultText: 'жирный текст' },
  italic: { prefix: '*', suffix: '*', defaultText: 'курсив' },
  strikethrough: { prefix: '~~', suffix: '~~', defaultText: 'зачёркнутый' },
  h1: { prefix: '# ', suffix: '', defaultText: 'Заголовок 1', blockLevel: true },
  h2: { prefix: '## ', suffix: '', defaultText: 'Заголовок 2', blockLevel: true },
  h3: { prefix: '### ', suffix: '', defaultText: 'Заголовок 3', blockLevel: true },
  ul: { prefix: '- ', suffix: '', defaultText: 'элемент списка', blockLevel: true },
  ol: { prefix: '1. ', suffix: '', defaultText: 'элемент списка', blockLevel: true },
  code: { prefix: '`', suffix: '`', defaultText: 'код' },
  quote: { prefix: '> ', suffix: '', defaultText: 'цитата', blockLevel: true },
  link: { prefix: '[', suffix: '](url)', defaultText: 'текст ссылки' },
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  rows = 6,
  disabled = false,
  fullWidth = true,
  maxLength,
}) => {
  const val = value ?? '';
  const isOverLimit = maxLength != null && val.length > maxLength;
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyAction = useCallback(
    (actionKey: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const action = actions[actionKey];
      if (!action) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = val.substring(start, end);
      const insertText = selected || action.defaultText;

      let before = val.substring(0, start);
      const after = val.substring(end);

      if (action.blockLevel && start > 0 && before[before.length - 1] !== '\n') {
        before += '\n';
      }

      const inserted = action.prefix + insertText + action.suffix;
      const newValue = before + inserted + after;
      onChange(newValue);

      requestAnimationFrame(() => {
        ta.focus();
        const cursorStart = before.length + action.prefix.length;
        const cursorEnd = cursorStart + insertText.length;
        ta.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [val, onChange],
  );

  const handleHeadingCycle = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = val.indexOf('\n', start);
    const line = val.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);

    let newLine: string;
    if (line.startsWith('### ')) {
      newLine = line.substring(4);
    } else if (line.startsWith('## ')) {
      newLine = '### ' + line.substring(3);
    } else if (line.startsWith('# ')) {
      newLine = '## ' + line.substring(2);
    } else {
      newLine = '# ' + line;
    }

    const before = val.substring(0, lineStart);
    const after = val.substring(lineEnd === -1 ? val.length : lineEnd);
    onChange(before + newLine + after);
  }, [val, onChange]);

  const btn = (action: string, icon: React.ReactNode, tooltip: string, onClick?: () => void) => (
    <IconToolbarButton
      key={action}
      icon={icon}
      tooltip={tooltip}
      variant="subtle"
      size="xxs"
      onClick={onClick ?? (() => applyAction(action))}
      disabled={disabled || showPreview}
    />
  );

  return (
    <div className={css.container}>
      <div className={css.toolbar}>
        {btn('bold', <BoldIcon />, 'Жирный')}
        {btn('italic', <ItalicIcon />, 'Курсив')}
        {btn('strikethrough', <StrikethroughIcon />, 'Зачёркнутый')}
        <span className={css.divider} />
        {btn('heading', <HeadingIcon />, 'Заголовок (цикл H1→H2→H3)', handleHeadingCycle)}
        <span className={css.divider} />
        {btn('ul', <ListIcon />, 'Список')}
        {btn('ol', <OrderedListIcon />, 'Нумерованный список')}
        {btn('quote', <QuoteIcon />, 'Цитата')}
        <span className={css.divider} />
        {btn('code', <CodeIcon />, 'Код')}
        {btn('link', <LinkIcon />, 'Ссылка')}
        <span className={css.spacer} />
        <IconToolbarButton
          icon={showPreview ? <EditIcon /> : <EyeIcon />}
          tooltip={showPreview ? 'Редактирование' : 'Превью'}
          variant={showPreview ? 'primary' : 'subtle'}
          size="xxs"
          onClick={() => setShowPreview((p) => !p)}
          disabled={disabled}
        />
      </div>
      {showPreview ? (
        <div className={`${css.preview} ${viewerCss.markdown}`}>
          {val ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{val}</ReactMarkdown>
          ) : (
            <span style={{ opacity: 0.4 }}>{placeholder || 'Нет содержимого'}</span>
          )}
        </div>
      ) : (
        <div className={css.textareaWrapper}>
          <GlassTextarea
            ref={textareaRef}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            fullWidth={fullWidth}
          />
        </div>
      )}
      {maxLength != null && (
        <div className={`${css.charCounter} ${isOverLimit ? css.charCounterOver : ''}`}>
          {val.length} / {maxLength}
        </div>
      )}
    </div>
  );
};
