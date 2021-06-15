module.exports = async (req, res, next) => {

    const apiKey = await req.headers.api_key_access
    
    if (apiKey != process.env.SECRET_KEY) {
        return res.send('You are not Authorized')
    } else {
        next();
    }
}