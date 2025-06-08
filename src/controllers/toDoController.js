const response = require('./../libs/responseLib')
const check = require('../libs/checkLib')
const tokenLib = require('../libs/tokenLib');
const passwordLib = require('../libs/passwordLib');

const { toDoUserRegistrationModel } = require('../models/assignments/todoUserRegister')
const { toDoListModel } = require('../models/assignments/toDoList')


let userRegistration = async (req, res) => {
  try {
    let _findUserExist = await toDoUserRegistrationModel.find({ email: req.body.email.toLowerCase() });
    // Check if user already exists
    if (!check.isEmpty(_findUserExist)) {
      let apiResponse = response.generate(
        true,
        "A user already exists with these credentials.",
        "User Already Exists"
      );
      return res.status(412).send(apiResponse); // 🛑 RETURN to avoid continuing
    }

    // Create new user

    let newUser = new toDoUserRegistrationModel({
      // UserId : uuidv4(),
      FirstName: req.body.firstname,
      LastName: req.body.lastname,
      email: req.body.email.toLowerCase(),
      Password: await passwordLib.hash(req.body.password)
    });

    let payload = (await newUser.save()).toObject();

    delete payload.__v;
    delete payload._id;
    delete payload.Password;

    let apiResponse = response.generate(false, "User Created...", payload);
    return res.status(201).send(apiResponse); // ✅ safe

  } catch (error) {
    let apiResponse = response.generate(
      true,
      "An error occurred during user registration.",
      error.message
    );
    return res.status(400).send(apiResponse); // ✅ add return for consistency
  }
};

let login = async (req, res) => {
  try {
    let _findUser = await toDoUserRegistrationModel.findOne({ email: req.body.email }).lean();
    console.log("findUSers::",_findUser);
    if (check.isEmpty(_findUser)) {
      res.status(404);
      throw new Error('User not Registered!');
    };

    if(await passwordLib.verify(req.body.password,_findUser.Password)){
      console.log("passowrd verified...!!!");

      let payload = {
        firstname : _findUser.firstname,
        lastname : _findUser.lastname,
        email : _findUser.email,
        token : await tokenLib.generateToken(_findUser)
      }
      console.log("Token Is::",payload);
      let apiResponse = response.generate(false,"Logged In!!",payload);
      res.status(200).send(apiResponse);
    }
    else{
      let apiResponse = response.generate(true,"Wrong Passoword!!",null);
      res.status(401).send(apiResponse);
    }


  } catch (error) {
    let apiResponse = response.generate(true, `An error occurred during user Loggin.${error.message}`, error);
    return res.status(400).send(apiResponse);
  }
}

let addToDo = async (req, res) => {
  try {
    const { title, description, dueDate, priority, tags } = req.body;
    let _findtittle = await toDoListModel.findOne({title:req.body.title,createdBy:req.user._id}).lean();
    if(!check.isEmpty(_findtittle)){
      let apiResponse = response.generate(true,"A task Is Already Exist With The Same Tittle.",null);
      return res.status(412).send(apiResponse);
    }

    let newToDo = new toDoListModel({
      title,
      description,
      dueDate,
      priority,
      tags,
      createdBy: req.user._id
    });

    const savedToDo = (await newToDo.save()).toObject();
    
    
    delete savedToDo.__v;
    // delete savedToDo._id;
    delete savedToDo.createdAt;
    delete savedToDo.updatedAt;
    delete savedToDo.deleted; 

    let apiResponse = response.generate(false, "To-do added successfully.", savedToDo);
    return res.status(201).send(apiResponse);

  } catch (error) {
    let apiResponse = response.generate(true, "An error occurred while adding todo.", error.message);
    return res.status(400).send(apiResponse);
  }
};

