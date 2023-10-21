"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 350,
    equity: "1",
    companyHandle: "c3"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 3`);
    expect(result.rows).toEqual([newJob]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs.length).toEqual(2);
    expect(jobs[0].title).toEqual("title1");
  });

  test("works: with filter", async function () {
    let jobs = await Job.findAll({title: "title"});
    expect(jobs.length).toEqual(2);
    expect(jobs[0].title).toBe("title1");

    jobs = await Job.findAll({title: "2"});
    expect(jobs.length).toEqual(1);
    expect(jobs[0].title).toBe("title2");

    jobs = await Job.findAll({minSalary: 50001});
    expect(jobs.length).toEqual(1);
    expect(jobs[0].title).toBe("title2");

    jobs = await Job.findAll({hasEquity: true});
    expect(jobs.length).toEqual(1);
    expect(jobs[0].title).toBe("title1");
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        title: "title1",
        salary: 50000,
        equity: "0.5",
        companyHandle: "c1"
      });
  });

  test("not found if no such Job", async function () {
    try {
      await Job.get(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new",
    salary: 350,
    equity: "1"
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
        companyHandle: "c1",
      ...updateData
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
        title: "new",
        salary: 350,
        equity: "1",
        companyHandle: 'c1'
      }]);
  });

  test("works: empty fields", async function () {
    const updateData = {
      title: "New",
    };

    let job = await Job.update(1, updateData);
    expect(job).toEqual({
        companyHandle: "c1",
        title: "New",
        salary: 50000,
        equity: "0.5"
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
          WHERE id = 1`);
    expect(result.rows).toEqual([{
        title: "New",
        salary: 50000,
        equity: "0.5",
        companyHandle: "c1"
      }]);
  });

  test("not found if no such Job", async function () {
    try {
      await Job.update(10, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such Job", async function () {
    try {
      await Job.remove(10);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
