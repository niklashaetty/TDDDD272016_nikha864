import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

// CSS
import '../css/dashboard.css';
import '../index.css';

// Components
import Header from './header';
import Auth from './auth';
/////////////////////////////////////////////////////////////////////////////

class PlannerLink extends Component {
    render() {
        return (
          <div className="planner_link">
              <a className="link_name">{this.props.name}</a>
          </div>
        );
    }
}

class Dashboard extends Component {

    // Test function to fill course plans
    fillCourseplans () {
        var plans = [
            {name: 'testplan1'},
            {name: 'testplan2'},
            {name: 'testplan3'},
            {name: 'testplan4'},
            {name: 'testplan5'},
            {name: 'testplan6'},
            {name: 'testplan7'},
            {name: 'testplan8'},
            {name: 'testplan9'},
            {name: 'testplan10'}
        ];

        let result = [];

        for(let i = 0; i < plans.length; i++){
            result.push(<PlannerLink name={plans[i].name}/>)
        }
        return result
    }


    render() {

        let coursePlans = this.fillCourseplans();
        return (
          <div className="wrapper">
              <Header user={this.props.location.state.username}/>
              <div className="dashboard_wrapper">
                  <div className="dashboard_left">
                      <div className="dashboard_headline">My course plans</div>
                      <div className="dashboard_big">
                          <div className="planner_link">
                              <p className="link_headline">Name</p>
                          </div>
                          {coursePlans}
                          <div className="button_div_left">
                          <div className="button"><FontAwesome name="plus" /> Create new</div>
                          </div>
                      </div>

                      <div className="whitespace"> </div>

                      <div className="dashboard_headline">Saved course plans</div>
                      <div className="dashboard_big">
                      </div>
                  </div>

                  <div className="dashboard_right">
                      <div className="dashboard_headline">Dashboard</div>
                      <div className="dashboard_small">
                          <div className="button_div">
                          <Link to={{pathname: '/'}}>
                              <div onClick={() => {Auth.logOut()}} className="button"><FontAwesome name="sign-out" />Log out</div>
                          </Link>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
        );
    }
}

export default Dashboard;