function authUser(req, res, next) {
    //TODO makes this functional
    console.log(req.body.user)
    if (req.body.user == null) {
        res.status(403)
        return res.send('you need to sign in')
    }

    next()
}

module.exports = {
    authUser
}