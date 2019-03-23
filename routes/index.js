const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash, page: "index" })
})

module.exports = router