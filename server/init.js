// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
let adminArgs = process.argv.slice(2);

console.log("Passed Arguments: ", adminArgs);
if (adminArgs[0] !== "admin@gmail.com" || adminArgs[1] !== "secret") {
  console.log('ERROR: Wrong Admin Credentials! Enter "node init.js admin@gmail.com secret"');
  return;
}

const bcrypt = require("bcrypt");
let Tag = require("./models/Tag");
let Answer = require("./models/Answer");
let Question = require("./models/Question");
let User = require("./models/User");
let Comment = require("./models/Comment");

let mongoose = require("mongoose");
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function userCreate(
  username,
  email,
  clearTextPassword,
  isAdmin,
  reputation = 0,
  userQuestions = null,
  userTags = null,
  userAnswers = null
) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(clearTextPassword, salt);
  const user = new User({
    username: email === "admin@gmail.com" ? "admin" : username,
    email: email,
    passwordHash: passwordHash,
    admin: isAdmin,
    reputation: email === "admin@gmail.com" ? 500 : reputation,
    userQuestions: userQuestions || [],
    userTags: userTags || [],
    userAnswers: userAnswers || [],
  });
  return user.save();
}

async function tagCreate(name, associatedUsers = []) {
  let tag = new Tag({ name: name, associatedUsers: associatedUsers });
  return tag.save();
}

async function answerCreate(
  text,
  ans_by,
  questionId,
  userId,
  ans_date_time = new Date(),
  upvotes = 0,
  comments = []
) {
  let answer = new Answer({
    text: text,
    ans_by: ans_by,
    questionId: questionId,
    userId: userId,
    ans_date_time: ans_date_time,
    upvotes: upvotes,
    comments: comments,
  });
  return answer.save();
}

async function commentCreate(text, comment_by, upvotes = 0, date = new Date()) {
  let comment = new Comment({
    text: text,
    comment_by: comment_by,
    upvotes: upvotes,
    date: date,
  });
  return comment.save();
}

async function questionCreate(
  title,
  summary,
  text,
  tags,
  answers = [],
  user,
  ask_date_time = new Date(),
  views = 0,
  upvotes = 0
) {
  let question = new Question({
    title: title,
    summary: summary,
    text: text,
    tags: tags,
    answers: answers,
    asked_by: user.username,
    userId: user._id,
    ask_date_time: ask_date_time,
    views: views,
    upvotes: upvotes,
  });
  return question.save();
}

const populate = async () => {
  let u1 = await userCreate("Lil Timmy", "timothyRaps@soundcloud.com", "securepassyo", false);
  let u2 = await userCreate("Ajay Hedge", "goatTA@stonybrook.edu", "ilove316", false);
  let u3 = await userCreate("LeBonBon", "youaremysunshine@nba.com", "jokicsweepedmeagain", false);
  let admin = await userCreate("admin", adminArgs[0], adminArgs[1], true);

  let t1 = await tagCreate("react", [u1]);
  let t2 = await tagCreate("javascript", [u1, admin]);
  let t3 = await tagCreate("android-studio", [admin]);
  let t4 = await tagCreate("shared-preferences", [admin]);

  let q1 = await questionCreate(
    "Programmatically navigate using React router",
    "React routing got me messed up bro bro",
    "the alert shows the proper index for the li clicked, and when I alert the variable within the last function I'm calling, moveToNextImage(stepClicked), the same value shows but the animation isn't happening. This works many other ways, but I'm trying to pass the index value of the list item clicked to use for the math to calculate.",
    [t1, t2],
    [],
    u1,
    new Date(2020, 0, 1),
    100,
    0
  );
  let q2 = await questionCreate(
    "I need help with my droid",
    "Make a bad answer and im banning you",
    "I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.",
    [t3, t4, t2],
    [],
    admin,
    new Date(),
    0
  );

  let a1 = await answerCreate(
    "React Router is mostly a wrapper around the history library. history handles interaction with the browser's window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don't have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.",
    u3.username,
    q1._id,
    u3._id,
    new Date(),
    0
  );
  let a2 = await answerCreate(
    "On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn't change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.",
    admin.username,
    q1._id,
    admin._id,
    new Date(),
    500
  );
  let a3 = await answerCreate(
    "Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.",
    u1.username,
    q2._id,
    u1._id,
    new Date(),
    0
  );
  let a4 = await answerCreate(
    "YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);",
    u2.username,
    q2._id,
    u2._id,
    new Date(),
    0
  );
  let a5 = await answerCreate(
    "I just found all the above examples just too confusing, so I wrote my own. ",
    u3.username,
    q2._id,
    u3._id,
    new Date(),
    0
  );

  q1.answers.push(a1);
  q1.answers.push(a2);
  await q1.save();

  q2.answers.push(a3);
  q2.answers.push(a4);
  q2.answers.push(a5);
  await q2.save();

  let c1 = await commentCreate("Interesting question!", u2.username);
  let c2 = await commentCreate("I have a similar problem.", u3.username);
  let c3 = await commentCreate("Great explanation!", u1.username);
  let c4 = await commentCreate("Could you elaborate more?", admin.username);

  u1.userQuestions.push(q1);
  admin.userQuestions.push(q2);
  await Promise.all([u1.save(), admin.save()]);
  a1.comments.push(c1);
  a1.comments.push(c2);
  a3.comments.push(c3);
  a4.comments.push(c4);
  await Promise.all([a1.save(), a3.save(), a4.save()]);

  if (db) db.close();
  console.log("done");
};

populate().catch((err) => {
  console.log("ERROR: " + err);
  if (db) db.close();
});

console.log("processing ...");
