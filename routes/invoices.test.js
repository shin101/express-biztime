process.env.NODE_ENV = 'test'
const request = require('supertest');
const app = require('../app');
const db = require('../db')

beforeEach(async () => {
    const result = db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('apple', 100, false, null),
    ('apple', 200, false, null),
    ('apple', 300, true, '2018-01-01'),
    ('ibm', 400, false, null) RETURNING comp_Code, amt, paid, paid_date`);
    testInvoice = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
    await db.end()
})


describe("GET /invoices", ()=> {
    test("Return info on invoices:", ()=> {
        console.log('hi');
        expect(1).toBe(1);
    })
})