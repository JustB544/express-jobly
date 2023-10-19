const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works with no jsToSql", function () {
    const obj = sqlForPartialUpdate({
        obj1: "test1",
        obj2: "test2"
    });
    expect(obj).toEqual({
        setCols: "\"obj1\"=$1, \"obj2\"=$2",
        values: ["test1", "test2"]
    });
  });

  test("works with jsToSql", function () {
    const obj = sqlForPartialUpdate({
        obj_1: "test1",
        obj2: "test2"
    },{
        obj_1: "obj1"
    });
    expect(obj).toEqual({
        setCols: "\"obj1\"=$1, \"obj2\"=$2",
        values: ["test1", "test2"]
    });
  });
});
