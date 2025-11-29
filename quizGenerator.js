class QuizGenerator {
  static async generateMCQs(text, fileName) {
    const startTime = Date.now();
    
    try {
      const sentences = this.splitIntoSentences(text);
      const questions = [];

      // Generate questions from different patterns
      const generators = [
        this.generateDefinitionQuestions,
        this.generateProcessQuestions,
        this.generateComparisonQuestions,
        this.generateFactBasedQuestions,
        this.generateApplicationQuestions
      ];

      for (const generator of generators) {
        const generated = generator(sentences);
        questions.push(...generated);
        
        // Stop if we have enough questions
        if (questions.length >= 15) break;
      }

      // Remove duplicates and limit to 10 questions
      const uniqueQuestions = this.removeDuplicateQuestions(questions).slice(0, 10);

      const processingTime = Date.now() - startTime;

      return {
        questions: uniqueQuestions,
        totalSlides: this.estimateSlideCount(text),
        processingTime: processingTime
      };

    } catch (error) {
      console.error('MCQ generation error:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  static splitIntoSentences(text) {
    return text.split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => 
        sentence.length > 20 && 
        sentence.split(/\s+/).length >= 5
      );
  }

  static generateDefinitionQuestions(sentences) {
    const questions = [];
    const patterns = [
      /(\b[A-Z][a-z]+(?:\s+[A-Z]?[a-z]*)*\b) is (?:defined as|means) ([^.!?]+)/gi,
      /(\b[A-Z][a-z]+(?:\s+[A-Z]?[a-z]*)*\b) refers to ([^.!?]+)/gi,
      /The term (\b[A-Z][a-z]+(?:\s+[A-Z]?[a-z]*)*\b) means ([^.!?]+)/gi
    ];

    sentences.forEach((sentence, index) => {
      patterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          const term = match[1];
          const definition = match[2].trim();
          
          if (term && definition && !term.match(/^[0-9]/)) {
            const question = this.createDefinitionQuestion(term, definition, index);
            questions.push(question);
          }
        }
      });
    });

    return questions;
  }

  static generateProcessQuestions(sentences) {
    const questions = [];
    const patterns = [
      /The (?:steps?|process) (?:are|is):?\s*([^.!?]+)/gi,
      /(?:First|Next|Then|Finally), ([^.!?]+)/gi,
      /The (?:main|primary) (?:purpose|function) of (\w+) is ([^.!?]+)/gi
    ];

    sentences.forEach((sentence, index) => {
      patterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          const question = this.createProcessQuestion(sentence, match, index);
          if (question) questions.push(question);
        }
      });
    });

    return questions;
  }

  static generateComparisonQuestions(sentences) {
    const questions = [];
    const patterns = [
      /(\w+) differs from (\w+) in that ([^.!?]+)/gi,
      /(\w+) is different from (\w+) because ([^.!?]+)/gi,
      /The main difference between (\w+) and (\w+) is ([^.!?]+)/gi
    ];

    sentences.forEach((sentence, index) => {
      patterns.forEach(pattern => {
        const match = sentence.match(pattern);
        if (match) {
          const question = this.createComparisonQuestion(match, index);
          if (question) questions.push(question);
        }
      });
    });

    return questions;
  }

  static generateFactBasedQuestions(sentences) {
    const questions = [];
    
    sentences.forEach((sentence, index) => {
      // Look for factual statements
      if (sentence.match(/\b(is|are|was|were|can|has|have)\b/i) && 
          sentence.split(/\s+/).length > 6) {
        const question = this.createFactBasedQuestion(sentence, index);
        if (question) questions.push(question);
      }
    });

    return questions;
  }

  static generateApplicationQuestions(sentences) {
    const questions = [];
    
    sentences.forEach((sentence, index) => {
      // Look for application/scenario based content
      if (sentence.match(/\b(used for|applied in|utilized for|employed in)\b/i)) {
        const question = this.createApplicationQuestion(sentence, index);
        if (question) questions.push(question);
      }
    });

    return questions;
  }

  static createDefinitionQuestion(term, definition, id) {
    const distractors = this.generateDefinitionDistractors(term, definition);
    
    return {
      id: `def_${id}`,
      question: `What is ${term}?`,
      options: this.shuffleArray([definition, ...distractors]),
      correctAnswer: 0,
      explanation: `${term} is defined as ${definition}`,
      type: 'definition',
      difficulty: 'easy',
      category: 'Terminology'
    };
  }

  static createProcessQuestion(sentence, match, id) {
    const baseQuestion = "What is the correct description of this process?";
    const distractors = this.generateProcessDistractors(sentence);
    
    return {
      id: `proc_${id}`,
      question: baseQuestion,
      options: this.shuffleArray([sentence, ...distractors]),
      correctAnswer: 0,
      explanation: "This describes the key aspect of the process.",
      type: 'process',
      difficulty: 'medium',
      category: 'Process'
    };
  }

  static createComparisonQuestion(match, id) {
    const [_, term1, term2, difference] = match;
    const question = `How does ${term1} differ from ${term2}?`;
    const distractors = this.generateComparisonDistractors(term1, term2, difference);
    
    return {
      id: `comp_${id}`,
      question: question,
      options: this.shuffleArray([difference, ...distractors]),
      correctAnswer: 0,
      explanation: `The key difference is: ${difference}`,
      type: 'comparison',
      difficulty: 'medium',
      category: 'Comparison'
    };
  }

  static createFactBasedQuestion(sentence, id) {
    // Convert statement to question
    const question = this.convertStatementToQuestion(sentence);
    const distractors = this.generateFactDistractors(sentence);
    
    if (question && distractors.length === 3) {
      return {
        id: `fact_${id}`,
        question: question,
        options: this.shuffleArray(['True', ...distractors]),
        correctAnswer: this.findCorrectAnswerIndex(['True', ...distractors], 'True'),
        explanation: `Based on: ${sentence}`,
        type: 'fact',
        difficulty: 'easy',
        category: 'Fact'
      };
    }
    return null;
  }

  static createApplicationQuestion(sentence, id) {
    const question = "What is the primary application mentioned?";
    const keyApplication = this.extractApplication(sentence);
    const distractors = this.generateApplicationDistractors(keyApplication);
    
    if (keyApplication && distractors.length === 3) {
      return {
        id: `app_${id}`,
        question: question,
        options: this.shuffleArray([keyApplication, ...distractors]),
        correctAnswer: 0,
        explanation: `As described: ${sentence}`,
        type: 'application',
        difficulty: 'medium',
        category: 'Application'
      };
    }
    return null;
  }

  // Helper methods for distractor generation
  static generateDefinitionDistractors(term, correctDefinition) {
    const commonDistractors = [
      `A type of ${term.toLowerCase()} system`,
      `The process of creating ${term.toLowerCase()}`,
      `A tool used for ${term.toLowerCase()} analysis`,
      `The opposite of ${term.toLowerCase()}`
    ];
    
    return this.selectRandomDistractors(commonDistractors, 3);
  }

  static generateProcessDistractors(correctProcess) {
    const distractors = [
      "A completely different approach",
      "An outdated methodology",
      "A related but incorrect procedure",
      "The reverse sequence of steps"
    ];
    
    return this.selectRandomDistractors(distractors, 3);
  }

  static generateComparisonDistractors(term1, term2, correctDifference) {
    const distractors = [
      `They are exactly the same`,
      `${term1} is faster than ${term2}`,
      `${term2} is more efficient than ${term1}`,
      `There is no significant difference`
    ];
    
    return this.selectRandomDistractors(distractors, 3);
  }

  static generateFactDistractors(correctStatement) {
    return ['False', 'Partially true', 'Not mentioned'];
  }

  static generateApplicationDistractors(correctApplication) {
    const distractors = [
      "Data analysis",
      "System optimization",
      "User interface design",
      "Network security"
    ];
    
    return this.selectRandomDistractors(distractors, 3);
  }

  // Utility methods
  static selectRandomDistractors(distractors, count) {
    const shuffled = [...distractors].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static findCorrectAnswerIndex(options, correctAnswer) {
    return options.findIndex(option => option === correctAnswer);
  }

  static convertStatementToQuestion(statement) {
    // Simple conversion of statement to question
    if (statement.length < 10) return null;
    
    const firstWord = statement.split(' ')[0].toLowerCase();
    if (['the', 'a', 'an'].includes(firstWord)) {
      return `Which of the following is true?`;
    }
    
    return `Based on the content, which statement is correct?`;
  }

  static extractApplication(sentence) {
    // Extract the main application from the sentence
    const match = sentence.match(/(?:used for|applied in|utilized for|employed in)\s+([^.!?]+)/i);
    return match ? match[1].trim() : "Various applications";
  }

  static removeDuplicateQuestions(questions) {
    const seen = new Set();
    return questions.filter(question => {
      const key = question.question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  static estimateSlideCount(text) {
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 100));
  }
}

export default QuizGenerator;
