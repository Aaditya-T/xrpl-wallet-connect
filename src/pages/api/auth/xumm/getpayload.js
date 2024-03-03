const { XummSdk } = require("xumm-sdk");

export default async function handler(req, res) {
    try {
        const xumm = new XummSdk(
            process.env.XUMM_KEY,
            process.env.XUMM_KEY_SECRET
        );
        
        const payload = await xumm.payload.get(req.query.payloadId)
        res.status(200).json({payload : payload});
    } catch (error) {
        res.status(400).json(error);        
    }
}