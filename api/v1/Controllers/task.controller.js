const Task = require("../Models/task.model");
const searchHelper = require("../../../helper/search.helper");
const { model } = require("mongoose");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  // Mặc định status của công việc
  const find = {
    deleted: false,
  };

  // Lấy status khi người dùng nhập
  if (req.query.status) {
    find.status = req.query.status;
  }

  // Search theo title
  let objSearch = searchHelper(req.query);
  if (req.query.keyword) {
    find.title = objSearch.regex;
  }

  // Sort
  const sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }

  const tasks = await Task.find(find).sort(sort);
  res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({
      _id: id,
      deleted: false,
    });
    res.json(task);
  } catch (error) {
    res.json("Not found!!!");
  }
};

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Task.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );

    res.json({
      code: 200,
      message: "Updated Successfully!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Not found work for update!",
    });
  }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    switch (key) {
      case "status":
        await Task.updateMany({_id: { $in: ids },},{status: value,});
        res.json({
          code: 200,
          message: "Updated Successfully!",
        });
        break;
      case "delete":
        const result = await Task.updateMany({_id: { $in: ids },deleted: false,},{deleted: true,deletedAt: new Date(),}
        );
        if (result.matchedCount === 0) {
          // Không tìm thấy Task để xóa (với điều kiện `deleted: false`)
          return res.status(404).json({
            code: 404,
            message: "Task not found or already deleted!",
          });
        } else {
          res.json({code: 200,message: "Delete Task Successfully!",});
        }
        break;

      default:
        res.json({
          code: 400,
          message: "Not found!",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Not found!",
    });
  }
};

// [POST] /api/v1/task/create
module.exports.create = async (req, res) => {
  try {
    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: "Create Task Successfully!",
      data: data,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Create Fail !!",
    });
  }
};

// [PATCH] /api/v1/task/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, req.body);

    res.json({
      code: 200,
      message: "Edit Task Successfully!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Edit Fail !!",
    });
  } 
};

// [DELETE] /api/v1/task/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Task.updateOne(
      { _id: id, deleted: false },
      {
        deleted: true,
        deletedAt: new Date(),
      }
    );

    if (result.matchedCount === 0) {
      // Không tìm thấy Task để xóa (với điều kiện `deleted: false`)
      return res.status(404).json({
        code: 404,
        message: "Task not found or already deleted!",
      });
    } else {
      res.json({
        code: 200,
        message: "Delete Task Successfully!",
      });
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Delete Fail !!",
    });
  }
};
