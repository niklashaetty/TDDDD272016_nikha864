/**
 * Created by iinh on 4/19/17.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import FontIcon from 'material-ui/FontIcon';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

// Components
import Header from './header';
import CourseDashBoard from './coursedashboard';
import CoursePlan from './courseplan';
import Auth from './auth';
import {CoursePlanNotFound} from './errorpages';

// CSS
import '../css/contentboxes.css';
import '../css/editor.css';
import '../css/hint.css'; // Tooltips hint.css

// Components
import Semester from './semester';

// Animations
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup' // ES6


const years = [
    <MenuItem key={1} value={2010} primaryText="2010" />,
    <MenuItem key={2} value={2011} primaryText="2011" />,
    <MenuItem key={3} value={2012} primaryText="2012" />,
    <MenuItem key={4} value={2013} primaryText="2013" />,
    <MenuItem key={5} value={2014} primaryText="2014" />,
    <MenuItem key={6} value={2015} primaryText="2015" />,
    <MenuItem key={7} value={2016} primaryText="2016" />,
    <MenuItem key={8} value={2017} primaryText="2017" />,
    <MenuItem key={9} value={2018} primaryText="2018" />,
    <MenuItem key={10} value={2019} primaryText="2019" />,
    <MenuItem key={11} value={2020} primaryText="2020" />,
    <MenuItem key={12} value={2021} primaryText="2021" />,
    <MenuItem key={13} value={2022} primaryText="2022" />,
    <MenuItem key={14} value={2023} primaryText="2023" />,
    <MenuItem key={15} value={2024} primaryText="2024" />,
    <MenuItem key={16} value={2025} primaryText="2025" />,
];

const styles = {
    radioButton: {
        icon:  {
            width: 15,
            height: 15,
            marginTop: 3,
        },

        text: {
            fontSize: 12,
            width: 140,
            height: 5,
            marginLeft: -10,
            marginRight: -50
        }
    },
    selectField:{
        color: '#595959',
        width: '150px',
        marginTop: -15

    },
    addIcon:
      {
          marginTop: '5px',
          marginLeft: '10px',
          fontSize: '40px',
          color: '#77898C',
          cursor: 'pointer',
      }
};

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
            snackbarOpen: false,
            snackbarMessage: '',
            maxAllowedSemesters: 4,
            value: 2017,
            semester: 'Spring (VT)',
            loadingAddingPlan: false,
            snackbarColor: 'white'
        };
    }

    // Callback so that children of CoursePlanEditor can callback for re-rendering
    // Also shows snackbar message.
    updateEditor = (response) => {
        console.log("callback init");
        if(response.success){
            this.setState({snackbarMessage: response.message,
                snackbarColor: 'white'});
            this.componentWillMount();
        }

        else{
            this.setState({snackbarMessage: response.message,
                snackbarColor: 'red'});


        }
        this.handleOpenSnackbar();
        console.log("callback done");

    };

    /* Here is logic to handle the snackbar
     that is used for feedback from adding a semester
     */
    handleOpenSnackbar = () => {
        this.setState({
            snackbarOpen: true,
        });
    };

    handleRequestCloseSnackbar = () => {
        this.setState({
            snackbarOpen: false,
        });
    };

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
                loading: false,
            });
        }

        else{
            this.setState({
                username: username,
                coursePlanDoesNotExists: true,
                loading: false,
            });
        }
    }

    // Send a request to the server to add a semester to the current course plan.
    async addSemester(event) {
        event.preventDefault();
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("semester_name", this.state.semester + ' ' + this.state.value);
        payload.append("identifier", this.state.plan.plan_hash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/add_semester', {
            method: 'post',
            body: payload
        });

        let response = await request.json();

        if(response.success){
            // Re-render course plans to update the new one
            this.componentWillMount();
            this.setState({
                snackbarMessage: response.message,
                snackbarColor: 'white',
                loadingAddingPlan: false

            });
        }

        else{
            this.setState({
                snackbarMessage: response.message,
                snackbarColor: 'red',
                loadingAddingPlan: false

            });
        }

        this.handleOpenSnackbar();
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

    /* Push all semesters into a list of Semester components that can be rendered easily */
    fillSemesters(){
        console.log("filling semesters");
        let semesters = this.state.plan.semesters;
        console.log(semesters);
        let semesterBoxes = [];
        for (let i = 0; i < semesters.length; i++) {
            semesterBoxes.push(<Semester key={i} callback={this.updateEditor} plan={this.state.plan} editMode={true} semesterIndex={i} semester={semesters[i]} scheduleConflict={semesters[i].schedule_conflict}/>)
        }

        return semesterBoxes;
    };

    // Change year
    handleChangeYear = (event, index, value) => this.setState({value});

    // Change VT/HT
    handleRadioChange = (e) => this.setState({semester: e.target.value});

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

        // If the course plan does not exist, render template showing that
        else if (this.state.coursePlanDoesNotExists) {
            return (
              <div>
                  <CoursePlanNotFound/>
              </div>
            );

        }

        // all ok, render plan in editor mode.
        else {
            console.log("rendering semesters");

            let semesterBoxes = this.fillSemesters(this.state.plan);
            console.log(semesterBoxes);
            let addNewSemesterButton = null;

            if(semesterBoxes.length <= this.state.maxAllowedSemesters-1){
                let boxClassName;
                switch(semesterBoxes.length){
                    case 0:
                        boxClassName = 'upper_left_wrapper';
                        break;
                    case 1:
                        boxClassName = 'upper_right_wrapper';
                        break;
                    case 2:
                        boxClassName = 'lower_left_wrapper';
                        break;

                    case 3:
                        boxClassName = 'lower_right_wrapper';
                        break;
                }

                // This means that we're currently adding a new plan, show loading icon
                if(this.state.loadingAddingPlan) {
                    addNewSemesterButton = <div className={boxClassName} style={{backgroundColor: 'transparent'}} >
                        <div className="box_content_loading" >
                            <CircularProgress size={40} thickness={2} />
                        </div>
                    </div>;
                }

                // Not loading a newly added plan
                else{
                    addNewSemesterButton =
                      <div className={boxClassName} style={{backgroundColor: 'transparent'}}>
                          <div className="invisible_box">
                              <div className="dropdown">
                                  <RadioButtonGroup name="shipSpeed" valueSelected={this.state.semester}
                                                    onChange={this.handleRadioChange}>
                                      <RadioButton
                                        value="Spring (VT)"
                                        label="Spring (VT)"
                                        labelStyle={styles.radioButton.text}
                                        iconStyle={styles.radioButton.icon}
                                      />
                                      <RadioButton
                                        value="Fall (HT)"
                                        label="Fall (HT)"
                                        labelStyle={styles.radioButton.text}
                                        iconStyle={styles.radioButton.icon}
                                      />
                                  </RadioButtonGroup>
                              </div>
                              <div className="dropdown">
                                  <SelectField

                                    value={this.state.value}
                                    onChange={this.handleChangeYear}
                                    floatingLabelText="Year"
                                    floatingLabelFixed={true}
                                    style={styles.selectField}
                                  >
                                      {years}
                                  </SelectField>
                              </div>
                              <div className="add_button">
                                  <FontIcon
                                    className="material-icons"
                                    style={styles.addIcon}
                                    onClick={() => this.addSemester(event)}
                                  >add</FontIcon>
                              </div>
                          </div>
                      </div>;

                }


            }
            let schedulingConflicts = CoursePlan.checkScheduleConflicts(this.state.plan);
            return (
              <div>
                  <Header user={this.state.username}/>
                  <div className="toppadding100"> </div>
                  <CSSTransitionGroup
                    transitionName="example"
                    transitionAppear={true}
                    transitionAppearTimeout={300}
                    transitionEnter={false}
                    transitionLeave={false}>
                      <div className="content_wrapper">
                          <div className="semester_boxes">
                          <CSSTransitionGroup
                            transitionName="example"
                            transitionEnterTimeout={300}
                            transitionLeaveTimeout={300}>
                              {semesterBoxes}
                          </CSSTransitionGroup>
                          <CSSTransitionGroup
                            transitionName="example"
                            transitionAppear={true}
                            transitionAppearTimeout={300}
                            transitionEnter={false}
                            transitionLeave={false}>
                              {addNewSemesterButton}
                          </CSSTransitionGroup>
                          </div>

                          <div className="lowest_wrapper">
                              <CourseDashBoard name={this.state.plan.name} scheduleConflict={schedulingConflicts}
                                               username={this.state.username}
                                               allowEdit={true}
                                               profile={this.state.plan.profile}
                                               programme={this.state.plan.programme} planHash={this.state.planHash}
                                               owner={this.state.planOwner} ects={this.state.ECTS}
                                               advancedECTS={this.state.advancedECTS} editMode={true}/>
                          </div>
                      </div>
                      <Snackbar
                        open={this.state.snackbarOpen}
                        message={this.state.snackbarMessage}
                        autoHideDuration={4000}
                        onRequestClose={this.handleRequestCloseSnackbar}
                        contentStyle={{ color: this.state.snackbarColor}}
                      />
                  </CSSTransitionGroup>
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