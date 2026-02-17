# MONGODB COLLECTIONS - Flexible Schema Data

MongoDB-д flexible schema бүхий, nested structure-тай өгөгдлийг хадгална. Эдгээр нь PostgreSQL-тэй id-гаар холбогдоно.

## 1. COURSE_CONTENT Collection

Курсын агуулга, контентын мэдээлэл - энэ нь курс бүрт өөр өөр бүтэцтэй байж болно.

```javascript
{
  _id: ObjectId,
  course_id: "uuid-from-postgresql",  // Reference
  sections: [
    {
      section_id: ObjectId,
      title: "Introduction to React",
      order_index: 1,
      lessons: [
        {
          lesson_id: "uuid-from-postgresql",  // Reference
          content_type: "video",
          content: {
            video_url: "https://r2.../course-1/lesson-1.mp4",
            thumbnail_url: "https://r2.../thumbnails/lesson-1.jpg",
            duration_seconds: 1200,
            transcoded_versions: [
              {
                quality: "1080p",
                url: "https://r2.../1080p/lesson-1.m3u8",
                bitrate: "5000kbps"
              },
              {
                quality: "720p",
                url: "https://r2.../720p/lesson-1.m3u8",
                bitrate: "2500kbps"
              },
              {
                quality: "480p",
                url: "https://r2.../480p/lesson-1.m3u8",
                bitrate: "1000kbps"
              }
            ],
            subtitles: [
              {
                language: "en",
                url: "https://r2.../subtitles/lesson-1-en.vtt"
              },
              {
                language: "mn",
                url: "https://r2.../subtitles/lesson-1-mn.vtt"
              }
            ]
          }
        },
        {
          lesson_id: "uuid-from-postgresql",
          content_type: "text",
          content: {
            html: "<h1>Introduction</h1><p>Welcome to...</p>",
            markdown: "# Introduction\n\nWelcome to...",
            reading_time_minutes: 5,
            attachments: [
              {
                filename: "notes.pdf",
                url: "https://r2.../attachments/notes.pdf",
                size_bytes: 102400
              }
            ]
          }
        }
      ]
    }
  ],
  created_at: ISODate("2026-02-16T10:00:00Z"),
  updated_at: ISODate("2026-02-16T10:00:00Z")
}
```

## 2. QUIZ_QUESTIONS Collection

Асуултын сан - төрөл бүрийн асуулт, flexible structure

```javascript
{
  _id: ObjectId,
  quiz_id: "uuid-from-postgresql",  // Reference
  questions: [
    {
      question_id: ObjectId,
      type: "multiple_choice",
      question_text: "What is React?",
      points: 10,
      order_index: 1,
      options: [
        {
          option_id: "a",
          text: "A JavaScript library",
          is_correct: true
        },
        {
          option_id: "b",
          text: "A programming language",
          is_correct: false
        },
        {
          option_id: "c",
          text: "A database",
          is_correct: false
        },
        {
          option_id: "d",
          text: "An operating system",
          is_correct: false
        }
      ],
      explanation: "React is a JavaScript library for building user interfaces.",
      difficulty: "easy",
      tags: ["javascript", "react", "basics"]
    },
    {
      question_id: ObjectId,
      type: "true_false",
      question_text: "React uses a virtual DOM.",
      points: 5,
      order_index: 2,
      correct_answer: true,
      explanation: "React uses a virtual DOM to optimize rendering."
    },
    {
      question_id: ObjectId,
      type: "fill_blank",
      question_text: "React was created by ______.",
      points: 5,
      order_index: 3,
      correct_answers: ["Facebook", "Meta"],
      case_sensitive: false
    },
    {
      question_id: ObjectId,
      type: "code_challenge",
      question_text: "Write a function to reverse a string",
      points: 20,
      order_index: 4,
      language: "javascript",
      starter_code: "function reverse(str) {\n  // Your code here\n}",
      test_cases: [
        {
          input: "hello",
          expected_output: "olleh"
        },
        {
          input: "world",
          expected_output: "dlrow"
        },
        {
          input: "React",
          expected_output: "tcaeR"
        }
      ],
      solution: "function reverse(str) {\n  return str.split('').reverse().join('');\n}"
    },
    {
      question_id: ObjectId,
      type: "essay",
      question_text: "Explain the concept of state management in React.",
      points: 25,
      order_index: 5,
      min_words: 100,
      max_words: 500,
      rubric: {
        criteria: [
          {
            name: "Understanding",
            points: 10,
            description: "Demonstrates clear understanding of state"
          },
          {
            name: "Examples",
            points: 10,
            description: "Provides relevant examples"
          },
          {
            name: "Clarity",
            points: 5,
            description: "Clear and well-structured writing"
          }
        ]
      }
    }
  ],
  created_at: ISODate("2026-02-16T10:00:00Z"),
  updated_at: ISODate("2026-02-16T10:00:00Z")
}
```

