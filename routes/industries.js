const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
let router = new express.Router();

router.get('/', async(req, res, next)=>{
    try {
        const results = await db.query(`
            SELECT c.code, c.name, i.industry
            FROM industries AS i 
            LEFT JOIN companies_industries AS ci
            ON ci.industry_code = i.code
            LEFT JOIN companies AS c
            ON ci.company_code = c.code`
        );
        
        console.log(results);
        if (results.rows.length === 0){
            throw new ExpressError("Not found", 404);
        }


        // const industry = results.rows.map();
        return res.send(results.rows.reduce((acc, r) => {
            const curr = acc[r.industry] || [];
            acc = { 
                ...acc,
                [r.industry]: [ ...curr, r.name ]
            };
            return acc;
        }, {}));
    } catch(e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body; 
        const results = await db.query('INSERT INTO industries ( code, industry ) VALUES ($1, $2) RETURNING *', [code, industry]);
        // by doing results.rows[0] you return an object , not an object inside an array
        return res.json({'industry':results.rows[0]});
    } catch(e){
        return next(e)
    }
})



module.exports = router;