/** Dashboard for one course plan.
 *  Renders feedback for a course plan. */

import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import FontIcon from 'material-ui/FontIcon';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

// Comp
import Auth from './auth';
import Dashboard from './dashboard'

let styles = {
    button: {
        width: 85,
        height: 35,
    },
    deletebutton: {
        width: 85,
        height: 35,
    },
    saveButton: {
        width: 160,
        height: 35,
    },
    icon: {
        marginLeft: 5,
        marginTop: -2,
        color: '#545a6a',
    },
    iconSaved: {
        marginLeft: 5,
        marginTop: -2,
        color: '#FFD700',
    }
};

class CourseDashBoard extends Component {
    constructor(props) {
        super(props);
        this.deleteCoursePlan = this.deleteCoursePlan.bind(this);
        this.savePlan = this.savePlan.bind(this);
        this.unSavePlan = this.unSavePlan.bind(this);
        this.state = {
            openDialog: false,
            maxAdvancedECTS: 60,
            maxECTS: 90,
            editMode: this.props.editMode,
            planSaved: false,
        };
    }

    // Before component is mounted, set status of saved plan
    // This is used for the save plan/unsave button.
    async componentWillMount() {
        let planIsSaved = await this.planIsSaved();
        if (planIsSaved) {
            this.setState({
                planSaved: true,
            });
        }
        else{
            this.setState({
                planSaved: false,
            });
        }
    }

