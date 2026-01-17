import { useState, useEffect } from 'react';

const STATIC_QUESTIONS = [
  {
    id: 1,
    question: "Is ADHD considered a neurodevelopmental disorder?",
    correct: "yes"
  },
  {
    id: 2,
    question: "Does dyslexia primarily affect a person's ability to read?",
    correct: "yes"
  },
  {
    id: 3,
    question: "Can dyscalculia make it difficult to understand numbers and math concepts?",
    correct: "yes"
  },
  {
    id: 4,
    question: "Is dyspraxia sometimes called Developmental Coordination Disorder?",
    correct: "yes"
  },
  {
    id: 5,
    question: "Does dysgraphia affect a person's handwriting and fine motor skills?",
    correct: "yes"
  },
  {
    id: 6,
    question: "Are learning disabilities permanent conditions?",
    correct: "yes"
  },
  {
    id: 7,
    question: "Can people with disabilities lead successful careers?",
    correct: "yes"
  },
  {
    id: 8,
    question: "Is early intervention important for children with learning disabilities?",
    correct: "yes"
  },
  {
    id: 9,
    question: "Is dyslexia caused by laziness?",
    correct: "no"
  },
  {
    id: 10,
    question: "Do all people with disabilities need special schools?",
    correct: "no"
  },
  {
    id: 11,
    question: "Are learning disabilities contagious?",
    correct: "no"
  },
  {
    id: 12,
    question: "Can people with disabilities participate in sports?",
    correct: "yes"
  }
];

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // Fetch custom questions from Gemini via API, fallback on failure
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    fetch('/api/quiz/questions', {
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load questions');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Assume API returns questions with correct answers or we score based on knowing
          setQuestions(data.map((q, idx) => ({ ...q, id: idx + 1, correct: 'yes' }))); // Assume yes is correct
          setUsingFallback(false);
        } else {
          throw new Error('Invalid questions data');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API failed, using fallback questions:', err);
        setQuestions(STATIC_QUESTIONS);
        setUsingFallback(true);
        setLoading(false);
      })
      .finally(() => clearTimeout(timeoutId));
  }, []);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, { id: questions[currentIndex].id, answer }];
    setAnswers(newAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit or calculate locally
      setSubmitting(true);
      fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers })
      })
        .then(res => res.json())
        .then(data => {
          setResult(data);
          setSubmitting(false);
        })
        .catch(err => {
          console.error('Submit failed, calculating locally:', err);
          // Fallback: calculate score locally - any answer except "don't know" is considered correct
          const score = newAnswers.filter(a => a.answer !== 'dontknow').length;
          const total = questions.length;
          const percentage = Math.round((score / total) * 100);
          setResult({
            score,
            total,
            percentage
          });
          setSubmitting(false);
        });
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
    setLoading(true);
    setQuestions([]);
    // Re-trigger fetch
  };



  if (submitting) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-subtext0">Submitting your answers...</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauve mx-auto mb-4"></div>
          <p className="text-subtext0">Loading custom quiz questions...</p>
        </div>
      </div>
    </div>
  );

  if (result) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="flex justify-between items-center bg-surface0/30 p-4 rounded-xl border border-black/5">
          <h2 className="text-xl font-bold text-text">Quiz Complete!</h2>
          <button
            onClick={resetQuiz}
            className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-subtext0 text-sm font-medium transition-colors border border-black/5"
          >
            Take Quiz Again
          </button>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '👍' : '📚'}
            </div>
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-blue mb-2">
              Your Score: {result.score}/{result.total}
            </h3>
            <p className="text-xl text-subtext0 mb-4">
              {result.percentage}% Correct
            </p>
            <div className="w-full bg-surface0/50 rounded-full h-4 backdrop-blur-sm overflow-hidden mb-6">
              <div
                className="h-4 bg-gradient-to-r from-mauve to-blue rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-blue/10 p-4 rounded-xl border border-blue/30">
            <p className="text-sm text-blue font-medium text-center">
              <strong>Remember:</strong> Knowledge about disabilities is important for creating inclusive environments.
              Continue learning to better support others!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="glass-card p-8 rounded-3xl text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-text mb-4">Quiz Unavailable</h2>
        <p className="text-subtext0">Unable to load questions. Using fallback questions.</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mauve to-blue mb-4">
          Disability Knowledge Quiz
        </h1>
        <p className="text-subtext0 text-lg">
          Test your understanding of various disabilities and inclusive practices
        </p>
        {usingFallback && (
          <p className="text-yellow text-sm mt-2">
            Using fallback questions. Start the backend server to load custom questions from Gemini.
          </p>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-subtext1 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-surface0/50 rounded-full h-2 backdrop-blur-sm overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-mauve to-blue rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl shadow-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-text mb-4">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleAnswer('yes')}
            className="w-full p-4 text-left rounded-xl bg-green/10 hover:bg-green/20 border border-green/30 hover:border-green/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green/20 flex items-center justify-center group-hover:bg-green/30 transition-colors">
                <span className="text-green font-bold text-sm">✓</span>
              </div>
              <span className="text-text font-medium">Yes</span>
            </div>
          </button>

          <button
            onClick={() => handleAnswer('no')}
            className="w-full p-4 text-left rounded-xl bg-red/10 hover:bg-red/20 border border-red/30 hover:border-red/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red/20 flex items-center justify-center group-hover:bg-red/30 transition-colors">
                <span className="text-red font-bold text-sm">✗</span>
              </div>
              <span className="text-text font-medium">No</span>
            </div>
          </button>

          <button
            onClick={() => handleAnswer('dontknow')}
            className="w-full p-4 text-left rounded-xl bg-yellow/10 hover:bg-yellow/20 border border-yellow/30 hover:border-yellow/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow/20 flex items-center justify-center group-hover:bg-yellow/30 transition-colors">
                <span className="text-yellow font-bold text-sm">?</span>
              </div>
              <span className="text-text font-medium">Don't Know</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;