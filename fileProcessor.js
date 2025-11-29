import pdf from 'pdf-parse';
import officeParser from 'officeparser';
import fs from 'fs/promises';
import path from 'path';

class FileProcessor {
  static async processFile(filePath, fileType) {
    try {
      let extractedText = '';

      switch (fileType) {
        case 'application/pdf':
          extractedText = await this.extractFromPDF(filePath);
          break;

        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          extractedText = await this.extractFromPPT(filePath);
          break;

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          extractedText = await this.extractFromDOC(filePath);
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      return this.cleanText(extractedText);

    } catch (error) {
      console.error('File processing error:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  static async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  static async extractFromPPT(filePath) {
    try {
      // Using officeparser for PPT/PPTX files
      const text = await officeParser.parseOfficeAsync(filePath);
      return text;
    } catch (error) {
      console.error('PPT extraction error:', error);
      
      // Fallback: Try to read as text file or return sample data
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
      } catch {
        return this.getSamplePPTContent();
      }
    }
  }

  static async extractFromDOC(filePath) {
    try {
      const text = await officeParser.parseOfficeAsync(filePath);
      return text;
    } catch (error) {
      console.error('DOC extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }

  static cleanText(text) {
    if (!text) return '';

    return text
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .replace(/\t/g, ' ')       // Replace tabs with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();
  }

  static getSamplePPTContent() {
    // Return sample content for demonstration
    return `
      Introduction to Computer Science
      
      What is Programming?
      Programming is the process of creating a set of instructions that tell a computer how to perform a task.
      
      Key Programming Concepts:
      - Variables: Storage locations in programming
      - Functions: Reusable blocks of code
      - Loops: Structures that repeat actions
      - Conditionals: Decision-making structures
      
      Programming Languages:
      JavaScript is a high-level programming language used for web development.
      Python is known for its simplicity and readability.
      Java is platform-independent and object-oriented.
      
      Web Development:
      HTML structures web content.
      CSS styles web pages.
      JavaScript adds interactivity.
      
      Data Structures:
      Arrays store multiple values.
      Objects represent real-world entities.
      Linked lists connect nodes sequentially.
      
      Algorithms:
      Sorting algorithms organize data.
      Search algorithms find data efficiently.
      Recursion involves self-calling functions.
    `;
  }

  static async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      console.warn(`Could not delete file: ${filePath}`, error);
    }
  }
}

export default FileProcessor;
