const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') throw new Error('Only POST requests allowed')
        const token = req.body.token;
        const { xrpAddress } = jwt.verify(token, process.env.ENC_KEY);

        //return the user's data
        res.status(200).json({ xrpAddress})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}