# Master course planner - TDDD27 Advanced web programming
Master course planner is a web application that lets you create you own course plan for your masters program. The application lets you easily add and remove courses to your plan, save it, edit it, and share it with your friends.


The idea is that you should be able to share your plan as a simple link, i.e https://tddd27-nikha864.herokuapp.com/p/ENMSplv9.

## Screencast
This project is presented in a screncast.
[Screencast link](https://www.youtube.com/watch?v=TLbFT7NlZ5U)

## Deployment
This project is deployed on the web using Heroku.
[Click here to get to up-to-date deployment](https://tddd27-nikha864.herokuapp.com/)

## Project identity
Niklas Hätty - nikha864@student.liu.se

## Main features
* Create multiple course plans
* User-friendly visualization of plans.
* Save, edit, remove course plans
* User account with saved, favourite plans
* Feedback on plans, i.e. scheduling conflicts, missing ECTS points etc.


## Built with
The following tools is used in the project
* [React](https://facebook.github.io/react/) - Front end library
    * React-router for routing.
    * create-react-app build tool
* [Material-ui](http://www.material-ui.com) - For UI components.
* [Flask](http://flask.pocoo.org/) - Back end framework (api)
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
