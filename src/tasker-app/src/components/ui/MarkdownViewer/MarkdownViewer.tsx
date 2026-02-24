import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconToolbarButton } from '../modal-buttons/IconToolbarButton';
import { CodeViewIcon } from '../../icons/CodeViewIcon';
import { EyeIcon } from '../../icons/EyeIcon';
import css from './MarkdownViewer.module.css';

export interface MarkdownViewerProps {
  value?: string | null;
  emptyText?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = React.memo(({
  value,
  emptyText = '—',
}) => {
  const [showSource, setShowSource] = useState(false);
  const hasContent = Boolean(value?.trim());

  return (
    <div className={css.container}>
      <div className={css.content}>
        {!hasContent ? (
          <span className={css.empty}>{emptyText}</span>
        ) : showSource ? (
          <div className={css.source}>{value}</div>
        ) : (
          <div className={css.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value!}</ReactMarkdown>
          </div>
        )}
      </div>
      {hasContent && (
        <div className={css.sourceToggle}>
          <IconToolbarButton
            icon={showSource ? <EyeIcon /> : <CodeViewIcon />}
            tooltip={showSource ? 'Превью' : 'Исходник'}
            variant="subtle"
            size="xxs"
            onClick={() => setShowSource((p) => !p)}
          />
        </div>
      )}
    </div>
  );
});
