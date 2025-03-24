#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { json } = require("stream/consumers");

const TASKS_FILE = path.join(__dirname, "tasks.json");

// Hàm tải danh sách nhiệm vụ từ file JSON (tạo file mới nếu chưa tồn tại)
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(TASKS_FILE, "utf-8"); //utf8: là một định dạng mã hóa ký tự dùng để biểu diễn văn bản Unicode
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks file:", error);
    return [];
  }
}

// Hàm lưu danh sách nhiệm vụ vào file JSON
function saveTasks(tasks) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error saving tasks file:", error);
  }
}

// Thêm nhiệm vụ mới
function addTask(description) {
  const tasks = loadTasks();
  const id = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
  const now = new Date().toISOString();
  const newTask = {
    id,
    description,
    status: "todo", //Trạng thái mặc định là todo
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  console.log(`Task added successfully (ID: ${id})`);
}

// Cập nhật mô tả của nhiệm vụ
function updateTask(id, newDescription) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    console.log(`Task with ID ${id} not found.`);
    return;
  }
  task.description = newDescription;
  task.updatedAt = new Date().toISOString();
  saveTasks(task);
  console.log(`Task with ID ${id} update successfully.`);
}

// Xóa nhiệm vụ theo id
function deletedTask(id) {
  let tasks = loadTasks();
  const initialLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  if (tasks.length === initialLength) {
    console.log(`Task with ID ${id} not found.`);
    return;
  }
  saveTasks(tasks);
  console.log(`Task with ID ${id} deleted successfully.`);
}

// Đánh dấu nhiệm vụ theo trạng thái (in-progress hoặc done)
function markTask(id, status) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    console.log(`Task with ID ${id} not found.`);
    return;
  }
  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveTasks();
  console.log(`Task with ID ${id} marked as ${status} successfully.`);
}

// Liệt kê nhiệm vụ, có thể lọc theo trạng thái nếu được chỉ định
function listTasks(filter) {
  const tasks = loadTasks();
  let filteredTasks = tasks;
  if (filter) {
    filteredTasks = tasks.filter((task) => task.status === filter);
  }
  if (filteredTasks.length === 0) {
    console.log("No tasks found.");
    return;
  }
  filteredTasks.forEach((task) => {
    console.log(`${task.id}. [${task.status}] $[{task.description}]`);
  });
}

//Xử lý đối số dòng lệnh
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "add":
    // Ví dụ: task-cli add "Buy groceries"
    const description = args[1];
    if (!description) {
      console.log("Please provide a task description.");
    } else {
      addTask(description);
    }
    break;
  case "update":
    // Ví dụ: task-cli update 1 "Buy groceries and cook dinner"
    const updateId = parseInt(args[1]);
    const newDescription = args[2];
    if (!updateId || !newDescription) {
      console.log("PLease provide a valid task ID and a new description.");
    } else {
      updateTask(updateId, newDescription);
    }
    break;
  case "deleted":
    // Ví dụ: task-cli delete 1
    const deleteId = parseInt(args[1]);
    if (!deleteId) {
      console.log("Please provide a valid task ID to delete.");
    } else {
      deletedTask(deleteId);
    }
    break;
  case "mark-in-progress":
    // Ví dụ: task-cli mark-in-progress 1
    const inProgressId = parseInt(args[1]);
    if (!inProgressId) {
      console.log("Please provide a valid task ID to mark as in-progress.");
    } else {
      markTask(inProgressId, "in-progress");
    }
    break;
  case "mark-done":
    // Ví dụ: task-cli mark-done 1
    const doneId = parseInt(args[1]);
    if (!doneId) {
      console.log("Please provide a valid task ID to mark as done.");
    } else {
      markTask(doneId, "done");
    }
    break;
  case "list":
    // Ví dụ:
    // task-cli list
    // task-cli list done
    // task-cli list todo
    // task-cli list in-progress
    const filterStatus = args[1];
    if (
      filterStatus &&
      !["todo", "in-progress", "done"].includes(filterStatus)
    ) {
      console.log(
        "Invalid status filter. Valid filter: todo, in-progress, done."
      );
    } else {
      listTasks(filterStatus);
    }
    break;

  default:
    console.log(`Invalid command. Valid commands are:
        add "Task description"
        update <id> "New task description"
        delete <id>
        mark-in-progress <id>
        mark-done <id>
        list [todo|in-progress|done]`);
    break;
}
