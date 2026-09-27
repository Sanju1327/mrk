import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  Code,
  ExternalLink,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import { extractYouTubeId, youTubeEmbedUrl } from '@/lib/media';
import type { ContentBlock, ContentBlockType } from '@/types/course';
import type { CreateBlockPayload } from '@/types/teacher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Notify } from './types';

interface ContentBlocksEditorProps {
  lessonId: number;
  notify: Notify;
}

/**
 * Additional rich content for a lesson (text, embedded YouTube, code, doc links, concept checks).
 * This is the pre-existing block builder, now living below the lesson video and materials.
 */
export const ContentBlocksEditor: React.FC<ContentBlocksEditorProps> = ({ lessonId, notify }) => {
  const queryClient = useQueryClient();
  const [blockTypeToAdd, setBlockTypeToAdd] = useState<ContentBlockType | null>(null);
  const [blockForm, setBlockForm] = useState<CreateBlockPayload>({ type: 'TEXT', title: '', content: '', dataJson: '' });

  const [videoUrl, setVideoUrl] = useState('');
  const [videoAttribution, setVideoAttribution] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docProvider, setDocProvider] = useState('Official Docs');
  const [codeLang, setCodeLang] = useState('javascript');
  const [questionText, setQuestionText] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [questionExplanation, setQuestionExplanation] = useState('');

  const queryKey = ['teacher-lesson-blocks', lessonId];

  const { data: blocks = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => teacherApi.getLessonBlocks(lessonId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createBlockMutation = useMutation({
    mutationFn: (data: CreateBlockPayload) => teacherApi.createBlock(lessonId, data),
    onSuccess: () => {
      invalidate();
      setBlockTypeToAdd(null);
      resetForms();
      notify('success', 'Content block added');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to add content block'),
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) => teacherApi.deleteBlock(blockId),
    onSuccess: () => {
      invalidate();
      notify('success', 'Content block removed');
    },
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to remove block'),
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: (ids: number[]) => teacherApi.reorderBlocks(lessonId, ids),
    onSuccess: () => invalidate(),
    onError: (err: any) => notify('error', err.response?.data?.message || 'Failed to reorder blocks'),
  });

  const resetForms = () => {
    setBlockForm({ type: 'TEXT', title: '', content: '', dataJson: '' });
    setVideoUrl('');
    setVideoAttribution('');
    setDocUrl('');
    setDocProvider('Official Docs');
    setCodeLang('javascript');
    setQuestionText('');
    setQuestionOptions(['', '', '', '']);
    setCorrectOptionIdx(0);
    setQuestionExplanation('');
  };

  const pick = (type: ContentBlockType) => {
    resetForms();
    setBlockTypeToAdd(type);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    reorderBlocksMutation.mutate(next.map((b) => b.id));
  };

  const save = () => {
    if (!blockTypeToAdd) return;
    if (blockTypeToAdd === 'VIDEO') {
      const vidId = extractYouTubeId(videoUrl);
      if (!vidId) return notify('error', 'Please enter a valid YouTube URL or video id');
      createBlockMutation.mutate({
        type: 'VIDEO',
        title: blockForm.title.trim() || 'Video Lecture',
        content: blockForm.content.trim(),
        dataJson: JSON.stringify({
          videoId: vidId,
          provider: 'YouTube',
          attribution: videoAttribution.trim() || 'Educational Creator',
          url: `https://www.youtube.com/watch?v=${vidId}`,
        }),
      });
    } else if (blockTypeToAdd === 'LINK') {
      if (!docUrl.trim()) return notify('error', 'Please enter a target URL');
      createBlockMutation.mutate({
        type: 'LINK',
        title: blockForm.title.trim() || 'Reference',
        content: blockForm.content.trim(),
        dataJson: JSON.stringify({ url: docUrl.trim(), provider: docProvider.trim() || 'Official Docs' }),
      });
    } else if (blockTypeToAdd === 'CODE') {
      if (!blockForm.content.trim()) return notify('error', 'Code content is required');
      createBlockMutation.mutate({
        type: 'CODE',
        title: blockForm.title.trim() || 'Code Example',
        content: blockForm.content.trim(),
        dataJson: JSON.stringify({ language: codeLang }),
      });
    } else if (blockTypeToAdd === 'QUESTION') {
      if (!questionText.trim()) return notify('error', 'Question text is required');
      const filtered = questionOptions.filter((o) => o.trim().length > 0);
      if (filtered.length < 2) return notify('error', 'At least 2 options are required');
      if (!questionOptions[correctOptionIdx]?.trim()) return notify('error', 'The correct answer cannot be empty');
      const correctIndex = filtered.indexOf(questionOptions[correctOptionIdx]);
      createBlockMutation.mutate({
        type: 'QUESTION',
        title: blockForm.title.trim() || 'Concept Check',
        content: questionText.trim(),
        dataJson: JSON.stringify({ options: filtered, correctIndex, explanation: questionExplanation.trim() }),
      });
    } else {
      if (!blockForm.content.trim()) return notify('error', 'Text content is required');
      createBlockMutation.mutate({ type: 'TEXT', title: blockForm.title.trim() || 'Lesson Notes', content: blockForm.content.trim() });
    }
  };

  const typeButton = (type: ContentBlockType, label: string, Icon: React.ElementType, color: string) => (
    <Button
      size="sm"
      variant="outline"
      onClick={() => pick(type)}
      className={`h-9 text-xs gap-1.5 font-mono ${blockTypeToAdd === type ? 'border-primary text-primary bg-primary/10' : ''}`}
    >
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
          + Add content component
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {typeButton('TEXT', 'Rich Text', FileText, 'text-blue-400')}
          {typeButton('VIDEO', 'YouTube Embed', Video, 'text-rose-400')}
          {typeButton('CODE', 'Code Snippet', Code, 'text-emerald-400')}
          {typeButton('LINK', 'Reference Link', LinkIcon, 'text-cyan-400')}
          {typeButton('QUESTION', 'Concept Check', HelpCircle, 'text-amber-400')}
        </div>
      </div>

      {blockTypeToAdd && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-950/10 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 font-mono text-xs">
            <span className="font-semibold text-purple-300">Configure new {blockTypeToAdd} block</span>
            <button onClick={() => setBlockTypeToAdd(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-muted-foreground">Section title</label>
              <Input
                placeholder="e.g. Key concepts"
                value={blockForm.title}
                onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                className="bg-surface border-border text-xs"
              />
            </div>

            {blockTypeToAdd === 'TEXT' && (
              <div className="space-y-1">
                <label className="text-muted-foreground">Markdown content *</label>
                <textarea
                  rows={6}
                  placeholder="Supports GitHub Markdown: headers (##), **bold**, lists, `code`..."
                  value={blockForm.content}
                  onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}

            {blockTypeToAdd === 'VIDEO' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">YouTube URL or video id *</label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className={`bg-surface border-border text-xs ${videoUrl && !extractYouTubeId(videoUrl) ? 'border-rose-500/60' : ''}`}
                    />
                    {videoUrl && !extractYouTubeId(videoUrl) && (
                      <p className="text-[11px] text-rose-400">Not a recognised YouTube link</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Creator / channel attribution</label>
                    <Input
                      placeholder="e.g. freeCodeCamp"
                      value={videoAttribution}
                      onChange={(e) => setVideoAttribution(e.target.value)}
                      className="bg-surface border-border text-xs"
                    />
                  </div>
                </div>
                {extractYouTubeId(videoUrl) && (
                  <div className="rounded-lg border border-border bg-background p-2 max-w-xl">
                    <div className="relative aspect-video rounded overflow-hidden bg-black">
                      <iframe
                        src={youTubeEmbedUrl(extractYouTubeId(videoUrl)!)}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {blockTypeToAdd === 'CODE' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Language</label>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="w-full h-8 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="bash">Shell</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Code *</label>
                  <textarea
                    rows={8}
                    placeholder="// Paste your code sample here..."
                    value={blockForm.content}
                    onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {blockTypeToAdd === 'LINK' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">URL *</label>
                    <Input
                      placeholder="https://developer.mozilla.org/..."
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="bg-surface border-border text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Provider</label>
                    <Input
                      placeholder="e.g. MDN Web Docs"
                      value={docProvider}
                      onChange={(e) => setDocProvider(e.target.value)}
                      className="bg-surface border-border text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Description</label>
                  <Input
                    placeholder="Why should students read this?"
                    value={blockForm.content}
                    onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>
            )}

            {blockTypeToAdd === 'QUESTION' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Question *</label>
                  <Input
                    placeholder="e.g. What does the JVM do?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground">Options (select the correct answer)</label>
                  {questionOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`block-correct-${lessonId}`}
                        checked={correctOptionIdx === idx}
                        onChange={() => setCorrectOptionIdx(idx)}
                        className="accent-purple-600"
                      />
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...questionOptions];
                          updated[idx] = e.target.value;
                          setQuestionOptions(updated);
                        }}
                        className="bg-surface border-border text-xs"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Explanation (shown after answering)</label>
                  <Input
                    value={questionExplanation}
                    onChange={(e) => setQuestionExplanation(e.target.value)}
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setBlockTypeToAdd(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={createBlockMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {createBlockMutation.isPending ? 'Saving...' : 'Save Block'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="font-mono text-xs text-muted-foreground">Content sequence ({blocks.length} blocks)</div>
        {isLoading ? (
          <div className="py-6 text-center text-xs font-mono text-muted-foreground">Loading content blocks...</div>
        ) : blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs font-mono text-muted-foreground">
            No additional content yet. Add notes, code samples, reference links or concept checks above.
          </div>
        ) : (
          blocks.map((block: ContentBlock, bIdx: number) => {
            let parsed: any = null;
            try {
              if (block.dataJson) parsed = JSON.parse(block.dataJson);
            } catch {
              /* ignore malformed json */
            }
            return (
              <div key={block.id} className="rounded-xl border border-border bg-surface p-4 space-y-3 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between border-b border-border pb-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-purple-400 font-bold">#{bIdx + 1}</span>
                    <Badge variant="outline" className="text-[10px]">{block.type}</Badge>
                    <span className="font-sans font-medium text-foreground truncate">{block.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => move(bIdx, 'up')} disabled={bIdx === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(bIdx, 'down')} disabled={bIdx === blocks.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove block "${block.title}"?`)) deleteBlockMutation.mutate(block.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Delete block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {block.type === 'VIDEO' && parsed?.videoId && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-xl">
                    <iframe
                      src={youTubeEmbedUrl(parsed.videoId)}
                      title={block.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
                {block.type === 'LINK' && parsed && (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-cyan-300 flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="truncate">{block.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{block.content}</div>
                      <div className="text-[10px] font-mono text-cyan-400/80 mt-1">Provider: {parsed.provider}</div>
                    </div>
                    <a href={parsed.url} target="_blank" rel="noreferrer" className="shrink-0 text-cyan-400 hover:text-cyan-300">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
                {block.type === 'CODE' && (
                  <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs overflow-x-auto">
                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{parsed?.language || 'code'}</div>
                    <pre className="text-emerald-400"><code>{block.content}</code></pre>
                  </div>
                )}
                {block.type === 'TEXT' && (
                  <div className="text-xs text-foreground/90 font-sans whitespace-pre-wrap leading-relaxed">{block.content}</div>
                )}
                {block.type === 'QUESTION' && parsed && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 space-y-2.5 font-mono text-xs">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" />
                      <span>{block.content}</span>
                    </div>
                    <div className="space-y-1.5 pl-2">
                      {parsed.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`px-2.5 py-1 rounded text-xs ${
                            oIdx === parsed.correctIndex
                              ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                              : 'text-muted-foreground bg-surface'
                          }`}
                        >
                          {opt} {oIdx === parsed.correctIndex && '(correct)'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
