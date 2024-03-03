const { XummSdk } = require("xumm-sdk");

export default async function handler(req, res) {
    try {

        const xumm = new XummSdk(
            process.env.XUMM_KEY,
            process.env.XUMM_KEY_SECRET
        );
         
        const signInPayload = {
            txjson: {
              TransactionType: "SignIn",
            },
          };
        const payload = await xumm.payload.create(signInPayload, true);
        res.status(200).json({payload: payload});
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error});        
    }
}