const toDoController = require('../controllers/toDoController');
const appConfig = require("./../../config/appConfig");
const validator = require('../middlewares/validator');
const auth = require('./../middlewares/auth');


module.exports.setRouter = (app) => {
  let baseUrl = `${appConfig.apiVersion}`;
  console.log("BaseUrl For ToDOS::", baseUrl);
  app.post(`${baseUrl}/registerToDoUser`,validator.registerUserValidate,toDoController.userRegistration);
  app.post(`${baseUrl}/loginToDoUser`,validator.loginUserValidate,toDoController.login);
  app.post(`${baseUrl}/addToDo`,auth.isAuthorized,validator.addToDoValidate,toDoController.addToDo);
  app.post(`${baseUrl}/editToDo/:todoId`, auth.isAuthorized, validator.addToDoValidate, toDoController.editToDo);
  app.post(`${baseUrl}/deleteToDo/:todoId`, auth.isAuthorized, toDoController.deleteToDo);
  app.get(`${baseUrl}/listToDos`, auth.isAuthorized, toDoController.listToDos);
  app.get(`${baseUrl}/searchToDos`, auth.isAuthorized, toDoController.searchToDos);
}