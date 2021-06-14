module.exports = async (req, res, next) => {

    const ApiKeyAuth = await req.headers.api_key_access
    
    if (ApiKeyAuth != process.env.SECRET_KEY) {
        return res.send('You are not Authorized')
    } else {
        next();
    }
}