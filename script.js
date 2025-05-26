// Mock data
const mockDetectionResults = [
    { item: 'Knife', confidence: 94, riskLevel: 'high', coordinates: { x: 120, y: 80, width: 60, height: 40 } },
    { item: 'Suspicious Package', confidence: 78, riskLevel: 'medium', coordinates: { x: 200, y: 150, width: 80, height: 50 } },
    { item: 'Person', confidence: 99, riskLevel: 'low', coordinates: { x: 50, y: 100, width: 100, height: 200 } }
];

const mockLogs = [
    { id: '1', timestamp: '2024-01-26 14:32:15', riskLevel: 'high', threatCount: 2, fileName: 'security_cam_01.jpg', status: 'completed' },
    { id: '2', timestamp: '2024-01-26 14:28:42', riskLevel: 'medium', threatCount: 1, fileName: 'entrance_video.mp4', status: 'completed' },
    { id: '3', timestamp: '2024-01-26 14:25:18', riskLevel: 'low', threatCount: 0, fileName: 'lobby_scan.jpg', status: 'completed' },
    { id: '4', timestamp: '2024-01-26 14:22:03', riskLevel: 'high', threatCount: 3, fileName: 'baggage_check.jpg', status: 'completed' },
    { id: '5', timestamp: '2024-01-26 14:18:55', riskLevel: 'medium', threatCount: 1, fileName: 'perimeter_vid.mp4', status: 'processing' }
];

// Global variables
let currentFile = null;
let isAnalyzing = false;

// DevTools protection
(function() {
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });

    // Detect DevTools
    let devtools = {
        open: false,
        orientation: null
    };

    const threshold = 160;

    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:Arial;"><h1>Access Denied</h1></div>';
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderActivityLogs();
    updateThreatCounter(0);
}

function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    currentFile = file;
    
    // Hide upload area and show preview
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('filePreview').style.display = 'block';
    
    // Update file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    
    // Update file icon
    const fileIcon = document.getElementById('fileTypeIcon');
    if (file.type.startsWith('image/')) {
        fileIcon.className = 'fas fa-image';
    } else if (file.type.startsWith('video/')) {
        fileIcon.className = 'fas fa-video';
    }
    
    // Show preview
    showPreview(file);
    
    // Start analysis
    startAnalysis();
}

function showPreview(file) {
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    
    if (file.type.startsWith('image/')) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
        videoPreview.style.display = 'none';
    } else if (file.type.startsWith('video/')) {
        videoPreview.src = URL.createObjectURL(file);
        videoPreview.style.display = 'block';
        imagePreview.style.display = 'none';
    }
}

function startAnalysis() {
    isAnalyzing = true;
    document.getElementById('analysisProgress').style.display = 'block';
    document.getElementById('resultsCard').style.display = 'none';
    
    // Simulate analysis progress
    setTimeout(() => {
        completeAnalysis();
    }, 3000);
}

function completeAnalysis() {
    isAnalyzing = false;
    document.getElementById('analysisProgress').style.display = 'none';
    
    // Show detection results
    showDetectionResults();
    
    // Update threat counter and risk badge
    const threatCount = mockDetectionResults.filter(r => r.riskLevel === 'high' || r.riskLevel === 'medium').length;
    updateThreatCounter(threatCount);
    updateRiskBadge('high');
    
    // Show detection overlays for images
    if (currentFile && currentFile.type.startsWith('image/')) {
        showDetectionOverlays();
    }
}

function showDetectionResults() {
    const resultsCard = document.getElementById('resultsCard');
    const resultsContainer = document.getElementById('detectionResults');
    
    resultsContainer.innerHTML = '';
    
    mockDetectionResults.forEach(result => {
        const resultElement = createDetectionResultElement(result);
        resultsContainer.appendChild(resultElement);
    });
    
    resultsCard.style.display = 'block';
}

function createDetectionResultElement(result) {
    const div = document.createElement('div');
    div.className = `detection-item ${result.riskLevel}`;
    
    const icon = result.riskLevel === 'high' ? 'fas fa-exclamation-triangle' :
                 result.riskLevel === 'medium' ? 'fas fa-exclamation-triangle' :
                 'fas fa-check-circle';
    
    div.innerHTML = `
        <div class="detection-header">
            <span>${result.item}</span>
            <i class="${icon}"></i>
        </div>
        <div class="confidence-info">
            <span>Confidence</span>
            <span>${result.confidence}%</span>
        </div>
        <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${result.confidence}%"></div>
        </div>
        <div class="confidence-info">
            <span>Risk Level</span>
            <span style="text-transform: capitalize">${result.riskLevel}</span>
        </div>
    `;
    
    return div;
}

function showDetectionOverlays() {
    const overlay = document.getElementById('detectionOverlay');
    overlay.innerHTML = '';
    
    mockDetectionResults.forEach(result => {
        if (result.coordinates) {
            const box = document.createElement('div');
            box.className = `detection-box ${result.riskLevel}`;
            box.style.left = result.coordinates.x + 'px';
            box.style.top = result.coordinates.y + 'px';
            box.style.width = result.coordinates.width + 'px';
            box.style.height = result.coordinates.height + 'px';
            
            const label = document.createElement('div');
            label.className = `detection-label ${result.riskLevel}`;
            label.textContent = result.item;
            
            box.appendChild(label);
            overlay.appendChild(box);
        }
    });
}

function updateThreatCounter(count) {
    document.getElementById('threatCount').textContent = count;
}

function updateRiskBadge(level) {
    const badge = document.getElementById('riskBadge');
    badge.className = `risk-badge ${level}`;
    
    const icon = level === 'high' ? 'fas fa-exclamation-triangle' :
                 level === 'medium' ? 'fas fa-exclamation-triangle' :
                 'fas fa-check-circle';
    
    const text = level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';
    
    badge.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
}

function renderActivityLogs() {
    const logsContainer = document.getElementById('activityLogs');
    
    mockLogs.forEach(log => {
        const logElement = createLogElement(log);
        logsContainer.appendChild(logElement);
    });
}

function createLogElement(log) {
    const div = document.createElement('div');
    div.className = 'log-item';
    
    const riskIcon = log.riskLevel === 'high' ? 'fas fa-exclamation-triangle' :
                     log.riskLevel === 'medium' ? 'fas fa-exclamation-triangle' :
                     'fas fa-check-circle';
    
    div.innerHTML = `
        <div class="log-header">
            <div class="log-risk ${log.riskLevel}">
                <i class="${riskIcon}"></i>
                <span style="text-transform: capitalize">${log.riskLevel}</span>
            </div>
            <div class="log-status ${log.status}">${log.status}</div>
        </div>
        <div class="log-filename">${log.fileName}</div>
        <div class="log-timestamp">${log.timestamp}</div>
        <div class="log-threats">Threats: ${log.threatCount}</div>
    `;
    
    return div;
}

function clearUpload() {
    currentFile = null;
    isAnalyzing = false;
    
    // Reset UI
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('resultsCard').style.display = 'none';
    document.getElementById('analysisProgress').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    // Reset counters
    updateThreatCounter(0);
    updateRiskBadge('low');
    
    // Clear previews
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    if (imagePreview.src) URL.revokeObjectURL(imagePreview.src);
    if (videoPreview.src) URL.revokeObjectURL(videoPreview.src);
    imagePreview.src = '';
    videoPreview.src = '';
    
    // Clear overlays
    document.getElementById('detectionOverlay').innerHTML = '';
}
