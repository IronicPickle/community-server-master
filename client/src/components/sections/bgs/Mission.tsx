import React, { Component } from "react";
import { Theme, withStyles, Typography, Divider, Grid } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import moment from "moment";
import { MissionData, FactionData } from "../../../http_utils/HTTPMissions";

const styles = (theme: Theme) => ({
  sectionContainer: {
    padding: theme.spacing(4)
  }, 
  description: {
    whiteSpace: "pre-wrap" as "pre-wrap"
  },
  divider: {
    backgroundColor: theme.palette.secondary.dark
  }
});

interface Props {
  classes: Classes;
  mission?: MissionData;
}

class Mission extends Component<Props> {
  
  render() {
    const { classes, mission } = this.props;

    return (
      <>
        {
          (mission) ?
            <Grid container direction="column">
              <Grid item className={classes.sectionContainer}>
                <Typography
                  variant="h6"
                  component="h6"
                >Description</Typography>
                <Typography
                  variant="body1"
                  component="p"
                  className={classes.description}
                >{mission.description}</Typography>
              </Grid>
              <Divider className={classes.divider} variant="middle" />
              <Grid item className={classes.sectionContainer}>
                <Typography
                  variant="h6"
                  component="h6"
                >Objectives</Typography>
                {
                  mission.objectives.map((objective: string, i: number) => {
                    return (
                      <Typography
                        variant="body1"
                        component="p"
                        key={`objective-${i}`}
                      >{i + 1} - {objective}</Typography>
                    )
                  })
                }
              </Grid>
              <Divider className={classes.divider} variant="middle" />
              <Grid item className={classes.sectionContainer}>
                <Typography
                  variant="h6"
                  component="h6"
                >Influence</Typography>
                <Typography
                  variant="body1"
                  component="p"
                >{
                  mission.factionsData.factions.map((faction: FactionData, i: number) => {
                    const influence = Math.floor(faction.influence * 100 * 100) / 100;
                    return (
                      <span key={`faction-${i}`}>
                        {
                          (faction.id !== 81923) ?
                            (mission.factionsData.factionId === faction.id) ?
                              <u>{faction.name} - {influence}%<br/></u>
                            :
                              <>{faction.name} - {influence}%<br/></>
                          : ""
                        }
                        
                        
                      </span>
                    )
                  })
                }</Typography>
              </Grid>
              <Divider className={classes.divider} variant="middle" />
              <Grid item className={classes.sectionContainer}>
                <Typography
                  variant="h6"
                  component="h6"
                >Date Created</Typography>
                <Typography
                  variant="body1"
                  component="p"
                >{moment(new Date(mission.creationDate)).format("DD / MMM / YYYY | hh:mm a")}</Typography>
              </Grid>
            </Grid>
          : 
          <Grid container direction="column" className={classes.mainContainer}>
            <Grid item className={classes.sectionContainer}>
              <Typography
                variant="h6"
                component="h6"
              >Nothing to display</Typography>
            </Grid>
          </Grid>
        }
      </>
    );
  }
}

export default withStyles(styles)(Mission);