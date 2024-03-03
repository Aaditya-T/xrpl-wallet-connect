const crypto = require('crypto');

function generateSecureRandomHash() {
    // Generate a random buffer (16 bytes in this example)
    const randomBuffer = crypto.randomBytes(16);
  
    // Create a SHA-256 hash of the random buffer
    const sha256Hash = crypto.createHash('sha256').update(randomBuffer).digest('hex');
  
    return sha256Hash;
  }

export default async function handler(req, res) {
    try {
        const hash = generateSecureRandomHash();
        res.status(200).json({hash:hash});
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}