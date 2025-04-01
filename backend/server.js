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

        const { data, error } = await supabase
            .from('lost_items')
            .insert([{ description, location, date_lost, user_id: req.user.id }]);

        if (error) throw error;

        // ✅ After adding the lost item, check it against all found items
        const foundItems = await supabase.from('found_items').select('*');
        if (foundItems.error) throw foundItems.error;

        // Compare with each found item using the Flask API
        for (const foundItem of foundItems.data) {
            const { similarity_score } = await compareWithFlaskAPI(foundItem.image_url, description);
            console.log(similarity_score);
            if (similarity_score >= 0.7) {
                // Update status of the found item
                await supabase
                    .from('found_items')
                    .update({ status: 'Matched' })
                    .eq('id', foundItem.id);
            }
        }

        res.json({ message: "Lost item reported successfully", data });
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

        const { data, error } = await supabase
            .from('found_items')
            .insert([{ image_url, possession, date_time_found, user_id: req.user.id }]);

        if(error) console.log("skibidi")
        if (error) throw error;

        // ✅ After adding the found item, check it against all lost items
        const lostItems = await supabase.from('lost_items').select('*');
        console.log(lostItems)
        if (lostItems.error) throw lostItems.error;
        console.log(lostItems.data)
        // Compare with each lost item using the Flask API
        for (var lostItem of lostItems.data) {
            const { similarity_score } = await compareWithFlaskAPI(image_url, lostItem.description);
            if (similarity_score >= 0.7) {
                // Update status of the lost item
                await supabase
                    .from('lost_items')
                    .update({ status: 'Found' })
                    .eq('id', lostItem.id);
            }
        }

        res.json({ message: "Found item reported successfully", data });
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
