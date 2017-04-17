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
import CircularProgress from 'material-ui/CircularProgress';

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
            username: this.props.location.state.username,
            plans: null,
            loading: true
        };
    }

    // After the first render, start retrieving course plans from the server
    async componentDidMount(){
        let request = await this.getCoursePlans();
        if (request.success){
            this.setState({
                plans: request.course_plans,
                loading: false
            })
        }
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

    // Send a delete request to the server. If successful we'll log out the user as well
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

    // Get course plans given a owner (represented by a token) from the server
    async getCoursePlans () {

        let payload = new FormData();
        payload.append("token", Auth.getToken());
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_all_plans', {
            method: 'post',
            body: payload
        });
        return await request.json();
    }

    // Fill a list of PlannerLink components from a list of course plans that were retrieved from the server
    fillCoursePlans(){
        let result = [];
        let plans = this.state.plans;
        console.log(plans);
        if(plans.length > 0) {
            for (let i = 0; i < plans.length; i++) {
                console.log(plans[i].name);
                console.log(plans[i].plan_hash);
                result.push(<PlannerLink name={plans[i].name} plan_hash={plans[i].plan_hash}/>)
            }
        }
        else {

            let noPlans =
              <div className="">
                  <Divider style={{backgroundColor: '#F2F8FA'}}/>
                  <p className="info_text"> You have no plans yet, why not create one?!</p>
              </div>;
            result.push(noPlans);
        }
        return result;
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

        // When loading, show a loading icon
        if(this.state.loading){
            return(

              <div>
                  <Header user={this.state.username}/>
                  <div className="padding500"> </div>
                  <CircularProgress size={80} thickness={5} />
              </div>
            )
        }
        else {
            let coursePlans = this.fillCoursePlans();
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
                              <div className="box_content_right_smaller">
                                  <div className="field">
                                  </div>
                                  <div className="field">
                                  </div>
                                  <div className="field">
                                      <Link onClick={() => {
                                          Auth.logOut()
                                      }}
                                            to={{pathname: '/'}}>
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
}

export default Dashboard;