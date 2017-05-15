/**
 * This module contains the course plan parent that ties a courseplan together.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';

// CSS
import '../css/contentboxes.css';
import '../css/courseplan.css';
import '../index.css';
import '../css/hint.css'; // Tooltips hint.css
import '../css/transitions.css';

// Components
import Header from './header';
import Auth from './auth';
import {CoursePlanNotFound} from './errorpages';
import Semester from './semester';
import CourseDashBoard from './coursedashboard';

// Animations
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup' // ES6

/** The main course plan component that renders an entire course plan*/
class CoursePlan extends Component {
    constructor(props) {
        super(props);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.state = {
            allowEdit: false,
            username: null,
            planOwner: null,
            planHash: null,
            openDialog: false,
            loading: true,
            ECTS: 0,
            advancedECTS: 0,
            coursePlanDoesNotExists: false,
            snackbarMessage: ''
        };
    }

    async componentWillMount() {
        let coursePlan = await this.getCoursePlan();
        let username = await Auth.getUsername();

        if(coursePlan.success){
            this.setState({
                username: username,
                allowEdit: coursePlan.plan.owner === username,
                planOwner: coursePlan.plan.owner,
                planHash: coursePlan.plan.plan_hash,
                planName: coursePlan.plan.name,
                planProgramme: coursePlan.plan.programme,
                planProfile: coursePlan.plan.profile,
                planScheduleConflict: false,
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

    /* Get the course plan of current link. Set meta dat */
    async getCoursePlan() {

        // Get the hash of the course plan by looking at the url. Lets hope that works...
        let planHash = window.location.href.substring(window.location.href.lastIndexOf('/')+1);

        // Send a request for plan
        let payload = new FormData();
        payload.append("plan_hash", planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_plan', {
            method: 'post',
            body: payload
        });
        return await request.json();
    }

    /* Push all semesters into a list of Semester components that can be rendered easily */
    fillSemesters(){
        let semesters = this.state.plan.semesters;
        let semesterBoxes = [];
        for (let i = 0; i < semesters.length; i++) {

            semesterBoxes.push(<Semester key={i} plan={this.state.plan} semesterIndex={i} semester={semesters[i]} scheduleConflict={semesters[i].schedule_conflict}/>)

        }

        return semesterBoxes;
    };

    /* Check if a plan contains any semesters with scheduling conflicts */
    static checkScheduleConflicts(plan){
        let semesters = plan.semesters;
        for (let i = 0; i < semesters.length; i++) {
            if(semesters[i].schedule_conflict){
                return true;
            }
        }
        return false;
    };


    render() {
        // Show loading icon when loading
        if(this.state.loading){
            return(
              <div>
                  <Header user={this.state.username}/>
                  <div className="fullpage_loading">
                      <CircularProgress size={50} thickness={2}/>
                  </div>
              </div>
            )
        }
        else {
            // If the course plan does not exist, render template showing that
            if(this.state.coursePlanDoesNotExists){
                return (
                  <div>
                      <CoursePlanNotFound/>
                  </div>
                );
            }

            // But if we DO find a course plan, lets render it!
            else {
                let semesterBoxes = this.fillSemesters();
                let scheduleConflicts = CoursePlan.checkScheduleConflicts(this.state.plan);
                return (

                  <div>
                      <Header user={this.state.username}/>

                      <div className="toppadding100"> </div>


                      <div className="content_wrapper">
                          <CSSTransitionGroup
                            transitionName="example"
                            transitionAppear={true}
                            transitionAppearTimeout={300}
                            transitionEnter={false}
                            transitionLeave={false}>
                            {semesterBoxes}
                      </CSSTransitionGroup>

                      <div className="lowest_wrapper">
                          <CSSTransitionGroup
                            transitionName="example"
                            transitionAppear={true}
                            transitionAppearTimeout={300}
                            transitionEnter={false}
                            transitionLeave={false}>
                              <CourseDashBoard key="2" name={this.state.name} scheduleConflict={scheduleConflicts} username={this.state.username}
                                            allowEdit={this.state.allowEdit} profile={this.state.profile}
                                            programme={this.state.programme} planHash={this.state.planHash}
                                            owner={this.state.planOwner} ects={this.state.ECTS}
                                            advancedECTS={this.state.advancedECTS} editMode={false}/>
                          </CSSTransitionGroup>

                      </div>

                  </div>

            </div>

            );
            }
        }
    }
}

export default CoursePlan;