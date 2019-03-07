// Access Control
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } else {
        req.flash('error', 'Please login first')
        res.redirect('/users/login')
    }
}

module.exports = ensureAuthenticated