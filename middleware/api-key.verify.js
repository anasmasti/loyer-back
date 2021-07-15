module.exports = async (req, res, next) => {
    const apiKey = await req.header('Api-Key-Access')
    
    if (apiKey != process.env.SECRET_KEY) {
        return res.send('You are not Authorized')
    } else {
        next();
    }
}