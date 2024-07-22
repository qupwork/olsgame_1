const express = require('express');
const router = express.Router();

router.get('/checkUser', async (req, res) => {
    console.log('Received GET request on /checkUser with query:', req.query);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, userPassword, targetLanguage } = req.query;

    try {
        const user = await users.findOne({ userName: userName });
        let error_1 = !user;
        let error_2 = true;
        let error_4 = true;

        if (user) {
            if (user.userPassword === userPassword) {
                error_2 = false;
            }
            if (user.targetLanguage === targetLanguage) {
                error_4 = false;
            }
        }

        res.json({ error_1, error_2, error_4 });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/checkUserName', async (req, res) => {
    console.log('Received GET request on /checkUserName with query:', req.query);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName } = req.query;

    try {
        const user = await users.findOne({ userName: userName });
        let error_3 = user ? true : false; // true if user exists, false otherwise

        console.log("User found:", user); // Add this log to see if the user was found
        console.log("Setting error_3 to:", error_3); // Log the value of error_3

        res.json({ error_3 });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/createUser', async (req, res) => {
    console.log('Received POST request on /createUser with body:', req.body);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, userPassword, userAvatar, targetLanguage, helpLanguage, levelsOpen, yetiScoresLevel1, yetiScoresLevel2, ...words } = req.body;

    // Initialize phrases fields with false if not provided in the request body
    const phrases = {};
    for (let i = 1; i <= 50; i++) {
        phrases[`TF_Phrase_${i}`] = req.body[`TF_Phrase_${i}`] || false;
    }

    try {
        const newUser = {
            userName: userName,
            userPassword: userPassword,
            userAvatar: userAvatar,
            targetLanguage: targetLanguage,
            helpLanguage: helpLanguage,
            levelsOpen: levelsOpen,
            yetiScoresLevel1: yetiScoresLevel1,
            yetiScoresLevel2: yetiScoresLevel2,
            ...words,
            ...phrases
        };

        const result = await users.insertOne(newUser);
        if (result.insertedCount === 1) {
            res.json({ success: true, message: 'User created successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to create user' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;

router.get('/getUserData', async (req, res) => {
    console.log('Received GET request on /getUserData with query:', req.query);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName } = req.query;

    try {
        const user = await users.findOne(
            { userName: userName },
            { projection: { userAvatar: 1, yetiScoresLevel1: 1, yetiScoresLevel2: 1, targetLanguage: 1, helpLanguage: 1, levelsOpen: 1 } }
        );
        if (user) {
            console.log("User data found:", user);
            res.json({
                success: true,
                userAvatar: user.userAvatar,
                yetiScoresLevel1: user.yetiScoresLevel1,
                yetiScoresLevel2: user.yetiScoresLevel2,
                targetLanguage: user.targetLanguage,
                helpLanguage: user.helpLanguage,
                levelsOpen: user.levelsOpen
            });
        } else {
            console.warn("User not found");
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Updated yetiScoresLevel1 route to handle POST request
router.post('/yetiScoresLevel1', async (req, res) => {
    console.log('Received POST request on /yetiScoresLevel1 with body:', req.body);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, yetiScoresLevel1 } = req.body;

    // Ensure yetiScoresLevel1 is an array of numbers
    if (!Array.isArray(yetiScoresLevel1) || !yetiScoresLevel1.every(score => typeof score === 'number')) {
        return res.status(400).json({ success: false, message: 'yetiScoresLevel1 must be an array of numbers' });
    }

    try {
        const result = await users.updateOne(
            { userName: userName },
            { $set: { yetiScoresLevel1: yetiScoresLevel1 } }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Yeti scores updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Updated yetiScoresLevel2 route to handle POST request
router.post('/yetiScoresLevel2', async (req, res) => {
    console.log('Received POST request on /yetiScoresLevel2 with body:', req.body);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, yetiScoresLevel2 } = req.body;

    // Ensure yetiScoresLevel2 is an array of numbers
    if (!Array.isArray(yetiScoresLevel2) || !yetiScoresLevel2.every(score => typeof score === 'number')) {
        return res.status(400).json({ success: false, message: 'yetiScoresLevel2 must be an array of numbers' });
    }

    try {
        const result = await users.updateOne(
            { userName: userName },
            { $set: { yetiScoresLevel2: yetiScoresLevel2 } }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Yeti scores updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/leaderboardLevel1', async (req, res) => {
    console.log('Received GET request on /leaderboardLevel1');
    const db = req.app.locals.db;
    const users = db.collection('users');

    try {
        const allUsers = await users.find({}).toArray();

        const leaderboardLevel1 = [];

        allUsers.forEach(user => {
            (user.yetiScoresLevel1 || []).forEach(score => {
                leaderboardLevel1.push({
                    userName: user.userName,
                    userAvatar: user.userAvatar,
                    score: score
                });
            });
        });

        // Sort leaderboard by highest score
        leaderboardLevel1.sort((a, b) => b.score - a.score);

        res.json({ success: true, leaderboardLevel1: leaderboardLevel1 });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/leaderboardLevel2', async (req, res) => {
    console.log('Received GET request on /leaderboardLevel2');
    const db = req.app.locals.db;
    const users = db.collection('users');

    try {
        const allUsers = await users.find({}).toArray();

        const leaderboardLevel2 = [];

        allUsers.forEach(user => {
            (user.yetiScoresLevel2 || []).forEach(score => {
                leaderboardLevel2.push({
                    userName: user.userName,
                    userAvatar: user.userAvatar,
                    score: score
                });
            });
        });

        // Sort leaderboard by highest score
        leaderboardLevel2.sort((a, b) => b.score - a.score);

        res.json({ success: true, leaderboardLevel2: leaderboardLevel2 });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/updateWords', async (req, res) => {
    console.log('Received POST request on /updateWords with body:', req.body);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, wordsToUpdate } = req.body;

    try {
        const updateFields = {};
        for (const key in wordsToUpdate) {
            if (wordsToUpdate.hasOwnProperty(key)) {
                updateFields[key] = wordsToUpdate[key];
            }
        }

        const result = await users.updateOne(
            { userName: userName },
            { $set: updateFields }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Words updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/getWords', async (req, res) => {
    console.log('Received GET request on /getWords with query:', req.query);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName } = req.query;

    try {
        const projectionFields = { userName: 1 };
        for (let i = 1; i <= 50; i++) {
            projectionFields[`Word_${i}`] = 1;
        }

        const user = await users.findOne(
            { userName: userName },
            { projection: projectionFields }
        );

        if (user) {
            res.json({
                success: true,
                words: user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/updatePhrases', async (req, res) => {
    console.log('Received POST request on /updatePhrases with body:', req.body);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName, phrasesToUpdate } = req.body;

    try {
        const updateFields = {};
        for (const key in phrasesToUpdate) {
            if (phrasesToUpdate.hasOwnProperty(key)) {
                updateFields[key] = phrasesToUpdate[key];
            }
        }

        const result = await users.updateOne(
            { userName: userName },
            { $set: updateFields }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Phrases updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/getPhrases', async (req, res) => {
    console.log('Received GET request on /getPhrases with query:', req.query);
    const db = req.app.locals.db;
    const users = db.collection('users');
    const { userName } = req.query;

    try {
        const projectionFields = { userName: 1 };
        for (let i = 1; i <= 50; i++) {
            projectionFields[`TF_Phrase_${i}`] = 1;
        }

        const user = await users.findOne(
            { userName: userName },
            { projection: projectionFields }
        );

        if (user) {
            res.json({
                success: true,
                phrases: user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
