document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
    // It must be the same config object as in app.js
   const firebaseConfig = {
    apiKey: "API-KEY",
    authDomain: "DOMAIN",
    projectId: "PROJECT-ID",
    storageBucket: "BUCKET",
    messagingSenderId: "SENDER-ID",
    appId: "APP-ID"
    };

    // --- 2. INITIALIZE FIREBASE AND FIRESTORE ---
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- Map initialization (remains the same) ---
    // Centered on Delhi, India. Change these coordinates to your city's center.
    const map = L.map('map').setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const reportList = document.getElementById('report-list');
    reportList.innerHTML = '<p>Loading reports...</p>'; // Loading indicator

    // --- 3. FETCH AND DISPLAY REPORTS FROM FIRESTORE ---
    db.collection("reports").orderBy("timestamp", "desc").get() // Get reports, newest first
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                reportList.innerHTML = '<p>No reports have been submitted yet.</p>';
                return;
            }

            // Clear the loading message
            reportList.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const report = doc.data(); // Get the report data object
                const reportId = doc.id; // Get the unique document ID

                // --- Display logic (same as before, but using live data) ---

                // Add a marker to the map for each report
                const marker = L.marker([report.lat, report.lon]).addTo(map);
                marker.bindPopup(`<b>${report.type}</b><br>${report.description}`);

                // Create and append a card for the report list
                const reportCard = document.createElement('div');
                reportCard.className = 'report-card';
                reportCard.setAttribute('data-id', reportId);
                
                // Convert Firestore timestamp to a readable date, if it exists
                const date = report.timestamp ? report.timestamp.toDate().toLocaleString() : 'N/A';

                reportCard.innerHTML = `
                    <img src="${report.photo}" alt="Issue photo of ${report.type}" class="report-photo">
                    <div class="report-details">
                        <h3>${report.type}</h3>
                        <p>${report.description}</p>
                        <small>Submitted on: ${date}</small>
                        <p class="status">Status: <strong>${report.status}</strong></p>
                    </div>
                `;
                reportList.appendChild(reportCard);
            });
        })
        .catch((error) => {
            console.error("Error fetching reports: ", error);
            reportList.innerHTML = '<p>Could not fetch reports. Please check the console for errors.</p>';
        });
});
