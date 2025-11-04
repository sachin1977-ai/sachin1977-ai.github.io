// Sample data structure for problems
let problems = JSON.parse(localStorage.getItem('problems')) || [];

// DOM Elements
const problemForm = document.getElementById('problemForm');
const problemsList = document.getElementById('problemsList');
const filterButtons = document.querySelectorAll('.filter-btn');

// Chart instance
let progressChart;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderProblems();
    updateStatistics();
    initializeChart();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    problemForm.addEventListener('submit', handleProblemSubmit);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
}

// Handle problem form submission
function handleProblemSubmit(e) {
    e.preventDefault();
    
    const problemData = {
        id: Date.now().toString(),
        title: document.getElementById('problemTitle').value,
        link: document.getElementById('problemLink').value,
        date: document.getElementById('problemDate').value,
        difficulty: document.getElementById('difficulty').value,
        solution: document.getElementById('solution').value,
        timeComplexity: document.getElementById('timeComplexity').value,
        spaceComplexity: document.getElementById('spaceComplexity').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    problems.unshift(problemData); // Add to beginning for latest first
    saveProblems();
    renderProblems();
    updateStatistics();
    updateChart();
    problemForm.reset();
    
    alert('Problem added successfully!');
}

// Handle filter clicks
function handleFilterClick(e) {
    const difficulty = e.target.dataset.difficulty;
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    renderProblems(difficulty);
}

// Render problems to the DOM
function renderProblems(difficultyFilter = 'all') {
    problemsList.innerHTML = '';
    
    const filteredProblems = difficultyFilter === 'all' 
        ? problems 
        : problems.filter(problem => problem.difficulty === difficultyFilter);
    
    if (filteredProblems.length === 0) {
        problemsList.innerHTML = '<p class="no-problems">No problems found. Add your first problem!</p>';
        return;
    }
    
    filteredProblems.forEach(problem => {
        const problemCard = createProblemCard(problem);
        problemsList.appendChild(problemCard);
    });
}

// Create problem card element
function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = `problem-card ${problem.difficulty}`;
    
    card.innerHTML = `
        <div class="problem-header">
            <h3 class="problem-title">${problem.title}</h3>
            <span class="problem-difficulty difficulty-${problem.difficulty}">
                ${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </span>
        </div>
        <div class="problem-meta">
            <span class="problem-date"><i class="fas fa-calendar"></i> ${formatDate(problem.date)}</span>
            <span class="problem-complexity"><i class="fas fa-clock"></i> ${problem.timeComplexity}</span>
            <span class="problem-space"><i class="fas fa-memory"></i> ${problem.spaceComplexity}</span>
        </div>
        ${problem.tags.length > 0 ? `
            <div class="problem-tags">
                ${problem.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
        <div class="problem-solution">
            <p><strong>Solution Approach:</strong> ${problem.solution}</p>
        </div>
        <div class="problem-actions">
            <button class="action-btn view-btn" onclick="viewProblem('${problem.link}')">
                <i class="fas fa-external-link-alt"></i> View on LeetCode
            </button>
            <button class="action-btn delete-btn" onclick="deleteProblem('${problem.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// View problem on LeetCode
function viewProblem(link) {
    window.open(link, '_blank');
}

// Delete problem
function deleteProblem(id) {
    if (confirm('Are you sure you want to delete this problem?')) {
        problems = problems.filter(problem => problem.id !== id);
        saveProblems();
        renderProblems();
        updateStatistics();
        updateChart();
    }
}

// Save problems to localStorage
function saveProblems() {
    localStorage.setItem('problems', JSON.stringify(problems));
}

// Update statistics
function updateStatistics() {
    const totalProblems = problems.length;
    const easyProblems = problems.filter(p => p.difficulty === 'easy').length;
    const mediumProblems = problems.filter(p => p.difficulty === 'medium').length;
    const hardProblems = problems.filter(p => p.difficulty === 'hard').length;
    
    document.getElementById('totalProblems').textContent = totalProblems;
    document.getElementById('easyProblems').textContent = easyProblems;
    document.getElementById('mediumProblems').textContent = mediumProblems;
    document.getElementById('hardProblems').textContent = hardProblems;
}

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    const data = getChartData();
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Problems Solved',
                data: data.counts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update chart data
function updateChart() {
    const data = getChartData();
    progressChart.data.labels = data.labels;
    progressChart.data.datasets[0].data = data.counts;
    progressChart.update();
}

// Get chart data from problems
function getChartData() {
    // Group problems by date
    const problemsByDate = {};
    
    problems.forEach(problem => {
        if (problemsByDate[problem.date]) {
            problemsByDate[problem.date]++;
        } else {
            problemsByDate[problem.date] = 1;
        }
    });
    
    // Sort dates and prepare data
    const sortedDates = Object.keys(problemsByDate).sort();
    const cumulativeCounts = [];
    let total = 0;
    
    sortedDates.forEach(date => {
        total += problemsByDate[date];
        cumulativeCounts.push(total);
    });
    
    return {
        labels: sortedDates.map(date => formatDate(date)),
        counts: cumulativeCounts
    };
}

// Utility functions
function scrollToProblems() {
    document.getElementById('problems').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Add some sample data if empty
if (problems.length === 0) {
    problems = [
        {
            id: '1',
            title: 'Two Sum',
            link: 'https://leetcode.com/problems/two-sum/',
            date: new Date().toISOString().split('T')[0],
            difficulty: 'easy',
            solution: 'Used hash map to store numbers and their indices. For each number, check if complement exists in map.',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
            tags: ['Array', 'Hash Table']
        }
    ];
    saveProblems();
}