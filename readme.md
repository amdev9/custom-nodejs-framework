+ 1. Система конфигурации
+ 2. Обработка запросов, роутинг (по аналогии как в Express.js)
+ 3. Возможность добавления middlewares
+ 4. Обработка разных типов запросов
+ 5. Работа с базами (реализовать чтение/запись в базу Mongo)
+ 6. Отдача результатов (типы: json, blob, stream)
+ 7. Отдача статических файлов // res.sendFile
+ 8. Обработка ошибок
+ 9. Логирование


start mongodb for mac: 

```
brew services start mongodb-community
```
How to start server

```
npm i
npm start
```

config file format
```
{
  "appPort": 8000,              // port server starts
  "dbConfig": {
    "mongoUrl": "",             // mongo connection url 
    "dbName": "credential",     // db name 
    "collName": "credentials",  // collection name
    "validatorObj": {}          // collection validation object 
  },
  "logger": {
    "errorFile": "error.log",   // file with error logs
    "combinedFile": "combined.log", // other logs
    "env": "production"         // hardcoded ENV
  }
}
```
examples

```
curl -X POST http://localhost:8000/products/ -H 'Content-Type: application/json' -d '{"login":"my_login","password":"my_password"}' // id from mongodb

curl -X 'GET' 'http://localhost:8000/protected' // Unauthorized
curl -X 'GET' 'http://localhost:8000/protected' -H 'Authorization: a123' // protected route

```

