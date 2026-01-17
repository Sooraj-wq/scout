import { useState } from "react"

const QUESTIONS = [
  {
    id: 1,
    text: "Does your child struggle to recognize letters or numbers?"
  },
  {
    id: 2,
    text: "Does your child avoid reading or writing tasks?"
  },
  {
    id: 3,
    text: "Does your child have difficulty following multi-step instructions?"
  },
  {
    id: 4,
    text: "Does your child struggle with basic math concepts?"
  }
]

export default function ParentQuiz() {
  const [answers, setAnswers] = useState({})

  const handleAnswer = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">
        Parent Screening Quiz
      </h1>

      <p className="text-subtext0 mb-8">
        A preliminary screening tool to identify potential learning difficulties.
      </p>

      <div className="space-y-6">
        {QUESTIONS.map(q => (
          <div key={q.id} className="glass-card p-6 rounded-2xl">
            <p className="text-text mb-4">{q.text}</p>

            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(q.id, true)}
                className="px-4 py-2 rounded-full bg-green/20 text-green"
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(q.id, false)}
                className="px-4 py-2 rounded-full bg-red/20 text-red"
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-subtext1">
        Answers recorded: {Object.keys(answers).length}/{QUESTIONS.length}
      </div>
    </div>
  )
}