## 3. QUIZ_ANSWERS Collection

Сурагчийн хариултууд - nested structure

```javascript
{
  _id: ObjectId,
  attempt_id: "uuid-from-postgresql",  // Reference
  user_id: "uuid-from-postgresql",
  quiz_id: "uuid-from-postgresql",
  answers: [
    {
      question_id: ObjectId,
      answer_data: {
        type: "multiple_choice",
        selected_option: "a",
        is_correct: true,
        points_earned: 10,
        time_spent_seconds: 15
      }
    },
    {
      question_id: ObjectId,
      answer_data: {
        type: "code_challenge",
        submitted_code: "function reverse(str) { return str.split('').reverse().join(''); }",
        test_results: [
          { test_case: 0, passed: true },
          { test_case: 1, passed: true },
          { test_case: 2, passed: true }
        ],
        is_correct: true,
        points_earned: 20,
        time_spent_seconds: 180
      }
    },
    {
      question_id: ObjectId,
      answer_data: {
        type: "essay",
        submitted_text: "State management in React...",
        word_count: 250,
        points_earned: 20,  // Manually graded
        graded_by: "uuid-instructor",
        graded_at: ISODate("2026-02-17T14:30:00Z"),
        feedback: "Good explanation, but could include more examples.",
        rubric_scores: [
          { criterion: "Understanding", points: 8 },
          { criterion: "Examples", points: 7 },
          { criterion: "Clarity", points: 5 }
        ]
      }
    }
  ],
  submitted_at: ISODate("2026-02-16T11:00:00Z"),
  graded_at: ISODate("2026-02-17T14:30:00Z")
}
```

## 4. DISCUSSION_POSTS Collection

Форум, хэлэлцүүлэг, Q&A

```javascript
{
  _id: ObjectId,
  course_id: "uuid-from-postgresql",
  lesson_id: "uuid-from-postgresql",  // nullable
  thread_id: ObjectId,  // Self-reference for nested replies
  author_id: "uuid-from-postgresql",
  post_type: "question",  // question, answer, discussion, comment
  title: "How to use useEffect?",  // Only for top-level posts
  content: "I'm confused about when to use useEffect...",
  content_html: "<p>I'm confused about when to use useEffect...</p>",
  is_answered: false,  // For Q&A type
  accepted_answer_id: ObjectId,  // nullable
  upvotes: 15,
  downvotes: 2,
  vote_score: 13,
  replies: [
    {
      reply_id: ObjectId,
      author_id: "uuid-from-postgresql",
      content: "useEffect is used for side effects...",
      content_html: "<p>useEffect is used for side effects...</p>",
      upvotes: 8,
      downvotes: 0,
      is_accepted: false,
      created_at: ISODate("2026-02-16T12:30:00Z"),
      updated_at: ISODate("2026-02-16T12:30:00Z")
    }
  ],
  tags: ["react", "hooks", "useEffect"],
  views_count: 245,
  is_pinned: false,
  is_locked: false,
  is_flagged: false,
  flag_reason: null,
  created_at: ISODate("2026-02-16T12:00:00Z"),
  updated_at: ISODate("2026-02-16T14:00:00Z")
}
```

## 5. LESSON_COMMENTS Collection

Хичээл дээрх comment - timestamp-тай (видеонд)

