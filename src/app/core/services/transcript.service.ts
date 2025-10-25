import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface TranscriptResponse {
  transcript: string;
  summary: string;
  keywords: string[];
  duration: number;
}

/**
 * TranscriptService
 * Handles AI-based transcription and summarization of meeting audio
 * Currently uses mock data, but can be easily integrated with FastAPI backend
 */
@Injectable({
  providedIn: 'root'
})
export class TranscriptService {
  constructor() {}

  /**
   * Process audio blob and generate transcript and summary
   * TODO: Replace with actual FastAPI backend call
   * 
   * @param audioBlob - Audio file blob from recording
   * @param mentorName - Name of the mentor
   * @param studentName - Name of the student
   * @returns Observable with transcript, summary, and keywords
   */
  processAudio(
    audioBlob: Blob,
    mentorName: string,
    studentName: string
  ): Observable<TranscriptResponse> {
    // TODO: Replace this with actual API call to FastAPI backend
    // Example: return this.http.post<TranscriptResponse>('/api/transcribe', formData)
    
    const mockResponse = this.generateMockTranscriptResponse(mentorName, studentName);
    
    // Simulate API processing delay (2-3 seconds)
    return of(mockResponse).pipe(delay(2500));
  }

  /**
   * Generate mock transcript response for development
   * This simulates what the FastAPI backend would return
   */
  private generateMockTranscriptResponse(
    mentorName: string,
    studentName: string
  ): TranscriptResponse {
    const transcripts = [
      {
        transcript: `Mentor: Today's session focuses on career development and professional growth in tech.

Student: What skills should we prioritize as we enter the job market?

Mentor: Great question. Beyond technical skills, focus on communication, problem-solving, and collaboration. These soft skills are often what differentiate candidates.

Student: How important is having a portfolio?

Mentor: Very important. A strong portfolio demonstrates your abilities to potential employers. Include diverse projects that showcase different skills and technologies.

Student: Any advice on networking?

Mentor: Absolutely. Attend tech meetups, contribute to open-source projects, and connect with professionals on LinkedIn. Networking opens doors and provides valuable learning opportunities.

Student: What about continuous learning?

Mentor: The tech industry evolves rapidly. Dedicate time each week to learning new technologies and staying updated with industry trends. Follow tech blogs, podcasts, and online courses.`,
        summary: `**Meeting Summary**

**Overview:**
Career development session focusing on professional growth and industry readiness.

**Key Points:**
- Technical skills must be complemented by strong soft skills
- Portfolio projects should demonstrate diverse capabilities
- Networking is crucial for career opportunities
- Continuous learning is essential due to rapid industry evolution
- Open-source contributions provide valuable experience

**Action Items:**
1. Create or enhance portfolio with 3-5 diverse projects
2. Attend at least 2 tech meetups this month
3. Start contributing to open-source projects
4. Follow industry blogs and podcasts
5. Connect with 10 professionals on LinkedIn

**Next Steps:**
- Review portfolio projects and provide feedback
- Discuss internship and job opportunities
- Plan mentorship continuation for next semester`,
        keywords: ['career', 'portfolio', 'networking', 'skills', 'learning'],
        duration: 1234
      },
      {
        transcript: `Mentor: Welcome to today's feedback session. I want to discuss your recent project submissions and provide constructive feedback.

Student: Thank you for reviewing our work. We put a lot of effort into this project.

Mentor: I can see that. Your code structure is clean and well-organized. However, I noticed some areas for improvement in error handling and documentation.

Student: What specific areas should we focus on?

Mentor: First, add more comprehensive error handling for edge cases. Second, include docstrings for all functions. Third, consider adding unit tests to improve code reliability.

Student: How can we improve our testing strategy?

Mentor: Start with unit tests for individual functions, then move to integration tests. Aim for at least 80% code coverage. Tools like pytest and coverage.py can help you track this.

Student: Should we refactor the existing code?

Mentor: Yes, I'd recommend a gradual refactoring approach. Start with the most critical sections and work your way through. This will help you learn best practices while improving the codebase.`,
        summary: `**Meeting Summary**

**Overview:**
This was a productive feedback session covering key topics in software development and professional growth.

**Key Points:**
- Code structure and organization are strong, but error handling needs improvement
- Documentation through docstrings is essential for maintainability
- Unit testing should target at least 80% code coverage
- Soft skills (communication, collaboration) are as important as technical skills
- Building a strong portfolio is crucial for career advancement

**Action Items:**
1. Implement comprehensive error handling for edge cases
2. Add docstrings to all functions
3. Increase unit test coverage to 80%
4. Start contributing to open-source projects
5. Build portfolio projects showcasing diverse skills

**Next Steps:**
- Schedule follow-up session in 2 weeks to review progress
- Share recommended learning resources
- Discuss internship opportunities in the field`,
        keywords: ['code', 'testing', 'documentation', 'refactoring', 'quality'],
        duration: 1567
      },
      {
        transcript: `Mentor: Good morning, everyone. Today we're going to discuss the latest developments in machine learning and artificial intelligence.

Student: Thank you for having us. I've been curious about the practical applications of neural networks.

Mentor: Great question. Neural networks have revolutionized many fields. Let me walk you through some real-world examples. In computer vision, they're used for image recognition, medical diagnosis, and autonomous vehicles.

Student: How do we ensure the models are fair and unbiased?

Mentor: Excellent point. Bias in AI is a critical concern. We need to carefully curate training data, regularly audit models, and implement fairness metrics. This is an ongoing challenge in the field.

Student: What about the computational resources required?

Mentor: That's another important consideration. Training large models requires significant GPU resources. However, techniques like transfer learning and model compression can help reduce these requirements.

Student: Can you recommend some resources for further learning?

Mentor: Absolutely. I'd suggest starting with Andrew Ng's Machine Learning course, then moving to more advanced topics like deep learning with TensorFlow or PyTorch.`,
        summary: `**Meeting Summary**

**Overview:**
Discussion on machine learning applications, bias in AI, and computational considerations.

**Key Points:**
- Neural networks have diverse applications: image recognition, medical diagnosis, autonomous vehicles
- Bias in AI requires careful data curation and regular model audits
- Transfer learning and model compression can reduce computational requirements
- Fairness metrics are essential for responsible AI development
- Continuous learning is critical in this rapidly evolving field

**Action Items:**
1. Enroll in Andrew Ng's Machine Learning course
2. Explore TensorFlow and PyTorch frameworks
3. Study fairness and bias mitigation techniques
4. Implement a small ML project with proper evaluation metrics
5. Join AI/ML community groups for networking

**Next Steps:**
- Provide curated list of learning resources
- Discuss potential research topics
- Plan hands-on workshop on model evaluation`,
        keywords: ['machine learning', 'AI', 'neural networks', 'bias', 'fairness'],
        duration: 1890
      }
    ];

    const randomIndex = Math.floor(Math.random() * transcripts.length);
    return transcripts[randomIndex];
  }

  /**
   * Extract keywords from transcript
   * TODO: Replace with actual NLP processing from backend
   */
  extractKeywords(transcript: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i',
      'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when',
      'where', 'why', 'how'
    ]);

    const words = transcript
      .toLowerCase()
      .split(/\s+/)
      .filter(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        return cleanWord.length > 4 && !commonWords.has(cleanWord);
      })
      .map(word => word.replace(/[^\w]/g, ''));

    // Get unique words and limit to top 10
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 10);
  }

  /**
   * Calculate sentiment from transcript
   * TODO: Replace with actual sentiment analysis from backend
   */
  analyzeSentiment(transcript: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'perfect'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing'];

    const lowerTranscript = transcript.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerTranscript.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerTranscript.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

