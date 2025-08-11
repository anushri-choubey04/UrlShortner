const {shortid} = require('shortid');
const Url = require('../models/url');


async function handleGenerateNewShortURL(req,res) {
    const body = res.body;
    if(!body.url) return res.status(400).json({error: "URL is required"});
    const shortID = shortid(8);
       await Url.create({
           shortId: shortID,
           redirectUrl: body.url,
           visitHistory: [],

       });

return res.json({ id: shortID, url: body.url });
    }

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
     const result= await Url.findOne({ shortId});
    return res.json({
        totalClicks: result.visitHistory.length,
        analytics:result.visitHistory,
    });
}

module.exports ={
    handleGenerateNewShortURL,
    handleGetAnalytics,
};
    
