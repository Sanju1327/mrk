import React from 'react';
import {
  FileText,
  Presentation,
  Table2,
  Image as ImageIcon,
  FileArchive,
  Link as LinkIcon,
  Code2,
  File,
  Video,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { CourseResource, ResourceType } from '@/types/course';
import { formatFileSize, resolveMediaUrl } from '@/lib/media';

export const resourceIcon = (type: ResourceType) => {
  switch (type) {
    case 'DOCUMENT':
      return FileText;
    case 'SLIDES':
      return Presentation;
    case 'SPREADSHEET':
      return Table2;
    case 'IMAGE':
      return ImageIcon;
    case 'ARCHIVE':
      return FileArchive;
    case 'LINK':
      return LinkIcon;
    case 'CODE':
      return Code2;
    case 'VIDEO':
      return Video;
    default:
      return File;
  }
};

export const resourceLabel = (type: ResourceType) => {
  switch (type) {
    case 'DOCUMENT':
      return 'Document';
    case 'SLIDES':
      return 'Slides';
    case 'SPREADSHEET':
      return 'Spreadsheet';
    case 'IMAGE':
      return 'Image';
    case 'ARCHIVE':
      return 'Archive';
    case 'LINK':
      return 'Link';
    case 'CODE':
      return 'Source code';
    case 'VIDEO':
      return 'Video';
    default:
      return 'File';
  }
};

interface MaterialListProps {
  resources: CourseResource[];
  emptyMessage?: string;
}

/** Read-only list of lesson learning materials for students (open in new tab / download). */
export const MaterialList: React.FC<MaterialListProps> = ({ resources, emptyMessage }) => {
  if (resources.length === 0) {
    return emptyMessage ? (
      <p className="text-xs font-mono text-muted-foreground">{emptyMessage}</p>
    ) : null;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {resources.map((res) => {
        const Icon = resourceIcon(res.resourceType);
        const href = resolveMediaUrl(res.url);
        const isLink = res.resourceType === 'LINK' || /^https?:\/\//i.test(res.url);
        return (
          <li key={res.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-border text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{res.title}</div>
              <div className="truncate text-[11px] font-mono text-muted-foreground">
                {resourceLabel(res.resourceType)}
                {res.fileSize ? ` · ${formatFileSize(res.fileSize)}` : ''}
                {res.description ? ` · ${res.description}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-foreground hover:bg-surface-raised transition-colors"
                title="Open"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open</span>
              </a>
              {!isLink && (
                <a
                  href={href}
                  download={res.fileName || undefined}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-foreground hover:bg-surface-raised transition-colors"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
