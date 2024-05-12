const { app } = require("./server");
// console.log(app)
const PORT = 8000;
// console.log(app.listen)
app.listen(PORT, () => console.log(`Running on PORT: ${PORT}`));