// Create floating particles
        function createParticles() {
            const particlesContainer = document.querySelector('.particles');
            const particleCount = 50;

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

        // Location functionality
        let currentLocation = null;

        document.getElementById('get-location-btn').addEventListener('click', function() {
            const btn = this;
            const feedback = document.getElementById('location-feedback');
            
            // Add loading state
            btn.innerHTML = '<span class="spinner"></span>Getting location...';
            btn.disabled = true;
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        currentLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        document.getElementById('latitude').value = currentLocation.lat;
                        document.getElementById('longitude').value = currentLocation.lng;
                        
                        feedback.innerHTML = `✅ Location obtained: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
                        feedback.style.background = 'rgba(132, 250, 176, 0.3)';
                        
                        btn.innerHTML = '✅ Location Set';
                        btn.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
                        btn.disabled = false;
                    },
                    function(error) {
                        feedback.innerHTML = '❌ Failed to get location: ' + error.message;
                        feedback.style.background = 'rgba(245, 87, 108, 0.3)';
                        
                        btn.innerHTML = '🎯 Try Again';
                        btn.disabled = false;
                    }
                );
            } else {
                feedback.innerHTML = '❌ Geolocation is not supported by this browser.';
                feedback.style.background = 'rgba(245, 87, 108, 0.3)';
                btn.innerHTML = '❌ Not Supported';
                btn.disabled = false;
            }
        });

        // File upload feedback
        document.getElementById('photo').addEventListener('change', function(e) {
            const fileUpload = document.querySelector('.file-upload');
            const fileName = e.target.files[0]?.name;
            
            if (fileName) {
                fileUpload.querySelector('.file-upload-content').innerHTML = `
                    <div class="upload-icon">✅</div>
                    <div>Photo selected: ${fileName}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">Click to change</div>
                `;
                fileUpload.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
            }
        });

        // Form submission
        document.getElementById('report-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const successMessage = document.getElementById('success-message');
            
            // Add loading state
            submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(function() {
                successMessage.classList.remove('hidden');
                submitBtn.innerHTML = '✅ Submitted!';
                submitBtn.style.background = 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)';
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
                
                // Reset form after delay
                setTimeout(function() {
                    document.getElementById('report-form').reset();
                    successMessage.classList.add('hidden');
                    submitBtn.innerHTML = '🚀 Submit Report';
                    submitBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
                    submitBtn.disabled = false;
                    
                    // Reset file upload appearance
                    document.querySelector('.file-upload').innerHTML = `
                        <div class="file-upload-content">
                            <div class="upload-icon">📷</div>
                            <div>Click to upload a photo</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">JPG, PNG up to 10MB</div>
                        </div>
                        <input type="file" id="photo" accept="image/*" required>
                    `;
                    document.querySelector('.file-upload').style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                    
                    // Reset location
                    document.getElementById('get-location-btn').innerHTML = '🎯 Get Current Location';
                    document.getElementById('get-location-btn').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    document.getElementById('location-feedback').innerHTML = '📍 Location not set. Click above to get your current location.';
                    document.getElementById('location-feedback').style.background = 'rgba(255, 255, 255, 0.6)';
                }, 3000);
            }, 2000);
        });

        // Initialize particles on load
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
        });

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
    // Make sure this is your actual config object from the Firebase console.
    const firebaseConfig = {
    apiKey: "AIzaSyCszCrDEQI3_L-QBOe1M3vEkmHncAZimGQ",
    authDomain: "sih-25-a57ae.firebaseapp.com",
    projectId: "sih-25-a57ae",
    storageBucket: "sih-25-a57ae.firebasestorage.app",
    messagingSenderId: "447925099014",
    appId: "1:447925099014:web:8d4003b39c4d62a4838187"
    };

    // --- 2. INITIALIZE FIREBASE SERVICES ---
    try {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        console.log("Firebase services initialized successfully.");

        // --- References to HTML elements ---
        const reportForm = document.getElementById('report-form');
        const getLocationBtn = document.getElementById('get-location-btn');
        const locationFeedback = document.getElementById('location-feedback');
        const latInput = document.getElementById('latitude');
        const lonInput = document.getElementById('longitude');
        const successMessage = document.getElementById('success-message');
        const submitBtn = document.getElementById('submit-btn');

        // --- Geolocation logic (no changes) ---
        getLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationFeedback.textContent = 'Acquiring location...';
                navigator.geolocation.getCurrentPosition(position => {
                    latInput.value = position.coords.latitude;
                    lonInput.value = position.coords.longitude;
                    locationFeedback.textContent = `📍 Location captured!`;
                    locationFeedback.style.color = '#27ae60';
                }, () => {
                    locationFeedback.textContent = 'Unable to retrieve location.';
                    locationFeedback.style.color = '#e74c3c';
                });
            } else {
                locationFeedback.textContent = 'Geolocation is not supported.';
                locationFeedback.style.color = '#e74c3c';
            }
        });

        /**
         * --- HELPER FUNCTION FOR IMAGE COMPRESSION ---
         * This function takes an image file and returns a compressed base64 string.
         * @param {File} file The image file to compress.
         * @returns {Promise<string>} A promise that resolves with the compressed data URL.
         */
        function compressImage(file) {
            return new Promise((resolve, reject) => {
                const MAX_WIDTH = 800; // Max width for the resized image.
                const reader = new FileReader();

                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const scale = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scale;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Export the canvas to a JPEG format with 70% quality.
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(compressedDataUrl);
                    };
                    img.onerror = (error) => reject(error);
                };
                reader.onerror = (error) => reject(error);
            });
        }

        // --- NEW FORM SUBMISSION LOGIC WITH COMPRESSION ---
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Compressing Image...';

            const issueType = document.getElementById('issue-type').value;
            const description = document.getElementById('description').value;
            const photoFile = document.getElementById('photo').files[0];
            const latitude = latInput.value;
            const longitude = lonInput.value;

            if (!latitude || !longitude || !photoFile) {
                alert('Please fill out all fields, including location and photo.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Report';
                return;
            }

            try {
                // 1. COMPRESS THE IMAGE
                const compressedPhoto = await compressImage(photoFile);
                
                // Check the size of the compressed image data string.
                if (compressedPhoto.length > 1048487) {
                   throw new Error("Even after compression, the image is too large. Please select a smaller file.");
                }

                submitBtn.textContent = 'Saving Report...';

                // 2. CREATE THE REPORT OBJECT
                const newReport = {
                    type: issueType,
                    description: description,
                    photo: compressedPhoto, // Use the compressed base64 string
                    lat: parseFloat(latitude),
                    lon: parseFloat(longitude),
                    status: 'Submitted',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp for accuracy
                };

                // 3. SAVE THE REPORT TO FIRESTORE
                await db.collection("reports").add(newReport);

                console.log("SUCCESS: Report saved to Firestore.");
                successMessage.classList.remove('hidden');
                reportForm.reset();
                locationFeedback.textContent = 'Location not set.';
                locationFeedback.style.color = 'initial';
                setTimeout(() => successMessage.classList.add('hidden'), 4000);

            } catch (error) {
                console.error("Submission failed:", error);
                alert(`Error: ${error.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Report';
            }
        });

    } catch (error) {
        console.error("FIREBASE INITIALIZATION FAILED:", error);
        alert("Firebase failed to initialize. Check your firebaseConfig object.");
    }
});

