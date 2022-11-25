+ 1. Система конфигурации
+ 2. Обработка запросов, роутинг (по аналогии как в Express.js)
+ 3. Возможность добавления middlewares
+ 4. Обработка разных типов запросов
+ 5. Работа с базами (реализовать чтение/запись в базу Mongo)
+ 6. Отдача результатов (типы: json, blob, stream)
+ 7. Отдача статических файлов // res.sendFile
+ 8. Обработка ошибок
+ 9. Логирование

how to start server
start mongodb for mac: brew services start mongodb-community
npm i
npm start

examples

curl -X POST http://localhost:8000/products/ -H 'Content-Type: application/json' -d '{"login":"my_login","password":"my_password"}' // id from mongodb

curl -X 'GET' 'http://localhost:8000/protected' // Unauthorized
curl -X 'GET' 'http://localhost:8000/protected' -H 'Authorization: a123' // protected route
etc...


