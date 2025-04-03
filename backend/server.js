require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');


const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// ✅ Initialize Supabase Admin
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);


// ✅ Root Route
app.get('/', (req, res) => {
    res.send('Lost & Found Backend is Running!');
});

// ✅ User Registration (Admin Only)
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;

        res.json({ message: "User registered successfully", data });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// ✅ Backend Route to Handle Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // 🔥 Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // ✅ Return token to frontend
        res.json({
            message: "Login successful",
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        });
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// ✅ Middleware to Verify User Authentication
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token" });

        req.user = data.user; // Attach user to request
        next();
    } catch (error) {
        res.status(500).json({ error: "Authentication failed", details: error.message });
    }
};


// ✅ Route to Report a Lost Item (Protected)
app.post('/lost', authenticateUser, async (req, res) => {
    try {
        const { description, location, date_lost } = req.body;
        if (!description || !location || !date_lost) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Insert lost item into DB
        const { data: lostData, error: lostError } = await supabase
            .from('lost_items')
            .insert([{ description, location, date_lost, user_id: req.user.id }])
            .select();

        if (lostError) throw lostError;
        const lostItem = lostData[0];

        // ✅ Fetch only found items where status is "Not Found"
        const { data: foundItems, error: foundError } = await supabase
            .from('found_items')
            .select('*').eq('status', 'Not Found');  // 👈 Filter only "Not Found" items

        if (foundError) throw foundError;

        let bestMatch = null;
        let highestScore = 0;

        // ✅ Compare lost item with "Not Found" found items
        for (const foundItem of foundItems) {
            const { similarity_score } = await compareWithFlaskAPI(foundItem.image_url, description);

            if (similarity_score >= 0.7 && similarity_score > highestScore) {
                highestScore = similarity_score;
                bestMatch = foundItem;
            }
        }

        // ✅ If a strong match is found, update statuses and notify users
        if (bestMatch) {
            await supabase.from('lost_items').update({ status: 'Found' }).eq('id', lostItem.id);
            await supabase.from('found_items').update({ status: 'Found' }).eq('id', bestMatch.id);

            const bestMatchUserId = bestMatch.user_id;
            const currUserId = req.user.id;
            const possession = bestMatch.possession

            // ✅ Fetch user details safely
            const { data: lostUserData } = await supabaseAdmin.auth.admin.getUserById(currUserId);
            const { data: foundUserData } = await supabaseAdmin.auth.admin.getUserById(bestMatchUserId);

            if (!lostUserData?.user || !foundUserData?.user) {
                console.error("Failed to fetch user emails: User data is null");
                return res.status(500).json({ error: "User email fetch failed" });
            }

            const lostUserMail = lostUserData.user.email;
            const foundUserMail = foundUserData.user.email;
            
            
        
            // ✅ Store match and send notification
            await supabase.from('matched_items').insert([{
                lost_user: currUserId,
                lost_user_mail: lostUserMail,
                found_user: bestMatchUserId,
                found_user_mail: foundUserMail
            }]);

            await sendMatchNotification(lostUserMail, foundUserMail, possession);

            return res.json({ message: "Match found and processed successfully!" });
        }

        res.json({ message: "Lost item reported successfully, but no strong match was found." });

    } catch (error) {
        console.error("Error reporting lost item:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});




// ✅ Route to Get All Lost Items (Protected)
app.get('/lost', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase.from('lost_items').select('*');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error("Error fetching lost items:", error.message);
        res.status(500).json({ error: "Failed to fetch lost items", details: error.message });
    }
});


// ✅ Route to Report a Found Item (Protected)
app.post('/found', authenticateUser, async (req, res) => {
    try {
        const { image_url, possession, date_time_found } = req.body;
        if (!image_url || !date_time_found || !possession) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Insert found item into DB
        const { data: foundData, error: foundError } = await supabase
            .from('found_items')
            .insert([{ image_url, possession, date_time_found, user_id: req.user.id }])
            .select();

        if (foundError) throw foundError;
        const foundItem = foundData[0];

        // ✅ Fetch all lost items
        const { data: lostItems, error: lostError } = await supabase.from('lost_items').select('*')
        .eq('status','Not Found');
        if (lostError) throw lostError;

        let bestMatch = null;
        let highestScore = 0;

        // ✅ Compare found item with lost items
        for (const lostItem of lostItems) {
            const { similarity_score } = await compareWithFlaskAPI(image_url, lostItem.description);
            
            if (similarity_score >= 0.7 && similarity_score > highestScore) {
                highestScore = similarity_score;
                bestMatch = lostItem;
            }
        }

        // ✅ If a strong match is found, update statuses and notify users
        if (bestMatch) {
            await supabase.from('lost_items').update({ status: 'Found' }).eq('id', bestMatch.id);
            await supabase.from('found_items').update({ status: 'Found' }).eq('id', foundItem.id);

            const bestMatchUserId = bestMatch.user_id;
            const currUserId = req.user.id;
            const possession = foundItem.possession

            // ✅ Fetch user details safely
            const { data: lostUserData } = await supabaseAdmin.auth.admin.getUserById(bestMatchUserId);
            const { data: foundUserData } = await supabaseAdmin.auth.admin.getUserById(currUserId);

            if (!lostUserData?.user || !foundUserData?.user) {
                console.error("Failed to fetch user emails: User data is null");
                return res.status(500).json({ error: "User email fetch failed" });
            }

            const lostUserMail = lostUserData.user.email;
            const foundUserMail = foundUserData.user.email;

            
            

            // ✅ Store match and send notification
            await supabase.from('matched_items').insert([
                { lost_user: bestMatch.user_id, lost_user_mail: lostUserMail, found_user: req.user.id, found_user_mail: foundUserMail }
            ]);

            await sendMatchNotification(lostUserMail, foundUserMail, possession);

            return res.json({ message: "Match found and processed successfully!" });
        }

        res.json({ message: "Found item reported successfully, but no strong match was found." });

    } catch (error) {
        console.error("Error reporting found item:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});



// Function to compare item with Flask API
async function compareWithFlaskAPI(image_url, description) {
    try {
        const flaskApiUrl = process.env.FLASK_API_URL; // Store Flask API URL in .env file
        const response = await axios.post(`${flaskApiUrl}/predict`, { image_url, description });
        const { similarity_score } = response.data; 
        console.log(similarity_score)// Assuming similarity score is returned by Flask API
        return { similarity_score };
    } catch (error) {
        console.error("Error in Flask comparison:", error.message);
        throw new Error("Failed to compare with Flask API");
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const nodemailer = require('nodemailer');

const sendMatchNotification = async (lostUserMail, foundUserMail, possession) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // ✅ Your email
                pass: process.env.EMAIL_PASS  // ✅ App password (use an App Password if using Gmail)
            }
        });



        
        console.log(possession); // Debugging log

        // Determine message based on foundUserPossession
        const retrievalMessage =
            possession.toLowerCase() === "with the person"
                ? "Please contact each other to arrange item retrieval."
                : `The item is currently located at: ${possession}. Please collect it from there.`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: [lostUserMail, foundUserMail],
            subject: "Lost & Found Match Notification",
            text: `Congratulations! We found a match between a lost and found item.\n\n
                   - Lost Item Owner: ${lostUserMail}
                   - Found Item Owner: ${foundUserMail}\n
                   ${retrievalMessage}`
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Match notification emails sent successfully!");
    } catch (error) {
        console.error("❌ Error sending match emails:", error);
    }
};




// const nodemailer = require('nodemailer');

// const sendMatchNotification = async (lostUserMail, foundUserMail, foundUserPossession) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER, // ✅ Your email
//                 pass: process.env.EMAIL_PASS  // ✅ App password (use an App Password if using Gmail)
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: [lostUserMail, foundUserMail],
//             subject: "Lost & Found Match Notification",
//             text: `Congratulations! We found a match between a lost and found item.\n\n
//                    - Lost Item Owner: ${lostUserMail}
//                    - Found Item Owner: ${foundUserMail}\n
//                    Please contact each other to arrange item retrieval.`
//         };

//         await transporter.sendMail(mailOptions);
//         console.log("📧 Match notification emails sent successfully!");
//     } catch (error) {
//         console.error("❌ Error sending match emails:", error);
//     }
// };

// const trial = async () => {
//     image_url="https://nulgwtgyqlckaglvtqeu.supabase.co/storage/v1/object/public/found-images/found-items/1743524953724-found11.jpg"
//     const lostItems = await supabase.from('lost_items').select('*');
//     console.log(lostItems)
//     if (lostItems.error) throw lostItems.error;
//     console.log(lostItems.data)
//     // Compare with each lost item using the Flask API
//     for (var lostItem of lostItems.data) {
//         console.log(lostItem.description)
//         const { similarity_score } = await compareWithFlaskAPI(image_url, lostItem.description);
//         if (similarity_score >= 0.7) {
//             console.log(similarity_score)

//             await supabase
//                 .from('lost_items')
//                 .update({ status: 'Found' })
//                 .eq('id', lostItem.id);
//         }
//     }

    
// };



// trial();