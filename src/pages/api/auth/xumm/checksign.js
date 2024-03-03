const verifySignature = require("verify-xrpl-signature").verifySignature;
const jwt = require("jsonwebtoken");

export default function handler(req, res) {
    try {
        const resp = verifySignature(req.query.hex);
        if (resp.signatureValid === true) {
            // res.status(200).json({xrpAddress:resp.signedBy});
            const xrpAddress = resp.signedBy;
            const encrypted = jwt.sign({ address: xrpAddress }, process.env.ENC_KEY);
            res.status(200).json({xrpAddress:resp.signedBy, token:encrypted});
        }
    } catch (error) {
        res.status(400).json({error:error.message});
    }
}