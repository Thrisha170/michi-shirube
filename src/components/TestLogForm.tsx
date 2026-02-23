import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTestScores, TestSection, ListeningAudioType, DifficultyLevel } from '@/hooks/useTestScores';
import { ClipboardCheck, Headphones, BookOpen, Languages, PenTool, FileText } from 'lucide-react';

interface TestLogFormProps {
  defaultSection?: TestSection;
  onSuccess?: () => void;
}

export const TestLogForm = ({ defaultSection = 'listening', onSuccess }: TestLogFormProps) => {
  const { logListeningTest, logKanjiTest, logVocabularyTest, logGrammarTest, logReadingTest } = useTestScores();
  const [activeSection, setActiveSection] = useState<TestSection>(defaultSection);
  const [loading, setLoading] = useState(false);

  // Common fields
  const [correct, setCorrect] = useState('');
  const [total, setTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [timeTaken, setTimeTaken] = useState('');

  // Listening-specific
  const [audioType, setAudioType] = useState<ListeningAudioType>('dialogue');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  // Section-specific lists (comma-separated input)
  const [wrongItems, setWrongItems] = useState('');
  const [passageCount, setPassageCount] = useState('');

  const resetForm = () => {
    setCorrect('');
    setTotal('');
    setNotes('');
    setTimeTaken('');
    setAudioType('dialogue');
    setDifficulty('medium');
    setWrongItems('');
    setPassageCount('');
  };

  const handleSubmit = async () => {
    const correctNum = parseInt(correct);
    const totalNum = parseInt(total);

    if (isNaN(correctNum) || isNaN(totalNum) || totalNum <= 0 || correctNum < 0 || correctNum > totalNum) {
      return;
    }

    setLoading(true);
    let success = false;

    try {
      const timeTakenMinutes = timeTaken ? parseInt(timeTaken) : undefined;
      const itemList = wrongItems ? wrongItems.split(',').map(s => s.trim()).filter(Boolean) : undefined;

      switch (activeSection) {
        case 'listening':
          success = await logListeningTest({
            correct: correctNum,
            total: totalNum,
            audioType,
            difficultyLevel: difficulty,
            timeTakenMinutes,
            notes: notes || undefined,
          });
          break;
        case 'kanji':
          success = await logKanjiTest({
            correct: correctNum,
            total: totalNum,
            wrongKanjiList: itemList,
            notes: notes || undefined,
          });
          break;
        case 'vocabulary':
          success = await logVocabularyTest({
            correct: correctNum,
            total: totalNum,
            weakWordsList: itemList,
            notes: notes || undefined,
          });
          break;
        case 'grammar':
          success = await logGrammarTest({
            correct: correctNum,
            total: totalNum,
            confusingPatterns: itemList,
            notes: notes || undefined,
          });
          break;
        case 'reading':
          success = await logReadingTest({
            correct: correctNum,
            total: totalNum,
            passageCount: parseInt(passageCount) || 1,
            timeTakenMinutes,
            notes: notes || undefined,
          });
          break;
      }

      if (success) {
        resetForm();
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const sectionIcons = {
    listening: <Headphones className="h-4 w-4" />,
    kanji: <PenTool className="h-4 w-4" />,
    vocabulary: <Languages className="h-4 w-4" />,
    grammar: <BookOpen className="h-4 w-4" />,
    reading: <FileText className="h-4 w-4" />,
  };

  const scorePercentage = correct && total && parseInt(total) > 0
    ? Math.round((parseInt(correct) / parseInt(total)) * 100)
    : null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Log Test Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as TestSection)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="listening" className="text-xs px-2">
              {sectionIcons.listening}
            </TabsTrigger>
            <TabsTrigger value="kanji" className="text-xs px-2">
              {sectionIcons.kanji}
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="text-xs px-2">
              {sectionIcons.vocabulary}
            </TabsTrigger>
            <TabsTrigger value="grammar" className="text-xs px-2">
              {sectionIcons.grammar}
            </TabsTrigger>
            <TabsTrigger value="reading" className="text-xs px-2">
              {sectionIcons.reading}
            </TabsTrigger>
          </TabsList>

          {/* Common Score Fields */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="correct" className="text-xs">Correct</Label>
              <Input
                id="correct"
                type="number"
                min="0"
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total" className="text-xs">Total Questions</Label>
              <Input
                id="total"
                type="number"
                min="1"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="10"
                className="h-9"
              />
            </div>
          </div>

          {scorePercentage !== null && (
            <div className="text-center py-2">
              <span className={`text-2xl font-bold ${
                scorePercentage >= 80 ? 'text-green-500' :
                scorePercentage >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {scorePercentage}%
              </span>
            </div>
          )}

          {/* Listening-specific fields */}
          <TabsContent value="listening" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Audio Type</Label>
              <Select value={audioType} onValueChange={(v) => setAudioType(v as ListeningAudioType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dialogue">Dialogue</SelectItem>
                  <SelectItem value="monologue">Monologue</SelectItem>
                  <SelectItem value="exam-style">Exam-style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="exam">Exam Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-xs">Time Taken (minutes)</Label>
              <Input
                id="time"
                type="number"
                min="1"
                value={timeTaken}
                onChange={(e) => setTimeTaken(e.target.value)}
                placeholder="Optional"
                className="h-9"
              />
            </div>
          </TabsContent>

          {/* Kanji-specific fields */}
          <TabsContent value="kanji" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Wrong Kanji (comma-separated)</Label>
              <Input
                value={wrongItems}
                onChange={(e) => setWrongItems(e.target.value)}
                placeholder="e.g., 食, 飲, 読"
                className="h-9"
              />
            </div>
          </TabsContent>

          {/* Vocabulary-specific fields */}
          <TabsContent value="vocabulary" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Weak Words (comma-separated)</Label>
              <Input
                value={wrongItems}
                onChange={(e) => setWrongItems(e.target.value)}
                placeholder="e.g., 危険, 経験, 意見"
                className="h-9"
              />
            </div>
          </TabsContent>

          {/* Grammar-specific fields */}
          <TabsContent value="grammar" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Confusing Patterns (comma-separated)</Label>
              <Input
                value={wrongItems}
                onChange={(e) => setWrongItems(e.target.value)}
                placeholder="e.g., ても vs のに, ようにする"
                className="h-9"
              />
            </div>
          </TabsContent>

          {/* Reading-specific fields */}
          <TabsContent value="reading" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Passage Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={passageCount}
                  onChange={(e) => setPassageCount(e.target.value)}
                  placeholder="1"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  value={timeTaken}
                  onChange={(e) => setTimeTaken(e.target.value)}
                  placeholder="Optional"
                  className="h-9"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes field - common to all */}
        <div className="space-y-1.5">
          <Label className="text-xs">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations or areas to review..."
            className="min-h-[60px] resize-none"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !correct || !total}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Log Test Score'}
        </Button>
      </CardContent>
    </Card>
  );
};