    // Handle dialog logic
    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };

    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

    // Workaround to change color of "Save plan" icon on hover
    addHoverColor() {
        styles.icon.color = '#FFD700';
    }

    removeHoverColor() {
        styles.icon.color = '#545a6a';
    }

    // Handle opening of editor
    openEditor = () => {
        let path = "/p/" + this.props.planHash + "/edit";
        browserHistory.push({
            pathname: path,
            state: {username: this.props.username,
                planHash: this.props.planHash}
        });

    };

    // Handle closing of editor
    exitEditor = () => {
        let path = "/p/" + this.props.planHash;
        browserHistory.push({
            pathname: path,
            state: {username: this.props.username}
        });

    };

    // Send a request to the server to delete a course plan
    async deleteCoursePlan() {
        let planHash = this.props.planHash;
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/delete_plan', {
            method: 'post',
            body: payload
        });
        let response = await request.json();

        // Deletion successful, push user back to dashboard!
        if(response.success){
            browserHistory.push({
                pathname: '/dashboard',
                state: {username: this.props.username}
            });
        }

        // TODO: IN CASE DELETION FAILED; FIX

    };

    async planIsSaved(){
        let request = await Dashboard.getSavedCoursePlans();
        if(request.success){
            for(let i = 0; i < request.saved_plans.length; i++){
                if(request.saved_plans[i].identifier === this.props.planHash){
                    return true
                }
            }
        }
        return false
    }

    // Save a plan
    async savePlan(){
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", this.props.planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/save_plan', {
            method: 'post',
            body: payload
        });
        let response = await request.json();
        if(response.success){
            this.setState({
                planSaved: true,
            });
        }
    };

    // Remove save of a plan
    async unSavePlan(){
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", this.props.planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/unsave_plan', {
            method: 'post',
            body: payload
        });
        let response = await request.json();

        if(response.success){
            this.setState({
                planSaved: false,
            });
        }
    };

    // Define action for the dialog buttons
    defineActions() {
        return [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialog}
            />,
            <FlatButton
              label="Delete"
              primary={true}
              onTouchTap={this.deleteCoursePlan}
            />,
        ];
    }

    render() {
        let dialogActions = this.defineActions();

        // Define icons
        const positiveIcon = <FontIcon
          className="material-icons"
          style={{fontSize: '22px', color: '#66cc91', marginRight: 5}}>check_circle</FontIcon>;

        const negativeIcon = <FontIcon className="material-icons" style={{
            fontSize: '22px',
            color: '#ED4337',
            marginRight: 5
        }}>highlight_off</FontIcon>;

        const warningIcon = <FontIcon className="material-icons" style={{
            fontSize: '22px',
            color: '#ffbb40',
            marginRight: 5
        }}>error_outline</FontIcon>;


        // Check what type of icon should be displayed
        let advancedECTSIcon = (this.props.advancedECTS >= this.state.maxAdvancedECTS) ? positiveIcon : negativeIcon;
        let ECTSIcon = (this.props.ects >= this.state.maxECTS) ? positiveIcon : negativeIcon;
        let scheduleConflictIcon = this.props.scheduleConflict ? warningIcon: positiveIcon;

        // Check for scheduling conflicts
        let scheduleConflict;
        if(this.props.scheduleConflict){
            scheduleConflict =
              <span className="hint--top hint--warning hint--rounded hint--large" aria-label="This plan contains scheduling conflicts. This means two courses run on the same block, at the same time.">
                  <div className="field">
                        {scheduleConflictIcon} Scheduling conflicts
                  </div>
              </span>
        }
        else{
            scheduleConflict =
              <div className="field">
                  {scheduleConflictIcon} No scheduling conflicts!
              </div>
        }

        // Hide edit buttons if in editor mode
        let editButton;
        let deleteButton = null;
        let saveButton = null;
        if(this.state.editMode){
            editButton = <div className="field_sidebyside">
                <RaisedButton
                  target="_blank"
                  label="Back"
                  disabled={!this.props.allowEdit}
                  style={styles.button}
                  onTouchTap={this.exitEditor}
                />
            </div>;

            deleteButton = <div className="field_sidebyside">
                <RaisedButton
                  target="_blank"
                  secondary={true}
                  label="Delete"
                  disabled={!this.props.allowEdit}
                  style={styles.deletebutton}
                  onTouchTap={this.handleOpenDialog}
                />

                <Dialog
                  title="Are you sure you want to delete this course plan?"
                  actions={dialogActions}
                  modal={false}
                  open={this.state.openDialog}
                  onRequestClose={this.handleCloseDialog}
                >
                    This action cannot be reverted.
                </Dialog>
            </div>;
        }
        else{
            editButton = <div className="field_sidebyside">
                <RaisedButton
                  target="_blank"
                  label="Edit"
                  disabled={!this.props.allowEdit}
                  style={styles.button}
                  onTouchTap={this.openEditor}
                />
            </div>;

            // If we are logged in, not in edit mode, and not the owner,
            // we can save the plan. Add button to show this.
            if(!this.props.allowEdit && this.props.username) {

                // If course plan already is saved, show unsave button
                if(this.state.planSaved){
                    saveButton = <div className="field_sidebyside">
                        <RaisedButton
                          target="_blank"
                          label="Plan is saved!"
                          style={styles.saveButton}
                          onTouchTap={this.unSavePlan}
                          icon={<FontIcon
                            className="material-icons"
                            style={styles.iconSaved}>grade
                          </FontIcon>}
                        />
                    </div>;

                }
                // Else we'll show button to save
                else {
                    saveButton = <div className="field_sidebyside">
                        <RaisedButton
                          target="_blank"
                          label="Save this plan"
                          onMouseEnter={this.addHoverColor}
                          onMouseLeave={this.removeHoverColor}
                          style={styles.saveButton}
                          onTouchTap={this.savePlan}
                          icon={<FontIcon
                            className="material-icons"
                            style={styles.icon}>grade
                          </FontIcon>}
                        />
                    </div>;
                }
            }
        }

        return(
          <div>
              <div className="box_headline"> Dashboard</div>
              <div className="box_content_small">
                  <div className="box_content_left">
                      {scheduleConflict}
                      <div className="field_small">
                          {advancedECTSIcon} Advanced ETCS points: {this.props.advancedECTS}/{this.state.maxAdvancedECTS}
                      </div>
                      <div className="field_small">
                          <LinearProgress style={{
                              color: 'green',
                              width: 400,
                              marginTop: 4,
                              marginBottom: 4,
                              marginLeft: 25,
                              height: 5
                          }} mode="determinate" max={this.state.maxAdvancedECTS} min={0} value={this.props.advancedECTS}/>
                      </div>

                      <div className="field_small">

                          {ECTSIcon}ECTS points: {this.props.ects}/{this.state.maxECTS}

                      </div>
                      <div className="field_small">
                          <LinearProgress style={{
                              color: 'green',
                              width: 600,
                              marginLeft: 25,
                              marginTop: 4,
                              marginBottom: 4,
                              height: 5}}
                                          mode="determinate" max={this.state.maxECTS} min={0} value={this.props.ects}/>
                      </div>

                  </div>
                  <div className="box_content_right">
                      <div className="field_small">
                          Course plan name: {this.props.name}
                      </div>
                      <div className="field_small">
                          Created by: {this.props.owner}
                      </div>

                      <div className="field">
                      </div>

                      {editButton}
                      {deleteButton}
                      {saveButton}
                  </div>
              </div>
          </div>
        );
    }
}

export default CourseDashBoard;