import React, {Component} from 'react';
import {Link} from 'react-router';
import {browserHistory} from 'react-router';


// CSS
import '../css/dashboard.css';
import '../css/contentboxes.css';
import '../index.css';

//Material
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

// Components
import Header from './header';
import Auth from './auth';

const styles = {
    button: {
        width: 145,
        height: 30,
    },
    deletebutton: {
        width: 145,
        height: 25,
    },
    button_small: {
        width: 140,
        height: 30,
    }
};

class PlannerLink extends Component {
        constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
        };
    }

    openPlan = () => {
        let planPath = '/p/' + this.props.plan_hash;
        browserHistory.push({
            pathname: planPath,
            state: {username: this.state.username}
        });
    };

    render() {
        return (
          <div className="planner_link">
              <Divider style={{backgroundColor: '#F2F8FA'}}/>
              <a onClick={this.openPlan} className="link_name">{this.props.name}</a>
          </div>
        );
    }
}

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            username: this.props.location.state.username
        };
    }

    /* Here is logic to handle the dialog button
     that is used for the delete user button.
     */
    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };

    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

    async deleteUser (){

        let payload = new FormData();
        payload.append("token", Auth.getToken());
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/delete_user', {
            method: 'post',
            body: payload
        });

        let response = await request.json();
        if(response.success){
            Auth.logOut();
            browserHistory.push('/');
        }
    };

    // Test function to fill course plans
    fillCourseplans () {
        var plans = [
            {name: 'testplan1', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan2', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan3', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan4', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan5', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan6', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan7', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan8', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan9', owner: 'niklas', plan_hash: 'testhash'},
            {name: 'testplan10', owner: 'niklas', plan_hash: 'testhash'}
        ];

        let result = [];

        for(let i = 0; i < plans.length; i++){
            result.push(<PlannerLink name={plans[i].name} plan_hash={plans[i].plan_hash}/>)
        }
        return result
    }

    render() {
        // Actions for the dialog button
        const dialogActions = [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialog}
            />,
            <FlatButton
              label="Delete"
              primary={true}
              onTouchTap={this.deleteUser}
            />,
        ];

        let coursePlans = this.fillCourseplans();
        return (

          <div>
              <Header user={this.state.username}/>
              <div className="toppadding100"> </div>
              <div className="content_wrapper">

                  <div className="upper_left_wrapper">
                      <div className="box_headline"> My course plans</div>
                      <div className="box_content">
                          <div className="course_plans">
                              {coursePlans}
                          </div>
                          <div className="button_div">
                              <RaisedButton
                                target="_blank"
                                label="Create new"
                                style={styles.button_small}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="upper_right_wrapper">
                      <div className="box_headline"> Saved course plans</div>
                      <div className="box_content">
                      </div>
                  </div>

                  <div className="lowest_wrapper">
                      <div className="box_headline"> Dashboard</div>
                      <div className="box_content_small">
                          <div className="box_content_left_bigger">
                          </div>
                          <div className="box_content_right_smaller" >
                              <div className="field">
                              </div>
                              <div className="field">
                              </div>
                              <div className="field">
                                  <Link onClick={() => {Auth.logOut()}}
                                        to={{pathname: '/'}} >
                                      <RaisedButton
                                        target="_blank"
                                        label="Log out"
                                        style={styles.button}
                                      />
                                  </Link>
                              </div>

                              <div className="field">
                                  <RaisedButton
                                    target="_blank"
                                    secondary={true}
                                    label="Delete user"
                                    style={styles.deletebutton}
                                    onTouchTap={this.handleOpenDialog}
                                  />
                                  <Dialog
                                    title="Are you sure you want to delete your user account?"
                                    actions={dialogActions}
                                    modal={false}
                                    open={this.state.openDialog}
                                    onRequestClose={this.handleCloseDialog}
                                  >
                                      This action cannot be undone.
                                  </Dialog>
                              </div>

                          </div>
                      </div>
                  </div>
              </div>

          </div>
        );
    }
}

export default Dashboard;