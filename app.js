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

