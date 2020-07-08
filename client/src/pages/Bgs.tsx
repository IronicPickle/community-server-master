import React, { Component } from "react";
import { withStyles, Theme, Container, Grid, Paper, Typography, Toolbar, IconButton, Tooltip, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import HTTPMissions, { MissionData } from "../http_utils/HTTPMissions";
import MissionList from "../components/sections/bgs/MissionList";
import Mission from "../components/sections/bgs/Mission";
import RefreshIcon from "@material-ui/icons/Refresh";

const styles = (theme: Theme) => ({
  mainContainer: {
    minWidth: 800,
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  },

  bgsContianer: {
    marginTop: theme.spacing(1)
  }, listContainer: {

  }, missionContainer: {
    
  }, divider: {
    backgroundColor: theme.palette.secondary.dark
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
}

interface State {
  missions?: MissionData[];
  mission?: MissionData;
  maxPage: number;
  currentPage: number
}

class Bgs extends Component<Props, State> {
  static contextType = GlobalContext;
  
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      missions: undefined,
      mission: undefined,
      maxPage: 0,
      currentPage: 0
    }

    this.updateMissions = this.updateMissions.bind(this);
    this.displayMission = this.displayMission.bind(this);
    this.onNextPage = this.onNextPage.bind(this);
    this.onPrevPage = this.onPrevPage.bind(this);
  }

  componentDidMount() {
    this.updateMissions();
  }

  async updateMissions() {
    this.context.toggleLoader(true);
    const res = await HTTPMissions.query(this.state.currentPage * 10);
    this.context.toggleLoader(false);
    if(!res.data) return;
    this.setState({ missions: res.data.missions, maxPage: Math.floor(res.data.count / 10) }, () => {
      if(!this.state.mission) this.displayMission(0);
    });
  }

  displayMission(index: number) {
    if(!this.state.missions) return;
    const mission = this.state.missions[index];
    this.setState({ mission });
  }

  onNextPage() {
    if(this.state.maxPage === this.state.currentPage) return;
    this.setState({ currentPage: this.state.currentPage + 1 }, () => {
      this.updateMissions();
    });
  }

  onPrevPage() {
    if(this.state.currentPage === 0) return;
    this.setState({ currentPage: this.state.currentPage - 1 }, () => {
      this.updateMissions();
    });
  }
  
  render() {
    const { classes } = this.props;
    const { missions, mission, currentPage, maxPage } = this.state;

    return (
      <>
        <Container className={classes.mainContainer}>
          <Paper>
            <Toolbar>
              <Grid container justify="flex-start">
                <Grid item>
                  <Typography
                    variant="h6"
                    component="h6"
                    align="center"
                  >Background Simulation</Typography>
                </Grid>
              </Grid>
              <Grid container justify="flex-end">
                <Grid item>
                  <Toolbar style={{ padding: 0 }}>
                    {
                      (this.context.memberData.webPerms["broadcast-mission"]) ?
                        <IconButton onClick={() => { this.context.toggleContainer("createMission", true, () => { this.updateMissions(); }) }} color="secondary">
                          <Tooltip title="Create Mission" aria-label="create mission">
                            <AddCircleOutlineIcon color="secondary"/>
                          </Tooltip>
                        </IconButton>
                      : null
                    }
                    <IconButton onClick={this.updateMissions} color="secondary">
                      <Tooltip title="Refresh" aria-label="refresh">
                        <RefreshIcon color="secondary"/>
                      </Tooltip>
                    </IconButton>
                  </Toolbar>
                </Grid>
              </Grid>
            </Toolbar>
          </Paper>
          <Grid container justify="space-evenly" spacing={1} wrap="nowrap" className={classes.bgsContianer}>
            <Grid item sm={4}>
              <Paper>
                <Toolbar>
                  <Typography
                    variant="h6"
                    component="h6"
                    align="center"
                  >Previous Missions</Typography>
                </Toolbar>
                <Divider className={classes.divider} variant="middle" />
                <MissionList
                  missions={missions}
                  selectedMission={mission}
                  currentPage={currentPage}
                  maxPage={maxPage}
                  displayMission={this.displayMission}
                  onNextPage={this.onNextPage}
                  onPrevPage={this.onPrevPage}
                  />
              </Paper>
            </Grid>
            <Grid item sm={8}>
              <Paper>
                <Toolbar>
                  <Typography
                    variant="h6"
                    component="h6"
                    align="center"
                  >Current Mission</Typography>
                </Toolbar>
                <Divider className={classes.divider} variant="middle" />
                <Mission mission={mission} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Bgs);