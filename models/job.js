"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle
        ]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   * 
   * title: the title of the job includes title inside of it
   * 
   * minSalary: the minimum salary
   * 
   * hasEquity: is equity > 0
   * 
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll({title, minSalary, hasEquity} = {}) {
    const additions = [];
    let addString = "";
    if (title || minSalary || hasEquity) {
      if (title) additions.push(`title ILIKE '%${title}%'`);
      if (minSalary) additions.push(`salary >= ${minSalary}`);
      if (hasEquity) additions.push(`${(hasEquity) ? "" : "NOT "}equity > 0`);
      addString = " WHERE " + additions.join(" AND ");
      // console.log(addString);
    }
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs${addString}
           ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
    
    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const _id = result.rows[0];

    if (!_id) throw new NotFoundError(`No id: ${id}`);
  }
}


module.exports = Job;
