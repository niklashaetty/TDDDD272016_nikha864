# [project name] - TDDD27 Advanced web programming
[Click here to get to up-to-date deployment](https://tddd27-nikha864.herokuapp.com/)

[project name] is a webbapplication that lets you create you own course plan for your masters program. Lets you visualize your course plan,
complete with requirements for graduation and warnings of potential schedule conflicts and requirement checking.

The idea is that you should be able to share your plan as a simple link, i.e https://tddd27-nikha864.herokuapp.com/p/testhash.

## Project identity
Niklas Hätty - nikha864@student.liu.se

## Main features
* Create multiple course plans
* User-friendly visualization of plans.
* Save, edit, remove course plans
* User account with saved, favourite plans
* Feedback on plans, i.e. scheduling conflicts, missing ECTS points etc.

## If i have time
* SSL/TLS encryption

## Built with
The following tools will be used in the project
* [React](https://facebook.github.io/react/) - Front end library
    * React-router for routing.
* [Material-ui](http://www.material-ui.com) - For UI components.
* [Flask](http://flask.pocoo.org/) - Back end framework (more like back end api)
* [Heroku](https://www.heroku.com) - Deployment
* [PosgreSQL](https://www.postgresql.org/) - Database (hosted on Heroku)
* [MongoDB](https://www.mongodb.com/) - Database for storing course plans (Hosted on MLab via Heroku add-on)

Yes, right now i'm using two databases. The mongodb database stores the entire course plans.
 This works really well because the content of a course plan can differ greatly, and translating a
 JSON format is very easy for both the backend and frontend. Eventually, i'll probably just migrate everything
 to mongodb.


## Extra tools
* [Postman](https://www.getpostman.com/) - Used to test back end.
* Some sort of testing tool to automate page-loading into correct page. <-- create-react-app does this
* [create-react-app](https://github.com/facebookincubator/create-react-app) - Client build tool. React app with no configuration.