let editToDo = async (req, res) => {
  try {
    const { title, description, dueDate, priority, tags } = req.body;
    const todoId = req.params.todoId;

    // 1. Check if the to-do exists and belongs to the logged-in user
    let existingToDo = await toDoListModel.findOne({
      _id: todoId,
      createdBy: req.user._id
    });

    if (!existingToDo) {
      return res.status(404).send(response.generate(true, "To-Do not found or unauthorized.", null));
    }

    // 2. Optional: Prevent duplicate title for the same user
    if (title && title !== existingToDo.title) {
      let duplicate = await toDoListModel.findOne({
        title,
        createdBy: req.user._id,
        _id: { $ne: todoId } // ignore the same task
      }).lean();

      if (duplicate) {
        return res.status(412).send(response.generate(true, "Another task with this title already exists.", null));
      }
    }

    // 3. Update fields
    existingToDo.title = title || existingToDo.title;
    existingToDo.description = description || existingToDo.description;
    existingToDo.dueDate = dueDate || existingToDo.dueDate;
    existingToDo.priority = priority || existingToDo.priority;
    existingToDo.tags = tags || existingToDo.tags;


    const updatedToDo = (await existingToDo.save()).toObject();

    delete updatedToDo.__v;
    delete updatedToDo.createdAt;
    delete updatedToDo.updatedAt;
    delete updatedToDo.deleted; 


    let apiResponse = response.generate(false, "To-do updated successfully.", updatedToDo);
    return res.status(200).send(apiResponse);

  } catch (error) {
    let apiResponse = response.generate(true, "An error occurred while editing todo.", error.message);
    return res.status(400).send(apiResponse);
  }
};

let deleteToDo = async (req, res) => {
  try {
    const todoId = req.params.todoId;

    // Find the todo by ID, createdBy, and not already deleted
    const todo = await toDoListModel.findOne({
      _id: todoId,
      createdBy: req.user._id,
      deleted: false
    });

    if (!todo) {
      return res.status(404).send(response.generate(true, "To-do not found or already deleted.", null));
    }

    // Soft delete the todo
    todo.deleted = true;
    await todo.save();

    return res.status(200).send(response.generate(false, "To-do soft-deleted successfully.", null));

  } catch (error) {
    return res.status(400).send(response.generate(true, "Error while soft-deleting the todo.", error.message));
  }
};

let listToDos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;        // Default page = 1
    const limit = parseInt(req.query.limit) || 10;     // Default limit = 10
    const skip = (page - 1) * limit;

    const filter = {
      createdBy: req.user._id,
      deleted: false
    };

    const todos = await toDoListModel.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await toDoListModel.countDocuments(filter);

    const apiResponse = response.generate(false, "To-dos fetched successfully.", {
      todos,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: todos.length
      }
    });

    return res.status(200).send(apiResponse);

  } catch (error) {
    const apiResponse = response.generate(true, "Error occurred while fetching todos.", error.message);
    return res.status(400).send(apiResponse);
  }
};


// let listToDos = async (req, res) => {
//   try {
//     const { title } = req.query; // optional search param
//     const page = parseInt(req.query.page) || 1;       
//     const limit = parseInt(req.query.limit) || 10;     
//     const skip = (page - 1) * limit;

//     // Base filter for user and non-deleted todos
//     const filter = {
//       createdBy: req.user._id,
//       deleted: false
//     };

//     // Agar title query param diya gaya ho aur empty na ho to filter me add karen
//     if (typeof title === 'string' && title.trim() !== '') {
//       filter.title = { $regex: title.trim(), $options: 'i' };  // case-insensitive search
//     }

//     // Fetch todos and count parallelly
//     const [todos, totalCount] = await Promise.all([
//       toDoListModel.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       toDoListModel.countDocuments(filter)
//     ]);

//     const apiResponse = response.generate(false, "To-dos fetched successfully.", {
//       todos,
//       pagination: {
//         totalItems: totalCount,
//         currentPage: page,
//         totalPages: Math.ceil(totalCount / limit),
//         pageSize: todos.length
//       }
//     });

//     return res.status(200).send(apiResponse);

//   } catch (error) {
//     const apiResponse = response.generate(true, "Error occurred while fetching todos.", error.message);
//     return res.status(400).send(apiResponse);
//   }
// };




let searchToDos = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      createdBy: req.user._id,
      deleted: false
    };

    // Agar title diya ho aur non-empty ho to filter me add karo
    if (typeof title === 'string' && title.trim() !== '') {
      filter.title = { $regex: title.trim(), $options: 'i' }; // case-insensitive partial match
    }

    // DB queries parallelly chalao
    const [todos, totalCount] = await Promise.all([
      toDoListModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      toDoListModel.countDocuments(filter)
    ]);

    const apiResponse = response.generate(false, "To-dos fetched successfully.", {
      todos,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: todos.length
      }
    });

    return res.status(200).send(apiResponse);

  } catch (error) {
    const apiResponse = response.generate(true, "Error occurred while searching todos.", error.message);
    return res.status(400).send(apiResponse);
  }
};


module.exports = { userRegistration: userRegistration,
  login : login,
  addToDo : addToDo,
  editToDo : editToDo,
  listToDos : listToDos,
  deleteToDo : deleteToDo,
  searchToDos : searchToDos
 }