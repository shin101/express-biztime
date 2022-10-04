const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
let slugify = require('slugify');
let router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({"companies" : results.rows});
    } catch(err) {
        return next(err);
    }
});


router.get('/:code', async (req, res, next) => {
    try {
        let { code } = req.params; // this is same as req.query.code

        const compResults = await db.query(
            `SELECT code, name, description 
            FROM companies 
            WHERE code = $1`,[code]);

        const invoiceResults = await db.query(
            `SELECT id 
            FROM invoices 
            WHERE comp_code = $1`,
            [code]);

        if(compResults.rows.length === 0){
            throw new ExpressError('no such company',400)
        }

        const company = compResults.rows[0];
        const invoices = invoiceResults.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({'company': company})
    } catch(e){
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        let code = slugify(name,{remove:/[*+~.()'"!:@]/g})
        
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]);
        // by doing results.rows[0] you return an object , not an object inside an array
        return res.status(201).json({'company':results.rows[0]});
    } catch(e){
        return next(e)
    }
})

router.put('/:code', async (req,res,next) => {
    try {
        const {code} = req.params;
        const {name, description} = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *',[name,description,code])
        if (results.rows.length ===0 ){
            throw new ExpressError('Cannot find user with that id', 404)
        }
        return res.send(results.rows[0])
    }catch(e){
        return next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({msg: "DELETED!"})
    } catch(e){
        return next(e)
    }
})


module.exports = router;