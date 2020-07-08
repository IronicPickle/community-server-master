import React, { Component, MouseEvent } from "react";
import { Theme, withStyles, Toolbar, Typography, Grid, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import moment from "moment";
import { MissionData } from "../../../http_utils/HTTPMissions";

const styles = (theme: Theme) => ({
  mainContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  missionContainer: {
    minHeight: theme.spacing(4),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark
    }
  }, navigationContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  }, button: {
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline"
    }
  }, buttonDisabled: {
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
    opacity: 0.5
  }, divider: {
    backgroundColor: theme.palette.secondary.dark
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
  missions?: MissionData[];
  selectedMission?: MissionData;
  currentPage: number;
  maxPage: number;
  displayMission: (index: number) => void;
  onNextPage: (event: MouseEvent<HTMLParagraphElement>) => void;
  onPrevPage: (event: MouseEvent<HTMLParagraphElement>) => void;
}

class MissionList extends Component<Props> {

  constructor(props: Props) {
    super(props);

    this.onMissionSelect = this.onMissionSelect.bind(this);
  }

  onMissionSelect(index: number) {
    return () => {
      this.props.displayMission(index);
    }
  }
  
  render() {
    const {
      classes, theme,
      missions, selectedMission, currentPage, maxPage,
      onNextPage, onPrevPage
    } = this.props;

    if(!missions) return null;

    return (
      <>
        <div className={classes.mainContainer}>
          {
            (missions.length > 0) ?
              missions.map((mission: MissionData, i: number) => {
                return (
                  <Toolbar
                    onClick={this.onMissionSelect(i)}
                    key={`mission-${i}`}
                    className={classes.missionContainer}
                    style={{
                      backgroundColor: (mission._id === selectedMission?._id) ? theme.palette.primary.dark : ""
                    }}
                  >
                    <Typography
                      variant="body1"
                      component="p"
                      align="center"
                    >{moment(new Date(mission.creationDate)).format("DD / MMM / YYYY | hh:mm a")}</Typography>
                  </Toolbar>
                )
              })
            :
              <Toolbar className={classes.missionContainer}>
                <Typography
                  variant="body1"
                  component="p"
                  align="center"
                >No missions found</Typography>
              </Toolbar>
          }
        </div>
        <Divider className={classes.divider} variant="middle" />
        <Grid container justify="space-between" className={classes.navigationContainer}>
          <Grid item>
            <Typography
              variant="body1"
              component="p"
              align="center"
              onClick={onPrevPage}
              className={(currentPage === 0) ? classes.buttonDisabled : classes.button}
            >Previous Page</Typography>
          </Grid>
          <Grid item>
            <Typography
              variant="body1"
              component="p"
              align="center"
              onClick={onNextPage}
              className={(maxPage === currentPage) ? classes.buttonDisabled : classes.button}
            >Next Page</Typography>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MissionList);