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
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'status-modal';
    modal.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 24px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
    `;

    // Get current status
    const currentReport = allReports.find(r => r.id === reportId);
    const currentStatus = currentReport?.status || 'Pending';

    modal.innerHTML = `
        <h3 style="color: #2c3e50; margin-bottom: 1rem; text-align: center; font-size: 1.5rem;">
            📝 Update Report Status
        </h3>
        <p style="color: #64748b; margin-bottom: 2rem; text-align: center;">
            Current status: <strong>${currentStatus}</strong>
        </p>
        <div style="margin-bottom: 2rem;">
            <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #374151;">
                Select new status:
            </label>
            <select id="status-dropdown" style="
                width: 100%;
                padding: 16px 20px;
                border: 2px solid rgba(103, 126, 234, 0.2);
                border-radius: 16px;
                font-size: 1rem;
                background: rgba(255, 255, 255, 0.8);
                color: #2c3e50;
                transition: all 0.3s ease;
            ">
                <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>🔄 In Progress</option>
                <option value="Resolved" ${currentStatus === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
        </div>
        <div style="display: flex; gap: 1rem;">
            <button id="cancel-btn" style="
                flex: 1;
                padding: 12px 24px;
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                Cancel
            </button>
            <button id="update-btn" style="
                flex: 1;
                padding: 12px 24px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                Update Status
            </button>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Add hover effects
    const cancelBtn = modal.querySelector('#cancel-btn');
    const updateBtn = modal.querySelector('#update-btn');
    const statusDropdown = modal.querySelector('#status-dropdown');

    cancelBtn.addEventListener('mouseover', () => {
        cancelBtn.style.transform = 'translateY(-2px)';
        cancelBtn.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
    });

    cancelBtn.addEventListener('mouseout', () => {
        cancelBtn.style.transform = 'translateY(0)';
        cancelBtn.style.boxShadow = 'none';
    });

    updateBtn.addEventListener('mouseover', () => {
        updateBtn.style.transform = 'translateY(-2px)';
        updateBtn.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
    });

    updateBtn.addEventListener('mouseout', () => {
        updateBtn.style.transform = 'translateY(0)';
        updateBtn.style.boxShadow = 'none';
    });

    statusDropdown.addEventListener('focus', () => {
        statusDropdown.style.borderColor = '#667eea';
        statusDropdown.style.boxShadow = '0 0 0 4px rgba(103, 126, 234, 0.1)';
    });

    statusDropdown.addEventListener('blur', () => {
        statusDropdown.style.borderColor = 'rgba(103, 126, 234, 0.2)';
        statusDropdown.style.boxShadow = 'none';
    });

    // Handle cancel
    cancelBtn.addEventListener('click', () => {
        modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modalOverlay.remove(), 300);
    });

    // Handle outside click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modalOverlay.remove(), 300);
        }
    });

    // Handle update
    updateBtn.addEventListener('click', () => {
        const newStatus = statusDropdown.value;
        
        if (newStatus === currentStatus) {
            showError('Please select a different status');
            return;
        }

        // Show loading state
        updateBtn.innerHTML = '<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite; margin-right: 8px;"></span>Updating...';
        updateBtn.disabled = true;

        db.collection("reports").doc(reportId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            showSuccess(`Report status updated to: ${newStatus}`);
            modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modalOverlay.remove(), 300);
            refreshReports();
        })
        .catch((error) => {
            console.error("Error updating report: ", error);
            showError('Failed to update report status.');
            updateBtn.innerHTML = 'Update Status';
            updateBtn.disabled = false;
        });
    });

    // Focus on dropdown
    setTimeout(() => statusDropdown.focus(), 100);

    // Add keyframe animations to document if not already added
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
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