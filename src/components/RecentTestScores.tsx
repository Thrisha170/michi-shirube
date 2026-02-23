import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTestScores, TestSection, ListeningTestDetails } from '@/hooks/useTestScores';
import { ClipboardList, Headphones, BookOpen, Languages, PenTool, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface RecentTestScoresProps {
  section?: TestSection;
  limit?: number;
}

export const RecentTestScores = ({ section, limit = 5 }: RecentTestScoresProps) => {
  const { testScores, getScoresBySection, deleteTestScore, loading } = useTestScores();

  const scores = section ? getScoresBySection(section).slice(0, limit) : testScores.slice(0, limit);

  const sectionIcons: Record<TestSection, React.ReactNode> = {
    listening: <Headphones className="h-3.5 w-3.5" />,
    kanji: <PenTool className="h-3.5 w-3.5" />,
    vocabulary: <Languages className="h-3.5 w-3.5" />,
    grammar: <BookOpen className="h-3.5 w-3.5" />,
    reading: <FileText className="h-3.5 w-3.5" />,
  };

  const sectionColors: Record<TestSection, string> = {
    listening: 'bg-purple-500/20 text-purple-400',
    kanji: 'bg-red-500/20 text-red-400',
    vocabulary: 'bg-blue-500/20 text-blue-400',
    grammar: 'bg-green-500/20 text-green-400',
    reading: 'bg-amber-500/20 text-amber-400',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          {section ? `${section.charAt(0).toUpperCase() + section.slice(1)} Tests` : 'Recent Tests'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scores.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No test scores logged yet
          </p>
        ) : (
          scores.map((score) => {
            const listeningDetails = score.section === 'listening' 
              ? score.details as ListeningTestDetails | null
              : null;

            return (
              <div
                key={score.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${sectionColors[score.section]}`}>
                    {sectionIcons[score.section]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getScoreColor(score.score)}`}>
                        {score.score}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({score.correct}/{score.total})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(score.date), 'MMM d, yyyy')}</span>
                      {listeningDetails?.audioType && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {listeningDetails.audioType}
                        </Badge>
                      )}
                      {score.difficulty_level && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {score.difficulty_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTestScore(score.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
