var express = require('express');
var router = express.Router();
const user = require("../models/userModel")
const   Expense = require("../models/expensemodel")


//passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(user.authenticate()));
 passport.use(user.createStrategy());

//nodemailar
const {sendmail } = require("../utils/sendmail");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{ admin:req.user });
});

router.get('/', function(req, res, next) {
  res.render('home',{ admin:req.user });
});

router.post("/",
   passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/",
    }),
    function (req, res, next) {}
);
router.get("/about", function (req, res, next) {
  res.render("about", { admin: req.user });
});

router.get("/contact", function (req, res, next) {
  res.render("contact", { admin: req.user });
});

router.get('/signup', function(req, res, next) {
  res.render('signup',{ admin:req.user });
});
  // res.json(req.body); json format mein dkhte hain  
  router.post("/signup", async function (req, res, next) {
    try {
        await user.register(
            { username: req.body.username, email: req.body.email },
            req.body.password
        );
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
router.get("/forget", function (req, res, next) {
  res.render("forget", { admin: req.user });
});

router.post("/send-mail", async function (req, res, next) {
  try {
      const user = await user.findOne({ email: req.body.email });
      if (!user)
          return res.send("User Not Found! <a href='/forget'>Try Again</a>");

      sendmail(user.email, user, res, req);
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.post("/forget/:id", async function (req, res, next) {
  try {
      const user = await user.findById(req.params.id);
      if (!user)
          return res.send("User not found! <a href='/forget'>Try Again</a>.");

      if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/signin");
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      }
  } catch (error) {
      res.send(error);
  }
});

// router.post("/forget", async function (req, res, next) {
//   try {
//     const user = await user.findOne({ username: req.body.username });
//     if (!user)
//       return res.send("User not found! <a href='/forget'>Try Again</a>");
//     await user.setPassword(req.body.newpassword);
//     await user.save();
//     res.redirect("/");
//   } catch (error) {
//     res.send(error);
//   }
// });
// router.get('/profile',isLoggedIn, function(req, res, next) {
//   res.render('profile',{ admin:req.user });
// });

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      const { expenses } = await req.user.populate("expenses");
      console.log(req.user, expenses);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      res.send(error);
  }
});

router.get('/reset',isLoggedIn, function(req, res, next) {
  res.render('reset',{ admin:req.user });
});

router.post('/reset', async function(req, res, next) {
  res.render('reset',{ admin:req.user });
  try {
    await req.user.changePassword(
        req.body.oldpassword,
        req.body.newpassword );
       await req.user.save();
        res.redirect("/");
} catch (error) {
    res.send(error);
}
});

router.get('/signout', isLoggedIn, function(req,res, next){
  req.logout(()=>{
    res.redirect('/')

  })
})
//AUTHENTICATED ROUTE MIDDLEWARE

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.redirect("/");
  }
}

router.get("/createexpense", isLoggedIn, function (req, res, next) {
  res.render("createexpense", { admin: req.user });
});

router.post("/createexpense", isLoggedIn, async function (req, res, next) {
  try {
      const expense = new Expense(req.body);
      req.user.expenses.push(expense._id);
      expense.user = req.user._id;
      await expense.save();
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      res.send(error);
  }
});

router.get("/filter", async function (req, res, next) {
  try {
      let { expenses } = await req.user.populate("expenses");
      expenses = expenses.filter((e) => e[req.query.key] == req.query.value);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.get('/delete/:id', async function (req, res, next) {
  try {
      await Expense.findByIdAndDelete(req.params.id)
      res.redirect("/profile")
  } catch (error) {
      res.send(error)
  }
})

router.get('/update/:id', isLoggedIn, async function (req, res, next) {
  try {
      const data = await Expense.findById(req.params.id)
      res.render('update', { rohit: req.user, data })
  } catch (error) {
      res.send(error)
  }
});

router.post('/update/:id', isLoggedIn, async function (req, res, next) {
  try {
      const data = await Expense.findByIdAndUpdate(req.params.id, req.body)
      await data.save()
      res.redirect('/profile')
  } catch (error) {

  }
})

module.exports = router;
