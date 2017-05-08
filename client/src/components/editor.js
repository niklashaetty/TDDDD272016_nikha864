/**
 * Created by iinh on 4/19/17.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import CircularProgress from 'material-ui/CircularProgress';

// Components
import Header from './header';
import CoursePlanDashboard, {CourseDashBoard} from './courseplan';
import Auth from './auth';

// CSS
import '../css/contentboxes.css';
import '../css/hint.css'; // Tooltips hint.css

class CoursePlanEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.location.state.username,
            planHash: this.props.location.state.planHash,
            ECTS : 0,
            advancedECTS: 0,
            plan: null,
            planOwner: null,
            loading: true,
            coursePlanDoesNotExists: false,
            scheduleConflict: false
        };
    }

    async componentWillMount() {
        let coursePlan = await this.getCoursePlan();
        let username = await Auth.getUsername();

        if(coursePlan.success){
            this.setState({
                username: username,
                planOwner: coursePlan.plan.owner,
                ECTS: coursePlan.plan.ects,
                advancedECTS: coursePlan.plan.advanced_ects,
                plan: coursePlan.plan,
                loading: false
            });
        }

        else{
            this.setState({
                username: username,
                coursePlanDoesNotExists: true,
                loading: false
            });
        }
    }

    async getCoursePlan() {
        // Send a request plan data again in editor mode to make sure nothing fishy is going on.
        let payload = new FormData();
        payload.append("plan_hash", this.state.planHash);
        payload.append("token", Auth.getToken());
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_plan_editor', {
            method: 'post',
            body: payload
        });
        return await request.json();
    }

    render() {
        // Show loading icon when loading
        if(this.state.loading){
            return(
              <div>
                  <Header user={this.state.username}/>
                  <div className="padding500"> </div>
                  <CircularProgress size={80} thickness={5} />
              </div>
            )
        }

        // not loading any more
        else {
            return (
              <div>
                  <Header user={this.state.username}/>
                  <div className="toppadding100"> </div>
                  <div className="content_wrapper">

                      <div className="lowest_wrapper">
                          <CourseDashBoard name={this.state.plan.name} scheduleConflict={this.state.scheduleConflict}
                                           username={this.state.username}
                                           allowEdit={true}
                                           profile={this.state.plan.profile}
                                           programme={this.state.plan.programme} planHash={this.state.planHash}
                                           owner={this.state.planOwner} ects={this.state.ECTS}
                                           advancedECTS={this.state.advancedECTS} editMode={true}/>
                      </div>
                  </div>
              </div>
            );
        }
    }
}

// Default properties for the header class
Header.defaultProps = {
    user: null
};

export default CoursePlanEditor;