```javascript
{
  _id: ObjectId,
  lesson_id: "uuid-from-postgresql",
  user_id: "uuid-from-postgresql",
  parent_comment_id: ObjectId,  // nullable, for threaded comments
  content: "Great explanation at 5:30!",
  timestamp_seconds: 330,  // For video comments, null for text lessons
  upvotes: 5,
  replies: [
    {
      reply_id: ObjectId,
      user_id: "uuid-from-postgresql",
      content: "I agree, that part was very clear",
      upvotes: 2,
      created_at: ISODate("2026-02-16T15:30:00Z")
    }
  ],
  is_instructor_reply: false,
  created_at: ISODate("2026-02-16T15:00:00Z"),
  updated_at: ISODate("2026-02-16T15:00:00Z")
}
```

## 6. COURSE_REVIEWS Collection

Курсын үнэлгээ, сэтгэгдэл

```javascript
{
  _id: ObjectId,
  course_id: "uuid-from-postgresql",
  user_id: "uuid-from-postgresql",
  enrollment_id: "uuid-from-postgresql",  // Verify user enrolled
  rating: 5,  // 1-5 stars
  review_title: "Excellent course for beginners!",
  review_text: "I learned so much from this course...",
  helpful_count: 45,
  not_helpful_count: 2,
  instructor_response: {
    response_text: "Thank you for your feedback!",
    responded_at: ISODate("2026-02-17T10:00:00Z")
  },
  is_verified_purchase: true,
  is_featured: false,
  created_at: ISODate("2026-02-16T16:00:00Z"),
  updated_at: ISODate("2026-02-16T16:00:00Z")
}
```

## 7. ASSIGNMENT_SUBMISSIONS Collection

Даалгаврын submission

```javascript
{
  _id: ObjectId,
  lesson_id: "uuid-from-postgresql",
  user_id: "uuid-from-postgresql",
  submission_number: 1,  // For resubmissions
  content: {
    type: "file",  // file, text, code, url
    files: [
      {
        filename: "assignment.pdf",
        url: "https://r2.../submissions/user-1/assignment.pdf",
        size_bytes: 524288,
        mime_type: "application/pdf"
      }
    ],
    text_content: "My submission...",  // For text submissions
    code: "// Code submission",
    repository_url: "https://github.com/user/project"
  },
  status: "submitted",  // submitted, grading, graded, returned
  grade: {
    score: 85,
    max_score: 100,
    feedback: "Good work! Consider improving...",
    rubric_scores: [
      { criterion: "Completeness", points: 20, max: 25 },
      { criterion: "Code Quality", points: 40, max: 50 },
      { criterion: "Documentation", points: 25, max: 25 }
    ],
    graded_by: "uuid-instructor",
    graded_at: ISODate("2026-02-18T14:00:00Z")
  },
  submitted_at: ISODate("2026-02-17T20:00:00Z"),
  deadline: ISODate("2026-02-18T23:59:59Z"),
  is_late: false
}
```

## PostgreSQL ↔ MongoDB Холболтын загвар

### Хэрхэн холбогдох вэ:

1. **Course агуулга авах**:

```javascript
// 1. PostgreSQL-с курсын мэдээлэл
const course = await prisma.course.findUnique({
  where: { id: courseId },
});

// 2. MongoDB-с курсын агуулга
const courseContent = await mongodb.collection('course_content').findOne({ course_id: courseId });
```

2. **Хичээл үзэх**:

```javascript
// 1. PostgreSQL-с хичээлийн мэдээлэл
const lesson = await prisma.lesson.findUnique({
  where: { id: lessonId },
  include: { course: true },
});

// 2. MongoDB-с хичээлийн агуулга
const lessonContent = await mongodb
  .collection('course_content')
  .findOne({ course_id: lesson.courseId }, { projection: { 'sections.$[].lessons.$[lesson]': 1 } });
```

3. **Quiz оролцох**:

```javascript
// 1. PostgreSQL-с quiz мэдээлэл
const quiz = await prisma.quiz.findUnique({
  where: { id: quizId }
});

// 2. MongoDB-с асуултууд
const questions = await mongodb.collection('quiz_questions')
  .findOne({ quiz_id: quizId });

// 3. Хариулт хадгалах - MongoDB
await mongodb.collection('quiz_answers').insertOne({
  attempt_id: attemptId,
  user_id: userId,
  quiz_id: quizId,
  answers: [...],
  submitted_at: new Date()
});

// 4. Үр дүн хадгалах - PostgreSQL
await prisma.quizAttempt.create({
  data: {
    quizId, userId, score, maxScore, passed, ...
  }
});
```
