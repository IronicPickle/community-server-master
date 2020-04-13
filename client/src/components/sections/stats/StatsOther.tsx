import React, { Component } from "react";
import { withStyles, Theme, Paper, Typography, Divider, AppBar, Tabs, Tab, Grid, CircularProgress } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";

const styles = (theme: Theme) => ({
  statTitleContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1)
  }, statSubContainer: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2)
  }, statDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
  stats: any;
}

interface StatsI {
  tab: number;
}

class StatsOther extends Component<PropsI, StatsI> {
  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      tab: 0
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<{}>, value: any) {

    this.setState({ tab: value });

  }
  
  render() {
    const { classes, theme, stats } = this.props;
    const { tab } = this.state;

    return (
      <div>
        <Paper className={classes.statTitleContainer}>
          <Typography variant="h6" component="h6" align="center"
          >Progress</Typography>
        </Paper>
        <AppBar position="static">
          <Tabs value={tab} onChange={this.handleChange} centered={true} variant="fullWidth" aria-label="stages tabs">
            <Tab label="Figures" />
            <Tab label="Percents" />
          </Tabs>
        </AppBar>
        <Paper className={classes.statSubContainer}>
          {
            (Object.keys(stats).length > 0) ?
              <div>
                <Typography variant="body2" component="p" align="center" >
                  Total Revisions
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {stats.totalRevisions}
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Inara Names Collected
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ?
                      stats.totalInara
                    :
                    Math.floor(stats.totalInara / (stats.total / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  In-Game Names Collected
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ?
                    stats.totalInGame
                  :
                    Math.floor(stats.totalInGame / (stats.total / 100)) + "%"
                  }
                </Typography>
                <Divider className={classes.statDivider} variant="middle" />
                <Typography variant="body2" component="p" align="center" >
                  Members in Private Group
                </Typography>
                <Typography variant="subtitle1" component="p" align="center" >
                  {(tab === 0) ?
                      stats.totalGroup
                    :
                      Math.floor(stats.totalGroup / (stats.total / 100)) + "%"
                  }
                </Typography>
              </div>
            : 
              <Grid container direction="column" alignItems="center">
                <Grid item>
                  <Typography variant="subtitle2" component="p" align="center" style={{marginBottom: theme.spacing(1)}}>
                    Loading
                  </Typography>
                </Grid>
                <Grid item>
                  <CircularProgress color="secondary" />
                </Grid>
              </Grid>
          }
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(StatsOther);