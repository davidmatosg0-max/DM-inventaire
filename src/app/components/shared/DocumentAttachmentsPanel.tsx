import React from 'react';

export interface DocumentAttachmentItem {
  id: string;
  leading?: React.ReactNode;
  content: React.ReactNode;
  meta?: React.ReactNode;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

interface DocumentAttachmentsPanelProps {
  title: React.ReactNode;
  titleIcon?: React.ReactNode;
  count?: number;
  countStyle?: React.CSSProperties;
  headerActions?: React.ReactNode;
  summary: React.ReactNode;
  primaryAction?: React.ReactNode;
  items: DocumentAttachmentItem[];
  emptyMessage: React.ReactNode;
  footerHint?: React.ReactNode;
}

export function DocumentAttachmentsPanel({
  title,
  titleIcon,
  count,
  countStyle,
  headerActions,
  summary,
  primaryAction,
  items,
  emptyMessage,
  footerHint,
}: DocumentAttachmentsPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-[#666666]">
          {titleIcon}
          {title}
          {typeof count === 'number' && count > 0 ? (
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={countStyle}
            >
              {count}
            </span>
          ) : null}
        </h4>
        {headerActions}
      </div>

      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#5d7185]">{summary}</p>
          {primaryAction}
        </div>

        <div className="mt-3 space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#dbe6f0] bg-[#f8fbff] p-3"
                style={item.containerStyle}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {item.leading ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#5d7185]">
                        {item.leading}
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">{item.content}</div>
                      {item.meta ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#5d7185]">
                          {item.meta}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {item.actions ? <div className="flex flex-wrap gap-2">{item.actions}</div> : null}
                </div>
                {item.note ? <div className="mt-2 text-xs text-[#5d7185]">{item.note}</div> : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dbe6f0] bg-[#fbfdff] p-4 text-sm text-[#5d7185]">
              {emptyMessage}
            </div>
          )}

          {footerHint ? (
            <div className="rounded-2xl border border-dashed border-[#dbe6f0] bg-[#fbfdff] p-4 text-center text-xs text-[#5d7185]">
              {footerHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}