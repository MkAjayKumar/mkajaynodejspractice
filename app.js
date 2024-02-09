const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const format = require('date-fns')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const intializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error : ${error.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

const hadPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority === undefined && requestQuery.status === undefined
  )
}

const hadPriorityAndTodoProperties = requestQuery => {
  return requestQuery.priority === undefined && requestQuery.todo === undefined
}

const hadTodoAndStatusProperties = requestQuery => {
  return requestQuery.todo === undefined && requestQuery.status === undefined
}

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hascategoryAndStatusProperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}
const hascategoryAndpriorityProperties = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}
const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hascategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, category} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hascategoryAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND category = '${category}';`
      break
    case hascategoryAndpriorityProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}'
    AND category = '${category}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hascategoryProperty(request.query):
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND category = '${category}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    Todo 
   WHERE
    id = ${todoId};`
  const getTodosQueryResponse = await database.get(getTodosQuery)
  response.send(getTodosQueryResponse)
})

app.get('/agenda/', async (request, response) => {
  const {dueDate} = request.query
  const duedate = format(new Date(dueDate), 'yyyy-MM-dd')
  const getTodosQuery = `
   SELECT
    id AS id , 
    todo AS todo ,
    priority AS priority ,
    status AS status ,
    category AS category ,
    due_date AS dueDate
   FROM
    Todo 
   WHERE
    due_date = ${duedate};`
  const getTodosQueryResponse = await database.all(getTodosQuery)
  if (getTodosQueryResponse === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    response.send(getTodosQueryResponse)
  }
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  const createTodoQuery = `
  INSERT INTO
  Todo (id , todo , priority , status , category , due_date)
  VALUES
 (${id},'${todo}','${priority}','${status}','${category}',${dueDate});`

  const createTodoQueryResponse = await database.run(createTodoQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {status, priority, todo, category, dueDate} = request.body
  const {todoId} = request.params
  let updateTodoQuery = ''
  let respone = ''
  switch (true) {
    case status !== undefined:
      respone = 'Status Updated'
      updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    status = '${status}'
    WHERE 
    id = ${todoId} ;`
      break
    case priority !== undefined:
      respone = 'Priority Updated'
      updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    priority = '${priority}'
    WHERE 
    id = ${todoId} ;`
      break
    case todo !== undefined:
      respone = 'Todo Updated'
      updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    todo = '${todo}'
    WHERE 
    id = ${todoId} ;`
      break
    case category !== undefined:
      respone = 'Category Updated'
      updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    category = '${category}'
    WHERE 
    id = ${todoId} ;`
      break
    case dueDate !== undefined:
      respone = 'Due Date Updated'
      updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    Due_date = '${dueDate}'
    WHERE 
    id = ${todoId} ;`
      break
  }

  const updateTodoQueryResponse = await database.run(updateTodoQuery)
  response.send(`${respone}`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM 
  todo 
  WHERE 
  id = ${todoId};`
  const deleteTodoQueryResponse = await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
