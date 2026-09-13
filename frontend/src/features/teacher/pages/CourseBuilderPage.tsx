import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  ArrowLeft,
  FolderPlus,
  FilePlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Code,
  Link as LinkIcon,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { teacherApi } from '@/lib/teacher-api';
import type {
  TopicDetail,
  ContentBlock,
  ContentBlockType,
} from '@/types/course';
import type {
  CreateTopicPayload,
  CreateLessonPayload,
  CreateBlockPayload,
} from '@/types/teacher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CourseBuilderPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();
  const cId = Number(courseId);

  // Active selections
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Modals
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [blockTypeToAdd, setBlockTypeToAdd] = useState<ContentBlockType | null>(null);

  // Feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [topicForm, setTopicForm] = useState<CreateTopicPayload>({ title: '', slug: '', description: '' });
  const [lessonForm, setLessonForm] = useState<CreateLessonPayload>({ title: '', slug: '', estimatedMinutes: 20 });
  const [blockForm, setBlockForm] = useState<CreateBlockPayload>({
    type: 'TEXT',
    title: '',
    content: '',
    dataJson: '',
  });

  // Custom Video helper state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAttribution, setVideoAttribution] = useState('Apna College');
  const [docUrl, setDocUrl] = useState('');
  const [docProvider, setDocProvider] = useState('MDN Web Docs');
  const [codeLang, setCodeLang] = useState('javascript');

  // Interactive Question Builder
  const [questionText, setQuestionText] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [questionExplanation, setQuestionExplanation] = useState('');

  // Course Query
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['teacher-course-detail', cId],
    queryFn: () => teacherApi.getCourseDetail(cId),
    enabled: !isNaN(cId),
  });

  // Set default selection when course loads
  useEffect(() => {
    if (course && course.topics.length > 0) {
      if (!selectedTopicId) {
        setSelectedTopicId(course.topics[0].id);
        if (course.topics[0].lessons.length > 0 && !selectedLessonId) {
          setSelectedLessonId(course.topics[0].lessons[0].id);
        }
      }
    }
  }, [course, selectedTopicId, selectedLessonId]);

  // Lesson Blocks Query
  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['teacher-lesson-blocks', selectedLessonId],
    queryFn: () => (selectedLessonId ? teacherApi.getLessonBlocks(selectedLessonId) : Promise.resolve([])),
    enabled: !!selectedLessonId,
  });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper for extracting YouTube video ID
  const extractYouTubeId = (urlOrId: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return match && match[2].length === 11 ? match[2] : urlOrId;
  };

  // Mutations
  const togglePublishMutation = useMutation({
    mutationFn: () => teacherApi.togglePublishCourse(cId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
      showToast('success', `Course status updated to ${updated.status}`);
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Publish requirement not met: Course needs at least 1 lesson with content.');
    },
  });

  const createTopicMutation = useMutation({
    mutationFn: (data: CreateTopicPayload) => teacherApi.createTopic(cId, data),
    onSuccess: (newTopic) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
      setShowAddTopicModal(false);
      setSelectedTopicId(newTopic.id);
      setTopicForm({ title: '', slug: '', description: '' });
      showToast('success', `Module "${newTopic.title}" added!`);
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Failed to add module');
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: (topicId: number) => teacherApi.deleteTopic(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
      setSelectedTopicId(null);
      setSelectedLessonId(null);
      showToast('success', 'Module deleted');
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ topicId, data }: { topicId: number; data: CreateLessonPayload }) =>
      teacherApi.createLesson(topicId, data),
    onSuccess: (newLesson) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
      setShowAddLessonModal(false);
      setSelectedLessonId(newLesson.id);
      setLessonForm({ title: '', slug: '', estimatedMinutes: 20 });
      showToast('success', `Lesson "${newLesson.title}" created!`);
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Failed to create lesson');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: number) => teacherApi.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', cId] });
      setSelectedLessonId(null);
      showToast('success', 'Lesson deleted');
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: (data: CreateBlockPayload) => teacherApi.createBlock(selectedLessonId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-blocks', selectedLessonId] });
      setBlockTypeToAdd(null);
      resetBlockForms();
      showToast('success', 'Content block added to lesson!');
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Failed to add content block');
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) => teacherApi.deleteBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-blocks', selectedLessonId] });
      showToast('success', 'Content block removed');
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: (newOrderIds: number[]) => teacherApi.reorderBlocks(selectedLessonId!, newOrderIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-lesson-blocks', selectedLessonId] });
    },
  });

  const resetBlockForms = () => {
    setBlockForm({ type: 'TEXT', title: '', content: '', dataJson: '' });
    setVideoUrl('');
    setVideoAttribution('Apna College');
    setDocUrl('');
    setDocProvider('MDN Web Docs');
    setCodeLang('javascript');
    setQuestionText('');
    setQuestionOptions(['', '', '', '']);
    setCorrectOptionIdx(0);
    setQuestionExplanation('');
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!blocks || blocks.length === 0) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    const newIds = newBlocks.map((b) => b.id);
    reorderBlocksMutation.mutate(newIds);
  };

  const handleSaveBlock = () => {
    if (!selectedLessonId || !blockTypeToAdd) return;

    if (blockTypeToAdd === 'VIDEO') {
      const vidId = extractYouTubeId(videoUrl);
      if (!vidId) {
        showToast('error', 'Please enter a valid YouTube URL or Video ID');
        return;
      }
      const dataJson = JSON.stringify({
        videoId: vidId,
        provider: 'YouTube',
        attribution: videoAttribution.trim() || 'Educational Creator',
        url: `https://www.youtube.com/watch?v=${vidId}`,
      });
      createBlockMutation.mutate({
        type: 'VIDEO',
        title: blockForm.title.trim() || 'Video Lecture',
        content: blockForm.content.trim(),
        dataJson,
      });
    } else if (blockTypeToAdd === 'LINK') {
      if (!docUrl) {
        showToast('error', 'Please enter a target documentation URL');
        return;
      }
      const dataJson = JSON.stringify({
        url: docUrl.trim(),
        provider: docProvider.trim() || 'Official Docs',
      });
      createBlockMutation.mutate({
        type: 'LINK',
        title: blockForm.title.trim() || 'Official Documentation Reference',
        content: blockForm.content.trim(),
        dataJson,
      });
    } else if (blockTypeToAdd === 'CODE') {
      const dataJson = JSON.stringify({
        language: codeLang,
      });
      createBlockMutation.mutate({
        type: 'CODE',
        title: blockForm.title.trim() || 'Code Implementation',
        content: blockForm.content.trim(),
        dataJson,
      });
    } else if (blockTypeToAdd === 'QUESTION') {
      if (!questionText.trim()) {
        showToast('error', 'Question text is required');
        return;
      }
      const filteredOptions = questionOptions.filter((o) => o.trim().length > 0);
      if (filteredOptions.length < 2) {
        showToast('error', 'At least 2 options are required');
        return;
      }
      const dataJson = JSON.stringify({
        options: filteredOptions,
        correctIndex: correctOptionIdx,
      });
      createBlockMutation.mutate({
        type: 'QUESTION',
        title: blockForm.title.trim() || 'Concept Check Question',
        content: questionText.trim(),
        dataJson,
      });
    } else {
      // TEXT
      if (!blockForm.content.trim()) {
        showToast('error', 'Text content is required');
        return;
      }
      createBlockMutation.mutate({
        type: 'TEXT',
        title: blockForm.title.trim() || 'Lesson Notes',
        content: blockForm.content.trim(),
      });
    }
  };

  if (courseLoading) {
    return (
      <div className="container max-w-screen-2xl px-4 py-16 text-center font-mono text-xs text-muted-foreground">
        Loading Course Builder...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-screen-2xl px-4 py-16 text-center space-y-4 font-mono">
        <div className="text-destructive">Course not found or unauthorized.</div>
        <Link to="/teacher">
          <Button size="sm" variant="outline">
            Return to Studio
          </Button>
        </Link>
      </div>
    );
  }

  const selectedTopic = course.topics.find((t) => t.id === selectedTopicId);
  const selectedLesson = selectedTopic?.lessons.find((l) => l.id === selectedLessonId);
  const isPublished = course.status === 'PUBLISHED' || course.published;

  return (
    <div className="container max-w-screen-2xl px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* 1. Builder Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/teacher">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Studio</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{course.title}</h1>
              {isPublished ? (
                <Badge variant="easy" className="text-[10px] font-mono">
                  PUBLISHED
                </Badge>
              ) : (
                <Badge variant="medium" className="text-[10px] font-mono">
                  DRAFT
                </Badge>
              )}
            </div>
            <div className="text-xs font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Category: {course.category || 'General'}</span>
              <span>&bull;</span>
              <span>Level: {course.level}</span>
              <span>&bull;</span>
              <span>Duration: {course.estimatedDuration || '4 weeks'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {isPublished && (
            <Link to={`/courses/${course.slug}`} target="_blank">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Student View</span>
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            className={`h-8 gap-1.5 font-medium ${
              isPublished
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            onClick={() => togglePublishMutation.mutate()}
            disabled={togglePublishMutation.isPending}
          >
            {isPublished ? 'Unpublish to Draft' : 'Publish Course'}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md text-xs font-mono border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 2. Main Builder Workspace: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Curriculum Hierarchy (Modules & Lessons) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-surface overflow-hidden space-y-4 p-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="font-semibold text-sm text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-400" />
              <span>Curriculum Tree</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddTopicModal(true)}
              className="h-7 px-2 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <FolderPlus className="h-3 w-3" />
              <span>Add Module</span>
            </Button>
          </div>

          {/* Module list */}
          <div className="space-y-3 font-mono text-xs">
            {course.topics.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No modules yet. Click "+ Add Module" to start structuring your course.
              </div>
            ) : (
              course.topics.map((topic: TopicDetail, tIdx: number) => {
                const isSelectedTopic = topic.id === selectedTopicId;
                return (
                  <div
                    key={topic.id}
                    className={`rounded-lg border transition-colors ${
                      isSelectedTopic ? 'border-purple-500/50 bg-surface-raised' : 'border-border/60 bg-background/50'
                    }`}
                  >
                    {/* Module Header */}
                    <div
                      onClick={() => setSelectedTopicId(topic.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface-raised/80 rounded-t-lg"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-purple-400 font-bold">M{tIdx + 1}</span>
                        <span className="font-sans font-medium text-foreground truncate">{topic.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-surface rounded">
                          {topic.lessons.length}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete module "${topic.title}" and its lessons?`)) {
                              deleteTopicMutation.mutate(topic.id);
                            }
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete module"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="px-3 pb-3 space-y-1.5">
                      {topic.lessons.map((lesson, lIdx) => {
                        const isSelectedLesson = lesson.id === selectedLessonId;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              setSelectedTopicId(topic.id);
                              setSelectedLessonId(lesson.id);
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                              isSelectedLesson
                                ? 'bg-purple-600 text-white font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[10px] opacity-70">L{lIdx + 1}</span>
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] shrink-0">
                              <span>{lesson.estimatedMinutes}m</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete lesson "${lesson.title}"?`)) {
                                    deleteLessonMutation.mutate(lesson.id);
                                  }
                                }}
                                className={`p-0.5 hover:text-destructive ${
                                  isSelectedLesson ? 'text-white/80 hover:text-white' : ''
                                }`}
                                title="Delete lesson"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Lesson Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setShowAddLessonModal(true);
                        }}
                        className="w-full h-7 text-[11px] justify-start text-muted-foreground hover:text-foreground gap-1 border border-dashed border-border/60 hover:border-purple-500/40"
                      >
                        <FilePlus className="h-3 w-3" />
                        <span>+ Add Lesson</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Lesson Content Blocks */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-surface p-5 space-y-6">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Lesson Overview Banner */}
              <div className="border-b border-border pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-purple-400 font-semibold">
                      {selectedTopic?.title} &gt; Lesson
                    </span>
                    <h2 className="text-xl font-semibold text-foreground">{selectedLesson.title}</h2>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Estimated Duration: <span className="text-foreground font-semibold">{selectedLesson.estimatedMinutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Add Content Block Action Bar */}
              <div className="rounded-lg border border-border bg-surface-raised p-4 space-y-3">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                  + Add Curriculum Component to Lesson
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetBlockForms();
                      setBlockTypeToAdd('TEXT');
                    }}
                    className={`h-9 text-xs gap-1.5 font-mono ${
                      blockTypeToAdd === 'TEXT' ? 'border-primary text-primary bg-primary/10' : ''
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    <span>Rich Text</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetBlockForms();
                      setBlockTypeToAdd('VIDEO');
                    }}
                    className={`h-9 text-xs gap-1.5 font-mono ${
                      blockTypeToAdd === 'VIDEO' ? 'border-primary text-primary bg-primary/10' : ''
                    }`}
                  >
                    <Video className="h-3.5 w-3.5 text-rose-400" />
                    <span>YouTube Embed</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetBlockForms();
                      setBlockTypeToAdd('CODE');
                    }}
                    className={`h-9 text-xs gap-1.5 font-mono ${
                      blockTypeToAdd === 'CODE' ? 'border-primary text-primary bg-primary/10' : ''
                    }`}
                  >
                    <Code className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Code Snippet</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetBlockForms();
                      setBlockTypeToAdd('LINK');
                    }}
                    className={`h-9 text-xs gap-1.5 font-mono ${
                      blockTypeToAdd === 'LINK' ? 'border-primary text-primary bg-primary/10' : ''
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Official Doc</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetBlockForms();
                      setBlockTypeToAdd('QUESTION');
                    }}
                    className={`h-9 text-xs gap-1.5 font-mono ${
                      blockTypeToAdd === 'QUESTION' ? 'border-primary text-primary bg-primary/10' : ''
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Concept Check</span>
                  </Button>
                </div>
              </div>

              {/* ACTIVE BLOCK FORM BUILDER */}
              {blockTypeToAdd && (
                <div className="rounded-xl border border-purple-500/40 bg-purple-950/10 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 font-mono text-xs">
                    <span className="font-semibold text-purple-300">
                      Configure New {blockTypeToAdd} Block
                    </span>
                    <button onClick={() => setBlockTypeToAdd(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Block Section Title</label>
                      <Input
                        placeholder="e.g. Core Execution Mechanics or Video Lecture"
                        value={blockForm.title}
                        onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                        className="bg-surface border-border text-xs"
                      />
                    </div>

                    {/* TEXT BLOCK */}
                    {blockTypeToAdd === 'TEXT' && (
                      <div className="space-y-1">
                        <label className="text-muted-foreground">Markdown Content</label>
                        <textarea
                          rows={6}
                          placeholder="Supports GitHub Markdown, headers (##), bold (**text**), lists (- item), backticks (`code`), etc."
                          value={blockForm.content}
                          onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    {/* VIDEO BLOCK */}
                    {blockTypeToAdd === 'VIDEO' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-muted-foreground">YouTube Video URL or ID *</label>
                            <Input
                              placeholder="e.g. https://www.youtube.com/watch?v=ajdRvxDWH4w or ajdRvxDWH4w"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              className="bg-surface border-border text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-muted-foreground">Creator / Channel Attribution *</label>
                            <Input
                              placeholder="e.g. Apna College, Bro Code, Programming with Mosh"
                              value={videoAttribution}
                              onChange={(e) => setVideoAttribution(e.target.value)}
                              className="bg-surface border-border text-xs"
                            />
                          </div>
                        </div>

                        {/* Live YouTube Preview */}
                        {videoUrl && extractYouTubeId(videoUrl) && (
                          <div className="mt-2 rounded-lg border border-border bg-background p-2">
                            <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center justify-between">
                              <span>Embed Preview (Attribution: {videoAttribution})</span>
                              <span className="font-mono text-purple-400">ID: {extractYouTubeId(videoUrl)}</span>
                            </div>
                            <div className="relative aspect-video rounded overflow-hidden bg-black">
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(videoUrl)}`}
                                title="YouTube Video Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CODE BLOCK */}
                    {blockTypeToAdd === 'CODE' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-muted-foreground">Programming Language</label>
                          <select
                            value={codeLang}
                            onChange={(e) => setCodeLang(e.target.value)}
                            className="w-full h-8 rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="java">Java 21</option>
                            <option value="javascript">JavaScript (ES6+)</option>
                            <option value="python">Python 3</option>
                            <option value="sql">MySQL / SQL</option>
                            <option value="html">HTML5</option>
                            <option value="css">CSS3</option>
                            <option value="typescript">TypeScript</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-muted-foreground">Code Content</label>
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

                    {/* LINK BLOCK (OFFICIAL DOCS) */}
                    {blockTypeToAdd === 'LINK' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-muted-foreground">Official Documentation URL *</label>
                            <Input
                              placeholder="e.g. https://developer.mozilla.org/en-US/docs/Web/HTML"
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                              className="bg-surface border-border text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-muted-foreground">Doc Provider / Organization</label>
                            <Input
                              placeholder="e.g. MDN Web Docs, Oracle dev.java, python.org, react.dev"
                              value={docProvider}
                              onChange={(e) => setDocProvider(e.target.value)}
                              className="bg-surface border-border text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-muted-foreground">Description / Guide Note</label>
                          <Input
                            placeholder="e.g. Official standard specifications and practical browser compatibility guide"
                            value={blockForm.content}
                            onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                            className="bg-surface border-border text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* QUESTION BLOCK (CONCEPT CHECK) */}
                    {blockTypeToAdd === 'QUESTION' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-muted-foreground">Question Prompt *</label>
                          <Input
                            placeholder="e.g. What is the difference between let and const in ES6?"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="bg-surface border-border text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-muted-foreground">Options (Select the radio button for the correct answer)</label>
                          {questionOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={correctOptionIdx === idx}
                                onChange={() => setCorrectOptionIdx(idx)}
                                className="text-purple-600 focus:ring-purple-500"
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
                          <label className="text-muted-foreground">Explanation (Revealed after student answers)</label>
                          <Input
                            placeholder="e.g. Const variables are immutable bindings, while let allows reassignments."
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
                        onClick={handleSaveBlock}
                        disabled={createBlockMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                      >
                        {createBlockMutation.isPending ? 'Saving Block...' : 'Save Block'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* LIST OF BLOCKS IN LESSON */}
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>Lesson Content Sequence ({blocks.length} blocks)</span>
                </div>

                {blocksLoading ? (
                  <div className="py-8 text-center text-xs font-mono text-muted-foreground">
                    Loading content blocks...
                  </div>
                ) : blocks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs font-mono text-muted-foreground">
                    This lesson currently has no content blocks. Use the buttons above to add YouTube videos, Markdown explanations, official documentation links, or code snippets.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map((block: ContentBlock, bIdx: number) => {
                      let parsedJson: any = null;
                      try {
                        if (block.dataJson) parsedJson = JSON.parse(block.dataJson);
                      } catch {
                        // pass
                      }

                      return (
                        <div
                          key={block.id}
                          className="rounded-xl border border-border bg-surface p-4 space-y-3 relative group hover:border-purple-500/30 transition-colors"
                        >
                          {/* Block Card Header */}
                          <div className="flex items-center justify-between border-b border-border pb-2.5 font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400 font-bold">#{bIdx + 1}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {block.type}
                              </Badge>
                              <span className="font-sans font-medium text-foreground">{block.title}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveBlock(bIdx, 'up')}
                                disabled={bIdx === 0}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                title="Move block up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveBlock(bIdx, 'down')}
                                disabled={bIdx === blocks.length - 1}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                title="Move block down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove block "${block.title}"?`)) {
                                    deleteBlockMutation.mutate(block.id);
                                  }
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive"
                                title="Delete block"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block Body Preview */}
                          <div>
                            {block.type === 'VIDEO' && parsedJson && (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground font-mono flex items-center justify-between">
                                  <span>YouTube Embedded Lecture</span>
                                  <span className="text-purple-400">Attribution: {parsedJson.attribution || 'Author'}</span>
                                </div>
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-xl">
                                  <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${parsedJson.videoId}`}
                                    title={block.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'LINK' && parsedJson && (
                              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3 flex items-center justify-between gap-4">
                                <div>
                                  <div className="font-medium text-xs text-cyan-300 flex items-center gap-1.5">
                                    <LinkIcon className="h-3.5 w-3.5" />
                                    <span>{block.title}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground mt-0.5">{block.content}</div>
                                  <div className="text-[10px] font-mono text-cyan-400/80 mt-1">
                                    Provider: {parsedJson.provider}
                                  </div>
                                </div>
                                <a
                                  href={parsedJson.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 text-cyan-400 hover:text-cyan-300"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            )}

                            {block.type === 'CODE' && (
                              <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs overflow-x-auto">
                                <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                                  {parsedJson?.language || 'code'}
                                </div>
                                <pre className="text-emerald-400">
                                  <code>{block.content}</code>
                                </pre>
                              </div>
                            )}

                            {block.type === 'TEXT' && (
                              <div className="text-xs text-foreground/90 font-sans whitespace-pre-wrap leading-relaxed">
                                {block.content}
                              </div>
                            )}

                            {block.type === 'QUESTION' && parsedJson && (
                              <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 space-y-2.5 font-mono text-xs">
                                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                                  <HelpCircle className="h-4 w-4" />
                                  <span>{block.content}</span>
                                </div>
                                <div className="space-y-1.5 pl-2">
                                  {parsedJson.options?.map((opt: string, oIdx: number) => (
                                    <div
                                      key={oIdx}
                                      className={`px-2.5 py-1 rounded text-xs ${
                                        oIdx === parsedJson.correctIndex
                                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                                          : 'text-muted-foreground bg-surface'
                                      }`}
                                    >
                                      {opt} {oIdx === parsedJson.correctIndex && '(Correct Answer)'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center font-mono text-xs text-muted-foreground">
              Select a lesson from the curriculum tree on the left, or add a new lesson to begin editing.
            </div>
          )}
        </div>
      </div>

      {/* ADD MODULE MODAL */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-purple-400" />
                <h3 className="text-base font-semibold text-foreground">Add Course Module</h3>
              </div>
              <button onClick={() => setShowAddTopicModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTopicMutation.mutate(topicForm);
              }}
              className="space-y-3 font-mono text-xs"
            >
              <div className="space-y-1">
                <label className="text-muted-foreground">Module Title *</label>
                <Input
                  required
                  placeholder="e.g. Module 1 — Core Architecture"
                  value={topicForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                    setTopicForm({ ...topicForm, title, slug });
                  }}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Module Slug *</label>
                <Input
                  required
                  placeholder="e.g. module-1-core-architecture"
                  value={topicForm.slug}
                  onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Description</label>
                <Input
                  placeholder="e.g. Fundamental components and execution lifecycle"
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddTopicModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTopicMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {createTopicMutation.isPending ? 'Adding...' : 'Add Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LESSON MODAL */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="h-4 w-4 text-purple-400" />
                <h3 className="text-base font-semibold text-foreground">Add Lesson to Module</h3>
              </div>
              <button onClick={() => setShowAddLessonModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedTopicId) return;
                createLessonMutation.mutate({ topicId: selectedTopicId, data: lessonForm });
              }}
              className="space-y-3 font-mono text-xs"
            >
              <div className="space-y-1">
                <label className="text-muted-foreground">Lesson Title *</label>
                <Input
                  required
                  placeholder="e.g. Deep Dive into Virtual DOM"
                  value={lessonForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                    setLessonForm({ ...lessonForm, title, slug });
                  }}
                  className="bg-surface border-border text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Lesson Slug *</label>
                  <Input
                    required
                    placeholder="e.g. virtual-dom-deep-dive"
                    value={lessonForm.slug}
                    onChange={(e) => setLessonForm({ ...lessonForm, slug: e.target.value })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Estimated Minutes</label>
                  <Input
                    type="number"
                    min={1}
                    value={lessonForm.estimatedMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, estimatedMinutes: Number(e.target.value) })}
                    className="bg-surface border-border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLessonModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createLessonMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
