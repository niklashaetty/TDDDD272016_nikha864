/**
 * Created by iinh on 4/11/17.
 */
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';
import {browserHistory} from 'react-router';


// Material UI
import FontIcon from 'material-ui/FontIcon';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

// CSS
import '../css/contentboxes.css';
import '../index.css';

// Components
import Header from './header';
import Auth from './auth';

const styles = {
    button: {
        width: 85,
        height: 35,
    },
    deletebutton: {
        width: 85,
        height: 35,
    }
};

class CoursePlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allowEdit: false,
            username: null,
            planOwner: null,
            planHash: null,
            openDialog: false
        };
    }

    async getPlanData(planHash) {
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("plan_hash", planHash);
        const response = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_plan_data', {
            method: 'post',
            body: payload
        });
        return await response.json();
    }

    /*
     Get all props before rendering the plan. Start the prop-gathering by looking at the url. Lets hope that works...
     */
    async componentWillMount() {
        let planHash = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
        let planDataResponse = await this.getPlanData(planHash);

        // If plan data could not be found, push the user to 404 page
        // (NOT_FOUND will render NotFound component)
        if(!planDataResponse.success){
            browserHistory.push('/NOT_FOUND');
        }

        // Harvest props from the server response
        else{
            this.setState({
                allowEdit: planDataResponse.allow_edit,
                planOwner: planDataResponse.owner,
                username: planDataResponse.username,
                planHash: planHash
            });
        }
    }

    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };

    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

    render() {
        const dialogActions = [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialog}
            />,
            <FlatButton
              label="Delete"
              primary={true}
              onTouchTap={this.handleCloseDialog}
            />,
        ];

        return (
          <div>
              <Header user={this.state.username}/>
              <div className="toppadding100"> </div>
              <div className="content_wrapper">

                  <div className="upper_left_wrapper">
                      <div className="box_headline"> VT 2017</div>
                      <div className="box_content">

                      </div>
                  </div>

                  <div className="upper_right_wrapper">
                      <div className="box_headline"> VT 2017</div>
                      <div className="box_content">
                      </div>
                  </div>

                  <div className="lower_left_wrapper">
                      <div className="box_headline"> VT 2017</div>
                      <div className="box_content">
                      </div>
                  </div>

                  <div className="lower_right_wrapper">
                      <div className="box_headline"> VT 2017</div>
                      <div className="box_content">
                      </div>
                  </div>

                  <div className="lowest_wrapper">
                      <div className="box_headline"> Dashboard</div>
                      <div className="box_content_small">
                          <div className="box_content_left">
                              <div className="field">
                                  <FontIcon className="material-icons" style={{fontSize: '22px', color: '#ED4337', marginRight: 5}} >warning</FontIcon> Advanced ETCS points: 54/60
                              </div>
                              <Divider/>
                              <div className="field_small">
                                  <FontIcon className="material-icons" style={{fontSize: '22px', color: '#ED4337', marginRight: 5}} >warning</FontIcon> Advanced ETCS points: 54/60
                              </div>
                              <div className="field_small">
                                  <LinearProgress style={{color: 'green', marginTop: 2, marginBottom: 2, marginLeft: 25, height: 5}} mode="determinate" max={60} min={0} value={54} />
                              </div>
                              <Divider/>
                              <div className="field_small">
                                  <FontIcon className="material-icons" style={{fontSize: '22px', color: '#66cc91', marginRight: 5}} >check_circle</FontIcon> ECTS points: 120/120

                              </div>
                              <div className="field_small">
                                  <LinearProgress style={{color: 'green', marginLeft: 25, height: 5}} mode="determinate" max={120} min={0} value={120} />
                              </div>
                              <Divider/>
                              <div className="field">
                                  <FontIcon className="material-icons" style={{fontSize: '22px', color: '#66cc91', marginRight: 5}} >check_circle</FontIcon> Required courses
                              </div>
                          </div>
                          <div className="box_content_right">
                              <div className="field">
                                  Programme: Computer science
                              </div>
                              <div className="field">
                                  Profile: Secure Systems
                              </div>
                              <div className="field">
                                  Created by: niklas
                              </div>
                              <div className="field_sidebyside">
                                  <RaisedButton
                                    target="_blank"
                                    label="Edit"
                                    style={styles.button}
                                  />

                              </div>
                              <div className="field_sidebyside">
                                  <RaisedButton
                                    target="_blank"
                                    secondary={true}
                                    label="Delete"
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


                              </div>

                          </div>
                      </div>
                  </div>



              </div>
          </div>
        );
    }

}

export default CoursePlan;