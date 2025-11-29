// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const processingState = document.getElementById('processingState');
const resultsSection = document.getElementById('resultsSection');
const questionsList = document.getElementById('questionsList');
const progressFill = document.getElementById('progressFill');
const editQuizBtn = document.getElementById('editQuizBtn');
const exportQuizBtn = document.getElementById('exportQuizBtn');
const shareQuizBtn = document.getElementById('shareQuizBtn');
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const cancelEdit = document.getElementById('cancelEdit');
const saveChanges = document.getElementById('saveChanges');
const modalQuestions = document.getElementById('modalQuestions');

// Current quiz data
let currentQuiz = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Upload zone interactions
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Button events
    editQuizBtn.addEventListener('click', openEditModal);
    closeModal.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);
    saveChanges.addEventListener('click', saveQuizChanges);
    exportQuizBtn.addEventListener('click', exportQuiz);
    shareQuizBtn.addEventListener('click', shareQuiz);
});

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// File Processing
async function processFile(file) {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
                       'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF or PowerPoint file');
        return;
    }

    // Show processing state
    uploadZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    
    // Simulate progress
    simulateProgress();
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload to backend
        const response = await fetch('https://quizapp-tn4l.onrender.com/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentQuiz = result;
            displayResults(result);
        } else {
            throw new Error(result.error || 'Failed to process file');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error processing file: ' + error.message);
        resetUploader();
    }
}

function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressFill.style.width = progress + '%';
    }, 200);
}

function displayResults(data) {
    processingState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Update stats
    document.getElementById('questionCount').textContent = 
        data.questions.length + ' Questions';
    
    // Display questions
    questionsList.innerHTML = '';
    data.questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index);
        questionsList.appendChild(questionElement);
    });
}

function createQuestionElement(question, index) {
    const div = document.createElement('div');
    div.className = 'question-item';
    div.innerHTML = `
        <div class="question-text">${index + 1}. ${question.question}</div>
        <div class="options-list">
            ${question.options.map((option, optIndex) => `
                <div class="option ${optIndex === question.correctAnswer ? 'correct' : ''}">
                    ${String.fromCharCode(65 + optIndex)}. ${option}
                </div>
            `).join('')}
        </div>
    `;
    return div;
}

// Edit Modal Functions
function openEditModal() {
    if (!currentQuiz) return;
    
    modalQuestions.innerHTML = '';
    currentQuiz.questions.forEach((question, qIndex) => {
        const questionEditor = createQuestionEditor(question, qIndex);
        modalQuestions.appendChild(questionEditor);
    });
    
    editModal.classList.remove('hidden');
}

function createQuestionEditor(question, qIndex) {
    const div = document.createElement('div');
    div.className = 'question-editor';
    div.innerHTML = `
        <div class="editor-header">
            <h4>Question ${qIndex + 1}</h4>
            <button class="btn-danger" onclick="deleteQuestion(${qIndex})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <textarea class="question-input" data-index="${qIndex}" 
                  placeholder="Enter question text...">${question.question}</textarea>
        <div class="options-editor">
            <h5>Options:</h5>
            ${question.options.map((option, oIndex) => `
                <div class="option-editor">
                    <input type="radio" name="correct-${qIndex}" 
                           ${oIndex === question.correctAnswer ? 'checked' : ''} 
                           onchange="setCorrectAnswer(${qIndex}, ${oIndex})">
                    <input type="text" class="option-input" 
                           data-qindex="${qIndex}" data-oindex="${oIndex}"
                           value="${option}" placeholder="Option ${oIndex + 1}">
                </div>
            `).join('')}
        </div>
    `;
    return div;
}

function setCorrectAnswer(qIndex, oIndex) {
    currentQuiz.questions[qIndex].correctAnswer = oIndex;
}

function deleteQuestion(qIndex) {
    if (confirm('Are you sure you want to delete this question?')) {
        currentQuiz.questions.splice(qIndex, 1);
        openEditModal(); // Refresh the modal
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
}

function saveQuizChanges() {
    // Update questions from inputs
    const questionInputs = modalQuestions.querySelectorAll('.question-input');
    questionInputs.forEach(input => {
        const qIndex = parseInt(input.dataset.index);
        currentQuiz.questions[qIndex].question = input.value;
    });
    
    // Update options
    const optionInputs = modalQuestions.querySelectorAll('.option-input');
    optionInputs.forEach(input => {
        const qIndex = parseInt(input.dataset.qindex);
        const oIndex = parseInt(input.dataset.oindex);
        currentQuiz.questions[qIndex].options[oIndex] = input.value;
    });
    
    closeEditModal();
    displayResults(currentQuiz); // Refresh display
}

// Export and Share Functions
function exportQuiz() {
    if (!currentQuiz) return;
    
    // Create PDF content
    const quizContent = generateQuizPDF();
    
    // Create blob and download
    const blob = new Blob([quizContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateQuizPDF() {
    // Simplified PDF generation
    // In production, use a library like jsPDF
    return `
        Quiz Generated from ${currentQuiz.fileName}
        Total Questions: ${currentQuiz.questions.length}
        
        ${currentQuiz.questions.map((q, index) => `
        ${index + 1}. ${q.question}
        ${q.options.map((opt, optIndex) => 
            `${String.fromCharCode(65 + optIndex)}. ${opt}${optIndex === q.correctAnswer ? ' (Correct)' : ''}`
        ).join('\n')}
        `).join('\n\n')}
    `;
}

function shareQuiz() {
    if (!currentQuiz) return;
    
    // Generate shareable link (simulated)
    const quizId = generateQuizId();
    const shareUrl = `${window.location.origin}/quiz/${quizId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Quiz link copied to clipboard!');
    }).catch(() => {
        prompt('Copy this link to share:', shareUrl);
    });
}

function generateQuizId() {
    return Math.random().toString(36).substr(2, 9);
}

function resetUploader() {
    processingState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    uploadZone.classList.remove('hidden');
    fileInput.value = '';
    currentQuiz = null;
}

// Sample data for demonstration
const sampleQuiz = {
    fileName: "sample-presentation.pptx",
    totalSlides: 8,
    questions: [
        {
            question: "What is the primary function of mitochondria in cells?",
            options: [
                "Protein synthesis",
                "Energy production",
                "DNA replication",
                "Waste elimination"
            ],
            correctAnswer: 1,
            explanation: "Mitochondria are known as the powerhouses of the cell, responsible for producing energy through cellular respiration."
        },
        {
            question: "Which programming language is primarily used for web development?",
            options: [
                "Python",
                "Java",
                "JavaScript",
                "C++"
            ],
            correctAnswer: 2,
            explanation: "JavaScript is the primary language for client-side web development and interactive web applications."
        }
    ]
};
