const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
let router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json(results.rows);
    } catch(err) {
        return next(err);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params; // this is same as req.query.id
        const results = await db.query(`SELECT * FROM invoices INNER JOIN companies ON (invoices.comp_code = companies.code) WHERE id = $1`,[id]);

        if(results.rows.length===0){
            throw new ExpressError('No such invoice',404);
        }

        return res.json({'invoice': results.rows[0]})
    } catch(e){
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code,amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
        // by doing results.rows[0] you return an object , not an object inside an array
        return res.json({'invoice':results.rows[0]});
    } catch(e){
        return next(e)
    }
})

router.put('/:id', async (req,res,next) => {
    try {
        let { amt, paid } = req.body;
        let { id } = req.params;
        let paidDate = null;

        const currResult = await db.query('SELECT paid FROM invoices WHERE id = $1',[id]);
        
        
        const currPaidDate = currResult.rows[0].paid_date;
        
        if (!currPaidDate && paid){
            paidDate = new Date();
        } else if (!paid){
            paidDate = null
        } else {
            paidDate = currPaidDate;
        }
        
        const results = await db.query('UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *',[amt,paid,paidDate,id]);
        
        return res.send({"invoice" : results.rows[0]})
        
    }catch(e){
        return next(e)
    }
})


router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
        return res.send({msg: "DELETED!"})
    } catch(e){
        return next(e)
    }
})


module.exports = router;