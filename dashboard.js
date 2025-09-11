// Global variables
let map;
let allReports = [];
let markersGroup;

// Create floating particles
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!sessionStorage.getItem('isAdminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    createParticles();
    initializeFirebase();
    initializeMap();
    initializeEventListeners();
});

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCszCrDEQI3_L-QBOe1M3vEkmHncAZimGQ",
        authDomain: "sih-25-a57ae.firebaseapp.com",
        projectId: "sih-25-a57ae",
        storageBucket: "sih-25-a57ae.firebasestorage.app",
        messagingSenderId: "447925099014",
        appId: "1:447925099014:web:8d4003b39c4d62a4838187"
    };
    
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    loadReports();
}

function initializeMap() {
    map = L.map('map').setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    markersGroup = L.layerGroup().addTo(map);
}

function initializeEventListeners() {
    // Search functionality
    document.getElementById('search-input').addEventListener('input', filterReports);
    document.getElementById('status-filter').addEventListener('change', filterReports);
    document.getElementById('type-filter').addEventListener('change', filterReports);
}

function loadReports() {
    db.collection("reports").orderBy("timestamp", "desc").get()
        .then((querySnapshot) => {
            allReports = [];
            
            if (querySnapshot.empty) {
                showEmptyState();
                updateStats();
                return;
            }

            querySnapshot.forEach((doc) => {
                const report = doc.data();
                report.id = doc.id;
                allReports.push(report);
            });

            displayReports(allReports);
            updateMap();
            updateStats();
        })
        .catch((error) => {
            console.error("Error fetching reports: ", error);
            showError('Could not fetch reports. Please try again.');
        });
}

function displayReports(reports) {
    const reportList = document.getElementById('report-list');
    
    if (reports.length === 0) {
        reportList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No reports found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    reportList.innerHTML = '';
    
    reports.forEach(report => {
        const reportCard = createReportCard(report);
        reportList.appendChild(reportCard);
    });
}

function createReportCard(report) {
    const reportCard = document.createElement('div');
    reportCard.className = 'report-card';
    reportCard.setAttribute('data-id', report.id);

    const date = report.timestamp ? report.timestamp.toDate().toLocaleString() : 'N/A';
    const statusClass = getStatusClass(report.status || 'Pending');
    const typeEmoji = getTypeEmoji(report.type);

    reportCard.innerHTML = `
        <img src="${report.photo || '/api/placeholder/120/120'}" alt="Issue photo" class="report-photo">
        <div class="report-details">
            <h3>${typeEmoji} ${report.type}</h3>
            <p>${report.description}</p>
            <small>📅 Submitted: ${date}</small>
            <div class="status ${statusClass}">${report.status || 'Pending'}</div>
        </div>
        <div class="report-actions">
            <button class="action-btn btn-update" onclick="updateReportStatus('${report.id}')">
                📝 Update Status
            </button>
            <button class="action-btn btn-delete" onclick="deleteReport('${report.id}')">
                🗑️ Delete
            </button>
        </div>
    `;

    return reportCard;
}

function updateMap() {
    markersGroup.clearLayers();

    allReports.forEach(report => {
        if (report.lat && report.lon) {
            const marker = L.marker([report.lat, report.lon]);
            const typeEmoji = getTypeEmoji(report.type);
            
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4>${typeEmoji} ${report.type}</h4>
                    <p>${report.description}</p>
                    <small>Status: <strong>${report.status || 'Pending'}</strong></small>
                </div>
            `);
            
            markersGroup.addLayer(marker);
        }
    });
}

function updateStats() {
    const total = allReports.length;
    const pending = allReports.filter(r => (r.status || 'Pending') === 'Pending').length;
    const inProgress = allReports.filter(r => r.status === 'In Progress').length;
    const resolved = allReports.filter(r => r.status === 'Resolved').length;

    animateCountUp('total-reports', total);
    animateCountUp('pending-reports', pending);
    animateCountUp('progress-reports', inProgress);
    animateCountUp('resolved-reports', resolved);
}

function animateCountUp(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

function filterReports() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const typeFilter = document.getElementById('type-filter').value;

    const filtered = allReports.filter(report => {
        const matchesSearch = !searchTerm || 
            report.type.toLowerCase().includes(searchTerm) ||
            report.description.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || 
            (report.status || 'Pending') === statusFilter;
        
        const matchesType = !typeFilter || report.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    displayReports(filtered);
}

function updateReportStatus(reportId) {
    const newStatus = prompt('Enter new status (Pending, In Progress, Resolved):');
    if (!newStatus) return;

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(newStatus)) {
        showError('Invalid status. Please use: Pending, In Progress, or Resolved');
        return;
    }

    db.collection("reports").doc(reportId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showSuccess('Report status updated successfully!');
        refreshReports();
    })
    .catch((error) => {
        console.error("Error updating report: ", error);
        showError('Failed to update report status.');
    });
}

function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        return;
    }

    db.collection("reports").doc(reportId).delete()
        .then(() => {
            showSuccess('Report deleted successfully!');
            refreshReports();
        })
        .catch((error) => {
            console.error("Error deleting report: ", error);
            showError('Failed to delete report.');
        });
}

function refreshReports() {
    document.getElementById('report-list').innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Refreshing reports...</p>
        </div>
    `;
    loadReports();
}

function showEmptyState() {
    document.getElementById('report-list').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No reports yet</h3>
            <p>Reports will appear here once citizens start submitting issues</p>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function getStatusClass(status) {
    switch(status) {
        case 'Pending': return 'pending';
        case 'In Progress': return 'in-progress';
        case 'Resolved': return 'resolved';
        default: return 'pending';
    }
}

function getTypeEmoji(type) {
    const emojiMap = {
        'Pothole': '🕳️',
        'Broken Streetlight': '💡',
        'Overflowing Bin': '🗑️',
        'Graffiti': '🎨',
        'Broken Sidewalk': '🚶',
        'Traffic Signal': '🚦',
        'Water Leak': '💧',
        'Other': '❓'
    };
    return emojiMap[type] || '❓';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'login.html';
    }
}

// Auto-refresh every 5 minutes
setInterval(() => {
    loadReports();
}, 300000);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshReports();
    }
});