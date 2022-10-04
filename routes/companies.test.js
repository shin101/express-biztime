process.env.NODE_ENV = 'test'
const request = require('supertest');
const app = require('../app');
const db = require('../db')


beforeEach(async () => {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'Maker of OSX.'), 
    ('ibm', 'IBM', 'Big blue.')`);

    const inv = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES ('apple', 100, false, '2018-01-01', null),
           ('apple', 200, true, '2018-02-01', '2018-02-02'), 
           ('ibm', 300, false, '2018-03-01', null)
    RETURNING id`);
    // testCompany = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /companies", ()=> {
    test("Returns list of companies", async() => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            "companies": [
                {"code": "apple", "description": "Maker of OSX.", "name": "Apple"}, 
                {"code": "ibm", "description": "Big blue.", "name": "IBM"},
            ]
        })
    }) 
}) 

describe("GET /companies/apple", ()=> {
    test("Returns a single company", async() => {
        const res = await request(app).get('/companies/apple');

        expect(res.statusCode).toBe(200);
        expect.objectContaining({
            "company": {
            code: "apple",
            name: "Apple",
            description: "Maker of OSX.",
            invoices: [1,2],
          }});
    }) 
})

describe("POST /companies", ()=>{
    test("Creates a single company", async() =>{
    const res = await request(app).post('/companies').send({
        code: "test!",
        name: "fake company!",
        description: "testing database",
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        'company':{
            code: "fake-company",
            name: "fake company!",
            description: "testing database",
          }
      })
    })
})


// PUT 

describe("PUT /companies", ()=>{
    test("Edit existing company", async() =>{
    const res = await request(app).put('/companies/apple').send({
        code: "test!",
        name: "updated company.",
        description: "updated database",
      });
      expect(res.statusCode).toBe(200);
    })
})



// DELETE 

describe("DELETE /companies/apple", ()=>{
    test("deletes a single company", async() => {
    const res = await request(app).delete('/companies/apple');
      expect(res.statusCode).toBe(200);
    })
})